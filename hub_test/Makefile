NODE_BIN := ../node_modules/.bin

.PHONY: test fmt

test: clean
	npx prettier . --check
	PWTEST_CACHE_DIR="/tmp/$(USER)-playwright-transform-cache/" npx playwright test

fmt:
	npx prettier . --write

clean:
	rm -f ../kraken-trout-test.example.net*
	rm -f ../.pkey-trout-test.example.net
