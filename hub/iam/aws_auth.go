package iam

import (
	"context"
	"errors"
	"fmt"
	"runtime/trace"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sts"
	"golang.org/x/oauth2"
	"trout.software/kraken/webapp/hub/tasks"
)

// WebIdentityCredentialsProvider bridges between OAuth2 token and AWS credentials provider.
type WebIdentityCredentialsProvider struct {
	Role, Region string

	Session *Session
}

var credsCache = lru[*oauth2.Token](400)
var mxCache sync.Mutex

func (p WebIdentityCredentialsProvider) Retrieve(ctx context.Context) (aws.Credentials, error) {
	defer trace.StartRegion(ctx, "aws_retriev_creds").End()

	mxCache.Lock()
	defer mxCache.Unlock()

	tasks.Annotate(ctx, "aws-region", p.Region)
	cfg, err := config.LoadDefaultConfig(
		ctx,
		config.WithRegion(p.Region))
	if err != nil {
		return aws.Credentials{}, err
	}

	// TODO(rdo) understand if we need a nonce here
	tok, err := p.Session.Token()
	if err != nil {
		return aws.Credentials{}, fmt.Errorf("error retrieving token: %w", err)
	}
	cached, ok := credsCache.Get(tok)
	if ok && !cached.(aws.Credentials).Expired() {
		tasks.Annotate(ctx, "creds-cache", "hit")
		tasks.Annotate(ctx, "creds-expire", cached.(aws.Credentials).Expires)
		return cached.(aws.Credentials), nil
	}
	tasks.Annotate(ctx, "creds-cache", "miss")

	// TODO(rdo) look at https://pkg.go.dev/github.com/aws/aws-sdk-go-v2/aws#CredentialsCache
	var maxexp = 3600 // seconds
	if !tok.Expiry.IsZero() {
		maxexp = int(time.Until(tok.Expiry) / time.Second)
	}
	tasks.Annotate(ctx, "creds-maxexp", maxexp)

	resp, err := sts.NewFromConfig(cfg).AssumeRoleWithWebIdentity(ctx, &sts.AssumeRoleWithWebIdentityInput{
		DurationSeconds:  aws.Int32(int32(maxexp)),
		RoleArn:          aws.String(p.Role),
		RoleSessionName:  aws.String(p.Session.UserName),
		WebIdentityToken: aws.String(tok.Extra("id_token").(string)),
	})
	if err != nil {
		return aws.Credentials{}, err
	}

	creds := aws.Credentials{
		AccessKeyID:     *resp.Credentials.AccessKeyId,
		SecretAccessKey: *resp.Credentials.SecretAccessKey,
		SessionToken:    *resp.Credentials.SessionToken,
		CanExpire:       true,
		Expires:         *resp.Credentials.Expiration,
	}
	tasks.Annotate(ctx, "creds-expire", creds.Expires)

	credsCache.Add(tok, creds)
	return creds, err
}

func IsOAuthError(e error) bool {
	return errors.Is(oauthError{}, e)
}

type oauthError struct{}

func (o oauthError) Error() string {
	return "oauthError"
}

func (o oauthError) Is(e error) bool {
	return strings.Contains(e.Error(), "error retrieving token")
}
