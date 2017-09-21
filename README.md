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

| Command                    | Purpose                           |
| -------------------------- | --------------------------------- |
| `node lib/server.js`       | Runs the IFTTT server             |
| `redis-server --port 7379` | Runs the redis server (port 7379) |
| `node_modules/.bin/flow`   | Runs the flow type checker        |
| `yarn run publish`         | Compiles Flow code to JS (/lib)   |




