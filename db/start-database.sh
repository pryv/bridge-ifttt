#!/bin/sh

# working dir fix
SCRIPT_FOLDER=$(cd $(dirname "$0"); pwd)
cd $SCRIPT_FOLDER

../redis-2.6.13/src/redis-server ./dev.conf
