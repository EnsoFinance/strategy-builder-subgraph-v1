# Enso V1 Subgraph

Current Kovan Subgraph:
https://thegraph.com/explorer/subgraph/milonite/kenzo

Current _remote_ ✨ EnsoNet ✨ Subgraph:
http://subgraph.dev.enso.finance/subgraphs/name/ensofinance/enso-v1

## Setup and deploy on _local_ ✨ EnsoNet ✨

1. Start [✨ EnsoNet ✨](https://github.com/EnsoFinance/ensonet) (run inside cloned directory):
   _wait for v1-core deployment to finish_ & **use `MODE=dev`!**
    ```bash
    yarn
    yarn start
    ```

2. Run local subgraph node

    ```bash
    docker-compose up
    ```

3. Prepare manifest and mappings with local ✨ EnsoNet ✨ addresses

    ```bash
    yarn prepare ensonet
    ```

4. Build subgraph

    ```bash
    yarn build
    ```

5. Deploy subgraph

    ```bash
    yarn deploy:local
    ```

6. Seed subgraph (run inside ✨ EnsoNet ✨ directory)

    ```bash
    export $(grep -v '^#' .env | xargs)
    cd repos/v1-core
    yarn fill-ui
    ```

## Setup and deploy on kovan

1. Authenticate

    ```bash
    graph auth <TOKEN>
    ```

2. Prepare manifest and mappings with kovan addresses

    ```bash
    yarn prepare kovan
    ```

3. Build subgraph

    ```bash
    yarn build
    ```

4. Deploy subgraph

    ```bash
    yarn deploy:kovan
    ```
