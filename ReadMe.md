# Enso V1 Subgraph

Current Kovan Subgraph:
https://thegraph.com/explorer/subgraph/milonite/kenzo

Current _remote_ ✨ EnsoNet ✨ Subgraph:
http://subgraph.dev.enso.finance/subgraphs/name/ensofinance/enso-v1

## Setup and deploy on ✨ EnsoNet ✨

❗️ Link your github ssh key to `~/.ssh/ensonet` (or use the service account's key) ❗️

* **local** ✨ EnsoNet ✨ -> `MODE=dev`
* **remote** ✨ EnsoNet ✨ -> `MODE=prod`

✅ `yarn start` ✅

### Fast iteration

1. export env variables: `export $(grep -v '^#' .env | xargs)`
2. run prepare command: `yarn prepare ensonet`
3. run build & compile command: `yarn build:graph`
4. run deploy command: `yarn deploy:local`

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
    yarn build:graph
    ```

4. Deploy subgraph

    ```bash
    yarn deploy:kovan
    ```
