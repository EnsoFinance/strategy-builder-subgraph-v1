#!/bin/bash

if [[ -f ".env" ]]; then
    export $(grep -v '^#' .env | xargs)
fi

if [[ "$MODE" == "dev" ]]
then

    ENSONET_RUNNING=`docker compose ps ensonet | grep healthy`
    if [[ "$ENSONET_RUNNING" != "" ]]; 
    then
        docker-compose stop graph-node
        docker-compose stop ipfs
        docker-compose stop postgres
        docker-compose rm -v --force graph-node
        docker-compose rm -v --force ipfs
        docker-compose rm -v --force postgres
        docker-compose up -d postgres ipfs graph-node
        docker-compose up deploy-subgraph
    else
        docker-compose up -d
    fi

elif [[ "$MODE" == "prod" ]]
then
    docker-compose -f docker-compose.prod.yml up -d
else
    echo "env var MODE not set!"
    exit 1
fi
