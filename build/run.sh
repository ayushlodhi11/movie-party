#!/bin/bash
set -e
RAILS_ENV=${RAILS_ENV:-development}
#docker run --rm -e RAILS_ENV=$RAILS_ENV -v $(PWD):/usr/src/app -p 3500:3000 --name movie-party asia.gcr.io/gocomet-deployment/movie-party $@
docker run --rm -e RAILS_ENV=$RAILS_ENV -e PORT=3000 -p 3500:3000 --name movie-party asia.gcr.io/gocomet-deployment/movie-party $@
