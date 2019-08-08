# bridge-ifttt

IFTTT gateway

## Setup

Prerequisites:

* Redis 2.6.13
* Node 8.X
* Yarn 1.X

Fetch the dependencies using `yarn install`

## Hacking

Useful commands while working with this project: 

| Command                           | Purpose                           |
| --------------------------------- | --------------------------------- |
| `yarn release`                    | Transpiles code into dist once    |
| `yarn watch`                      | Transpiles code into dist         |
| `yarn database`                   | Runs the redis server (port 7379) |
| `yarn start`                      | Runs the IFTTT server             |
| `yarn test`                       | Runs the test suite               |
| `yarn lint`                       | ESLint check all of source        |
