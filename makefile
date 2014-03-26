MOCHA=./node_modules/.bin/mocha
TEST_FILES=test/acceptance/*.test.js
TEST_TRIGGERS=test/acceptance/triggers/*.test.js

test-triggers:
	@$(MOCHA) --timeout 5000 --reporter spec $(TEST_TRIGGERS)

test:
	@$(MOCHA) --timeout 1000 --reporter spec $(TEST_FILES)

test-debug:
	@$(MOCHA) --debug-brk --timeout 300000000 --reporter spec $(TEST_FILES)

.PHONY: test
