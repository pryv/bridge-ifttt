#!/bin/sh

# working dir fix
SCRIPT_FOLDER=$(cd $(dirname "$0"); pwd)
cd $SCRIPT_FOLDER

../redis-2.6.14/src/redis-cli -a MyRecordedLife -p 7379
