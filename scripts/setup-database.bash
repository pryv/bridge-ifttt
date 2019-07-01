#!/bin/bash

# Sets up Redis (engine and data) for the registration server.
# Meant to be run from dev env setup script.

if [[ -z "$REDIS_NAME" ]] || [[ -z "$REDIS_BASE_FOLDER" ]] || [[ -z "$REDIS_DATA_FOLDER" ]]; then
  echo ""
  echo "Expected environment variables: 'REDIS_NAME', 'REDIS_BASE_FOLDER', 'REDIS_DATA_FOLDER'"
  echo ""
  exit 1
fi

# working dir fix
SCRIPT_FOLDER=$(cd $(dirname "$0"); pwd)
cd $SCRIPT_FOLDER/

if [[ ! -d $REDIS_BASE_FOLDER ]]; then
  mkdir -p $REDIS_BASE_FOLDER
  if [[ $? -ne 0 ]]; then
    echo ""
    echo "Could not create '$REDIS_BASE_FOLDER'. Setup aborted."
    echo ""
    exit $((${EXIT_CODE}))
  fi
fi

if [[ ! -d $REDIS_DATA_FOLDER ]]; then
  EXIT_CODE=0
  mkdir -p $REDIS_DATA_FOLDER
  EXIT_CODE=`expr ${EXIT_CODE} + $?`
  chown `id -u` $REDIS_DATA_FOLDER
  EXIT_CODE=`expr ${EXIT_CODE} + $?`
  if [[ ${EXIT_CODE} -ne 0 ]]; then
    echo ""
    echo "Could not create '$REDIS_DATA_FOLDER'. Setup aborted."
    echo ""
    exit $((${EXIT_CODE}))
  fi
fi

echo ""
echo "Checking for Redis ($REDIS_BASE_FOLDER/$REDIS_NAME)..."
if [[ ! -d $REDIS_BASE_FOLDER/$REDIS_NAME ]]; then
  echo "...installing $REDIS_NAME"
  echo ""
  cd $REDIS_BASE_FOLDER
  EXIT_CODE=0

  redis_url="http://download.redis.io/releases/${REDIS_NAME}.tar.gz"

  curl -o "$REDIS_NAME.tar.gz" $redis_url
  EXIT_CODE=`expr ${EXIT_CODE} + $?`
  tar -xzf $REDIS_NAME.tar.gz
  EXIT_CODE=`expr ${EXIT_CODE} + $?`
  cd $REDIS_NAME
  make
  EXIT_CODE=`expr ${EXIT_CODE} + $?`
  cd ..
  rm $REDIS_NAME.tar.gz
  if [[ ${EXIT_CODE} -ne 0 ]]; then
    echo ""
    echo "Failed installing Redis. Setup aborted."
    echo ""
    exit $((${EXIT_CODE}))
  fi
else
  echo "...skipped: $REDIS_NAME already installed"
fi

echo ""
echo "Database setup complete."
echo ""
echo "To run Redis:"
echo "    $REDIS_BASE_FOLDER/$REDIS_NAME/src/redis-server [<configuration file>]"
echo ""
