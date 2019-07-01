#!/bin/bash

# Sets up the dev environment on a 64-bit OSX system.
# Re-run to update e.g. the node version (from the new default) or the JSHint config (from the master).

# working dir fix
SCRIPT_FOLDER=$(cd $(dirname "$0"); pwd)
cd $SCRIPT_FOLDER/..

export REDIS_NAME=redis-5.0.2
export REDIS_BASE_FOLDER=..
export REDIS_DATA_FOLDER=${REDIS_BASE_FOLDER}/redis-data
# database

$SCRIPT_FOLDER/setup-database.bash
EXIT_CODE=$?
if [[ ${EXIT_CODE} -ne 0 ]]; then
  echo ""
  echo "Error setting up database; setup aborted"
  echo ""
  exit ${EXIT_CODE}
fi


echo ""
echo "Setup complete!"
echo ""
