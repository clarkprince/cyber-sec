//go:build ignore

package logstream

import (
	"context"
	"encoding/base64"
	"io"
	"testing"
	"time"

	"golang.org/x/crypto/ssh"
	"trout.software/kraken/webapp/hub/iam"
)

func TestSFTPDS(t *testing.T) {
	t.Skip("in progress")
	var s = &SFTP{
		Path:            "readme",
		UserAndHostName: "ubuntu@192.168.46.208:22",
		PubKey:          []byte(`ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINZoryZBcl7boa5YTAO9dHcw2ADcrOXovSkuo/Uh2emn root@serverTest`),
	}

	prvKey := []byte(`-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACAq5sGKZdEkcztBbeH79gDqbhze69PxXpCo9HJfR2LqgAAAAJjcMkP43DJD
+AAAAAtzc2gtZWQyNTUxOQAAACAq5sGKZdEkcztBbeH79gDqbhze69PxXpCo9HJfR2LqgA
AAAED72iVM4kDCdzYHHAAocbTlt3qa8rFyXkdNB0vJhp8XsirmwYpl0SRzO0Ft4fv2AOpu
HN7r0/FekKj0cl9HYuqAAAAADnVidW50dUBwcmltYXJ5AQIDBAUGBw==
-----END OPENSSH PRIVATE KEY-----`)
	identity, err := ssh.ParsePrivateKey(prvKey)
	if err != nil {
		t.Fatal(err)
	}

	public := identity.PublicKey()
	t.Log("[Public key] add this to remote: " + public.Type() + " " + base64.StdEncoding.EncodeToString(public.Marshal()))

	signers := map[string]ssh.Signer{"sftp": identity}
	if err := s.Test(context.Background(), iam.Session{Signers: signers}); err != nil {
		t.Fatal(err)
	}
}
func TestGlobSFTPDS(t *testing.T) {
	t.Skip("do your own set up and test it!")

	countNotAMatch.Store(0)
	countGoRoutines.Store(0)
	countNotClosedDirectories.Store(0)
	countPoppedElements.Store(0)
	countServedSegments.Store(0)
	countFilesToBeCollected.Store(0)
	countFilesAccessDenied.Store(0)

	var s = &SFTP{
		Path:            "readme/*/hello/leti*.txt",
		UserAndHostName: "ubuntu@172.31.69.1:22",
		PubKey:          []byte(`ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINZoryZBcl7boa5YTAO9dHcw2ADcrOXovSkuo/Uh2emn root@serverTest`),
	}

	prvKey := []byte(`-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACAq5sGKZdEkcztBbeH79gDqbhze69PxXpCo9HJfR2LqgAAAAJjcMkP43DJD
+AAAAAtzc2gtZWQyNTUxOQAAACAq5sGKZdEkcztBbeH79gDqbhze69PxXpCo9HJfR2LqgA
AAAED72iVM4kDCdzYHHAAocbTlt3qa8rFyXkdNB0vJhp8XsirmwYpl0SRzO0Ft4fv2AOpu
HN7r0/FekKj0cl9HYuqAAAAADnVidW50dUBwcmltYXJ5AQIDBAUGBw==
-----END OPENSSH PRIVATE KEY-----`)
	identity, err := ssh.ParsePrivateKey(prvKey)
	if err != nil {
		t.Fatal(err)
	}

	public := identity.PublicKey()
	t.Log("[Public key] add this to remote: " + public.Type() + " " + base64.StdEncoding.EncodeToString(public.Marshal()))

	signers := map[string]ssh.Signer{"sftp": identity}
	d, err := s.Connect(&iam.Session{Signers: signers})
	if err != nil {
		t.Fatal(err)
	}

	files, err := d.Glob("")
	if err != nil && err != io.EOF {
		t.Fatal(err)
	}

	if countNotClosedDirectories.Load() != 0 {
		t.Fatal("all opened directories should have been closed", countNotClosedDirectories.Load())
	}
	t.Log("number of files found", len(files))
	t.Log("not a match", countNotAMatch.Load())
	t.Log("active go routines", countGoRoutines.Load())
	t.Log("popped elements", countPoppedElements.Load())
	t.Log("served segmets", countServedSegments.Load())
	t.Log("files to be collected", countFilesToBeCollected.Load())
	t.Log("Acess Denied files", countFilesAccessDenied.Load())
	time.Sleep(10 * time.Second)
}

func TestMatch(t *testing.T) {
	var cases = []struct {
		pattern string
		dir     string
		want    bool
	}{
		{"readme/*/hello/leti*.txt", "readme/otro", true},
		{"logs/eu/**", "logs/eu/march", true},
		{"logs/eu/**/*app.log", "logs/eu/march", true},
		{"*", "logs/", false},
		{"*", "logs", true},
		{"/logs/eu/**", "logs/eu/march", false},
		{"/", "p", false},
		{"logs/eu/**", "logs/eu/march/fiesta", false},
		{"/*/log.txt", "/", true},
	}

	for _, c := range cases {
		g, err := match(c.pattern, c.dir)
		if err != nil {
			t.Fatal(err)
		}
		if g != c.want {
			t.Fatalf("got %v want %v", g, c.want)
		}
	}
}
