# bridge-ifttt

IFTTT gateway

## Setup

Prerequisites: 

* Redis 2.6.13
* Node 8.X
* Yarn 0.27.X

Fetch the dependencies using `yarn install`

## Hacking

Useful commands while working with this project: 

| Command                           | Purpose                           |
| --------------------------------- | --------------------------------- |
| `yarn watch`                      | Transpiles code into dist         |
| `yarn database`                   | Runs the redis server (port 7379) |
| `yarn start`                      | Runs the IFTTT server             |
| `yarn test`                       | Runs the test suite               |
| `node_modules/.bin/eslint source` | ESLint check all of source        |

Here are two aliases that might be useful during the work on this project: 

```shell
alias m="ne mocha --compilers js:babel-register test/**/*.test.js"
alias ma="ne mocha --compilers js:babel-register"
```

Call 'm' to run all the tests in the project and 'ma' to specify which file to start at, like so: 

~~~shell
ma test/acceptance/status.test.js
~~~

