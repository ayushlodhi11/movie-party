#!/bin/bash -l
BUILD=${1:-latest}
DIR=$(dirname $0)
docker build -t asia.gcr.io/gocomet-deployment/movie-party:$BUILD -f $DIR/Dockerfile $DIR/..
