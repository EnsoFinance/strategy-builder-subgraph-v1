#!/bin/bash

NETWORK=$1

DATA=deployments.json

echo 'Generating manifest from data file: '$DATA 'on' $1;

if [[ "$NETWORK" == "mainnet" ]]; then
    cat $DATA | node_modules/node-jq/bin/jq '.mainnet  + {"network":"mainnet","ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"}' | node_modules/.bin/mustache  - templates/subgraph.template.yaml > subgraph.yaml
    cat $DATA | node_modules/node-jq/bin/jq '.mainnet  + {"ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"}' |  node_modules/.bin/mustache  - templates/addresses.ts > src/addresses.ts
fi

if [[ "$NETWORK" == "kovan" ]]; then
    cat $DATA | node_modules/node-jq/bin/jq '.kovan  + {"network":"kovan","ChainlinkFeedRegistry":"0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0"}' | node_modules/.bin/mustache  - templates/subgraph.template.yaml > subgraph.yaml 
    cat $DATA | node_modules/node-jq/bin/jq '.kovan  + {"ChainlinkFeedRegistry":"0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0"}' |  node_modules/.bin/mustache  - templates/addresses.ts > src/addresses.ts
fi

if [[ "$NETWORK" == "remote" ]]; then
    ENSONET_DEPLOYMENTS=$(curl http://18.223.196.75/api/deployments)
    echo $ENSONET_DEPLOYMENTS | node_modules/node-jq/bin/jq '."v1-core"  + {"network":"mainnet","ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"}' | node_modules/.bin/mustache  - templates/subgraph.template.yaml > subgraph.yaml 
    echo $ENSONET_DEPLOYMENTS | node_modules/node-jq/bin/jq '."v1-core"  + {"ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"}' | node_modules/.bin/mustache  - templates/addresses.ts > src/addresses.ts
fi
