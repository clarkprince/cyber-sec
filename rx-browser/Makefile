NODE_BIN=../node_modules/.bin
TSCFILES := $(filter-out %_test.ts %.d.ts, $(wildcard webc/*.ts utils/*.ts webc/editor/*.ts webc/editor/*/*.ts utils/pipe/pipe.ts rx/*.ts))
BROWSER_FILES := rxnb.wasm components.js main.css
WEBC_INDEX_TS := webc/index.ts
TEMPLATES := $(shell find ../hub -name *.html)

RXCHECK := $(shell which rxcheck)
ifndef RXCHECK
$(warning rx syntax check not installed. Make sure you ran make install and that ~/go/bin is in your PATH.)
endif

.PHONY: frontend clean test fmt

# frontend removes prod artifacts, in case they are lying around, and cause confusion
frontend: $(BROWSER_FILES)
	go vet -vettool=$(RXCHECK) ./...
	rm -f $(BROWSER_FILES:=.br)

rxnb.wasm: FORCE
	CGO_ENABLED=no GOOS=js GOARCH=wasm go build -trimpath -o $@ trout.software/kraken/webapp/rx-browser/datacell

FORCE: # Go handles re-compilation

webc/index.js: FORCE
	$(NODE_BIN)/tsc --sourceMap -t es2020 $(WEBC_INDEX_TS) --moduleResolution node

components.js: webc/index.js
	$(NODE_BIN)/rollup webc/index.js --file $@ -c ./rollup.config.mjs 

main.css: components.js rx/*.go datacell/*.go tailwind.css $(TEMPLATES) tailwind.config.js
	$(NODE_BIN)/tailwindcss -i tailwind.css -m -o main.css

clean:
	rm -f *.wasm *.wasm.br components.js main.css $(TSCFILES:.ts=.js) $(TSCFILES:.ts=.js.map) $(BROWSER_FILES:=.br)

compress: $(BROWSER_FILES:=.br)

%.br: %
# rm required to clean up local build
# -n required to get correct timestamps
	rm -f $@
	brotli -n $<

fmt:
	npx prettier webc --write

test: $(BROWSER_FILES)
	go vet -vettool=$(shell which rxcheck) ./...
	go vet ./...
	go test ./...
	npx prettier webc --check
	PWTEST_CACHE_DIR="/tmp/$(USER)-playwright-transform-cache/" npx playwright test