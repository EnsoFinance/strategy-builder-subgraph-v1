#!/bin/bash

NETWORK=$1

if [ -z $NETWORK ]; then echo "Network not specified! (mainnet, kovan, local, ensonet, remote)"; exit 0; fi

DATA=deployments.json
echo 'Generating manifest from data file: '$DATA 'on' $1;

if [[ "$NETWORK" == "mainnet" ]]; then
    cat $DATA | node_modules/node-jq/bin/jq '.mainnet  + {"network":"mainnet","ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf","blockNumber":14220000}' | node_modules/.bin/mustache  - templates/subgraph.template.yaml > subgraph.yaml
    cat $DATA | node_modules/node-jq/bin/jq '.mainnet  + {"ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"}' |  node_modules/.bin/mustache  - templates/addresses.ts > src/addresses.ts
fi

if [[ "$NETWORK" == "kovan" ]]; then
    cat $DATA | node_modules/node-jq/bin/jq '.kovan  + {"network":"kovan","ChainlinkFeedRegistry":"0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0","blockNumber":14220000}' | node_modules/.bin/mustache  - templates/subgraph.template.yaml > subgraph.yaml 
    cat $DATA | node_modules/node-jq/bin/jq '.kovan  + {"ChainlinkFeedRegistry":"0xAa7F6f7f507457a1EE157fE97F6c7DB2BEec5cD0"}' |  node_modules/.bin/mustache  - templates/addresses.ts > src/addresses.ts
fi

if [[ "$NETWORK" == "local" ]]; then
    cat $DATA | node_modules/node-jq/bin/jq '.localhost  + {"network":"mainnet","ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf","blockNumber":14366426}' | node_modules/.bin/mustache  - templates/subgraph.template.yaml > subgraph.yaml
    cat $DATA | node_modules/node-jq/bin/jq '.localhost  + {"ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"}' |  node_modules/.bin/mustache  - templates/addresses.ts > src/addresses.ts
fi

if [[ "$NETWORK" == "ensonet" ]]; then
    REMOTE_BLOCK=$(curl -sS -X POST -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}' $ENSONET_URL | node_modules/node-jq/bin/jq ".result" | tr -d '"')
    [[ "$MODE" == "prod" ]] && BLOCK_NR="14220000" || BLOCK_NR=$(($REMOTE_BLOCK-100))
    if [[ $(curl -sSI $ENSONET_URL/api/deployments | head -n 1| cut -d$' ' -f2) == 200 ]]
    then
        until curl -sS $ENSONET_URL/api/deployments | grep "v1-core"
        do
            echo "Waiting for v1-core deployment on ensonet..."
            sleep 10
        done

        ENSONET_DEPLOYMENTS=$(curl $ENSONET_URL/api/deployments)
        echo $ENSONET_DEPLOYMENTS | node_modules/node-jq/bin/jq '."v1-core"  + {"network":"mainnet","ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf","blockNumber":'$BLOCK_NR'}' | node_modules/.bin/mustache  - templates/subgraph.template.yaml > subgraph.yaml 
        echo $ENSONET_DEPLOYMENTS | node_modules/node-jq/bin/jq '."v1-core"  + {"ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"}' | node_modules/.bin/mustache  - templates/addresses.ts > src/addresses.ts
    else
        echo "$ENSONET_URL deployments is not up!"
        exit 0;
    fi
fi

if [[ "$NETWORK" == "remote" ]]; then
    ENSONET_DEPLOYMENTS=$(curl https://testnet.enso.finance/api/deployments)
    REMOTE_BLOCK=$(curl -X POST -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}' https://testnet.enso.finance | node_modules/node-jq/bin/jq ".result" | tr -d '"')
    echo $ENSONET_DEPLOYMENTS | node_modules/node-jq/bin/jq '."v1-core"  + {"network":"mainnet","ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf","blockNumber":'$(($REMOTE_BLOCK))'}' | node_modules/.bin/mustache  - templates/subgraph.template.yaml > subgraph.yaml 
    echo $ENSONET_DEPLOYMENTS | node_modules/node-jq/bin/jq '."v1-core"  + {"ChainlinkFeedRegistry":"0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"}' | node_modules/.bin/mustache  - templates/addresses.ts > src/addresses.ts
fi
