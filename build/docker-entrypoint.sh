#!/bin/bash
set -e

echo "NODE_ENV=$NODE_ENV" > .env

. "$NVM_DIR/nvm.sh" && exec "$@"