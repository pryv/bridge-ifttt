# bridge-ifttt

IFTTT gateway

## Setup

Prerequisites: 

* Redis 2.6.13
* Node 8.X

Run the server using 

    $ node source/server.js
after starting redis. 

## Hacking

Useful commands while working with this project: 

| Command                           | Purpose                           |
| --------------------------------- | --------------------------------- |
| `node lib/server.js`              | Runs the IFTTT server             |
| `redis-server --port 7379`        | Runs the redis server (port 7379) |
| `node_modules/.bin/flow`          | Runs the flow type checker        |
| `node_modules/.bin/eslint source` | ESLint check all of source        |
| `yarn run publish`                | Compiles Flow code to JS (/lib)   |

Here are two aliases that might be useful during the work on this project: 

```shell
alias m="ne mocha --compilers js:babel-register test/**/*.test.js"
alias ma="ne mocha --compilers js:babel-register"
```

Call 'm' to run all the tests in the project and 'ma' to specify which file to start at, like so: 

~~~shell
ma test/acceptance/status.test.js
~~~

