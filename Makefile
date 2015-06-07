TESTS = test/test.js
REPORTER = spec
TIMEOUT = 10000
MOCHA_OPTS =
ISTANBUL = ./node_modules/.bin/istanbul
MOCHA = ./node_modules/.bin/_mocha

install-test:
	@NODE_ENV=test npm install

test: install-test
	@NODE_ENV=test $(MOCHA) \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(MOCHA_OPTS) \
		$(TESTS)

test-cov: install-test
	@$(ISTANBUL) cover --report html $(MOCHA) -- -R $(REPORTER) $(TESTS)
