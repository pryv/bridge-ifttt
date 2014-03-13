MOCHA=./node_modules/.bin/mocha
TEST_FILES=test/acceptance/*test.js

test:
	@$(MOCHA) --timeout 1000 --reporter spec $(TEST_FILES)

.PHONY: test