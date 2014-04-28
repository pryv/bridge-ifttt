MOCHA=./node_modules/.bin/mocha
TEST_FILES=test/acceptance/*.test.js
TEST_TRIGGERS=test/acceptance/triggers/*.test.js
TEST_ACTIONS=test/acceptance/actions/*.test.js


ifdef TEST
	TEST_FILES=test/acceptance/$(TEST).test.js
else
	TEST_FILES=test/acceptance/*.test.js test/acceptance/*/*.test.js
endif


test:
	@$(MOCHA) --timeout 1000 --reporter spec $(TEST_FILES)

test-debug:
	@$(MOCHA) --debug-brk --timeout 300000000 --reporter spec $(TEST_FILES)

.PHONY: test
