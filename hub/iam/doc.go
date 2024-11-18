// Package iam is a library for Identity and Access Management in the Hub.
//
// # Authentication
//
// Authentication to the hub happens through third-party systems (currently OAuth, LDAP and htpasswd file).
// The result of those implementation-dependent authentication flow is a new [Session].
// The session is then automatically attached to all requests served over HTTP.
//
// # Access control
//
// At run time, access to resources is checked by the [Session.CheckAccess] function (see example use).
//
// For additional actions, or labels, developers need to edit the “default_policy” file,
// then run “go generate” to have the policy table being regenerated.
package iam

import "trout.software/kraken/webapp/hub/msg"

type Label = msg.Label
type User = msg.User
type Profile = msg.Profile
type Domain = msg.Domain
