#!/bin/bash

if [[ -f ".env" ]]; then
    export $(grep -v '^#' .env | xargs)
fi

if [[ "$MODE" == "dev" ]]
then
    docker-compose stop graph-node
    docker-compose stop ipfs
    docker-compose stop postgres
    docker-compose rm -v --force graph-node
    docker-compose rm -v --force ipfs
    docker-compose rm -v --force postgres

    docker-compose up -d ensonet
    until curl -sS $ENSONET_URL/api/deployments | grep "v1-core"
    do
        echo "Waiting for v1-core deployment on ensonet..."
        sleep 10
    done
    docker-compose up -d postgres ipfs graph-node
    docker-compose up deploy-subgraph

elif [[ "$MODE" == "prod" ]]
then
    docker-compose -f docker-compose.prod.yml down -v

    until curl -sS $ENSONET_URL/api/deployments | grep "v1-core"
    do
        echo "Waiting for v1-core deployment on ensonet..."
        sleep 10
    done

    docker-compose -f docker-compose.prod.yml up -d
else
    echo "env var MODE not set!"
    exit 1
fi
