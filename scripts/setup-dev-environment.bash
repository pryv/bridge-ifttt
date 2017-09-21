#!/bin/bash

# Sets up the dev environment on a 64-bit OSX system.
# Re-run to update e.g. the node version (from the new default) or the JSHint config (from the master).

#
# working dir fix
SCRIPT_FOLDER=$(cd $(dirname "$0"); pwd)
cd $SCRIPT_FOLDER/..

export NODE_VERSION=v0.10.23

export REDIS_NAME=redis-2.6.14
export REDIS_BASE_FOLDER=../
export REDIS_DATA_FOLDER=${REDIS_BASE_FOLDER}/redis-data

# base

curl -s https://raw.github.com/pryv/dev-scripts/master/setup-repo-copy.js-node.bash | bash
EXIT_CODE=$?
if [[ ${EXIT_CODE} -ne 0 ]]; then
  echo ""
  echo "Error: base setup failed. Setup aborted."
  echo ""
  exit $((${EXIT_CODE}))
fi

# database

$SCRIPT_FOLDER/../db/setup-database.bash
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
