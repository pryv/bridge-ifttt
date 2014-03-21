MOCHA=./node_modules/.bin/mocha
TEST_FILES=test/acceptance/oauth2*test.js

test:
	@$(MOCHA) --timeout 1000 --reporter spec $(TEST_FILES)

test-debug:
	@$(MOCHA) --debug-brk --timeout 300000000 --reporter spec $(TEST_FILES)

.PHONY: test