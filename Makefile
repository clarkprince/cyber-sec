STABILITY := $(shell which stability)
ifndef STABILITY
$(warning serialization stability check not installed. Make sure you ran make install and that ~/go/bin is in your PATH.)
endif

ifndef $(BUILD_NUMBER)
BUILD_NUMBER := $(shell svn info --show-item revision)+custom
endif

export PATH := $(HOME)/go/bin:$(PATH)

.PHONY: clean test server aarch64 rpi install rx devserver

pre-commit:
	go fmt ./...
	$(MAKE) test
	go vet -vettool $(STABILITY) ./...

# will be removed in Go 1.22
# https://go.dev/blog/loopvar-preview
export GOEXPERIMENT=loopvar
test:
	go test ./...
	$(MAKE) -C rx-browser test
	$(MAKE) -C hub_test test

clean:
	go mod tidy
	npm prune
	rm -f internal/parser/*.png
	rm -f webapp securityhub_*.zip
	rm -f kraken-trout-test.example.net*
	go clean ./...
	$(MAKE) -C rx-browser clean

install:
	npm i
	go install trout.software/kraken/webapp/rx-browser/utils/rxcheck
	go install ./internal/sqlite/cmd/stability
	go install ./internal/sqlite/cmd/constrainer
	go install ./cmd/rxabi
	go install golang.org/x/tools/cmd/stringer@latest
	npx playwright install chromium
	[ -d $(HOME)/.pki/nssdb ] || (mkdir -p $(HOME)/.pki/nssdb; certutil -N -d $(HOME)/.pki/nssdb --empty-password)
	mkcert -install

ARCH := $(shell go env GOARCH)
BROWSERAPP := rx-browser/rxnb.wasm.br rx-browser/components.js.br rx-browser/main.css.br rx-browser/static # in sync with webc

server:
	CGO_LDFLAGS='-static' go build $(GOEXTRA) -tags osusergo,netgo -trimpath  -ldflags="-X trout.software/kraken/webapp/hub.Version=$(BUILD_NUMBER)" -o webapp cmd/devserver/main.go
	$(MAKE) -C rx-browser compress
	chmod -R 755 $(BROWSERAPP)
	zip -x '*.svn*' -rn .br securityhub_$(ARCH)_$(BUILD_NUMBER).zip webapp $(BROWSERAPP)

devserver: test
	go build -race -o webapp cmd/devserver/main.go

aarch64:
	$(MAKE) server GOOS=linux GOARCH=arm64 CC=aarch64-linux-gnu-gcc CGO_ENABLED=1 ARCH=arm64

rpi:
	$(MAKE) server GOARM=7 GOOS=linux GOARCH=arm CC=arm-linux-gnueabihf-gcc CGO_ENABLED=1 ARCH=arm7

rx:
	$(MAKE) -C rx-browser 