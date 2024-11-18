#!/bin/sh
#
# cross-compile to Centos6 machine
# environment set-up as per https://www.notion.so/trout-software/Sustainability-Engineering-7b005d66f4174b3aa44f6d0bc8b558d6?pvs=4#a7e1ac23ba5542f3b74b00c68dc784d2
#
# do not use unless explicitly required; instead a fresh Ubuntu 20.04 should be used

make clean
make -j 8 -C rx-browser compress
rsync --exclude .svn -avh . centos6:/srv/securityhub --delete
ssh centos6 << EOF
export PATH=\$PATH:/opt/rh/devtoolset-2/root/usr/bin/
cd /srv/securityhub
CGO_LDFLAGS='-static' go build -tags osusergo,netgo -trimpath  -ldflags='-X trout.software/kraken/webapp/hub.Version=${BUILD_NUMBER}' -o webapp cmd/devserver/main.go
EOF
scp centos6:/srv/securityhub/webapp webapp
zip -x '*.svn*' -r "securityhub_amd64_${BUILD_NUMBER}.zip" webapp static rx-browser/rxnb.wasm rx-browser/components.js rx-browser/main.css
