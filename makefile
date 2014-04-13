MOCHA=./node_modules/.bin/mocha
TEST_FILES=test/acceptance/*.test.js
TEST_TRIGGERS=test/acceptance/triggers/*.test.js
TEST_ACTIONS=test/acceptance/actions/*.test.js


test-actions:
	@$(MOCHA) --timeout 20000 --reporter spec $(TEST_ACTIONS)

test-actions-debug:
	@$(MOCHA) --debug-brk --timeout 20000 --reporter spec $(TEST_ACTIONS)

test-triggers:
	@$(MOCHA) --timeout 20000 --reporter spec $(TEST_TRIGGERS)

test:
	@$(MOCHA) --timeout 1000 --reporter spec $(TEST_FILES)

test-debug:
	@$(MOCHA) --debug-brk --timeout 300000000 --reporter spec $(TEST_FILES)

.PHONY: test
