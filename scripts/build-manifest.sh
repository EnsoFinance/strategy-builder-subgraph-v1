#!/bin/bash

NETWORK=$1

DATA=deployments.json

echo 'Generating manifest from data file: '$DATA 'on' $1;

if [[ "$NETWORK" == "mainnet" ]]; then
    cat $DATA | jq '.mainnet  + {"network":"mainnet","ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"}' | mustache  - templates/subgraph.template.yaml > subgraph.yaml
    cat $DATA | jq '.mainnet  + {"ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"}' |  mustache  - templates/addresses.ts > src/addresses.ts
fi

if [[ "$NETWORK" == "kovan" ]]; then
    cat $DATA | jq '.kovan  + {"network":"kovan","ChainlinkFeedRegistry":"0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0"}' | mustache  - templates/subgraph.template.yaml > subgraph.yaml 
    cat $DATA | jq '.kovan  + {"ChainlinkFeedRegistry":"0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0"}' |  mustache  - templates/addresses.ts > src/addresses.ts
fi

if [[ "$NETWORK" == "remote" ]]; then
    ENSONET_DEPLOYMENTS=$(curl http://3.144.40.241/api/deployments)
    echo $ENSONET_DEPLOYMENTS | jq '."v1-core"  + {"network":"mainnet","ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"}' | mustache  - templates/subgraph.template.yaml > subgraph.yaml 
    echo $ENSONET_DEPLOYMENTS | jq '."v1-core"  + {"ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"}' |  mustache  - templates/addresses.ts > src/addresses.ts
fi
