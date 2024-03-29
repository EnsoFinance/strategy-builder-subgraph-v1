# Enso V1 Subgraph

Current Kovan Subgraph:
https://thegraph.com/explorer/subgraph/ensofinance/enso-v1

Current _remote_ ✨ EnsoNet ✨ Subgraph:
http://subgraph.dev.enso.finance/subgraphs/name/ensofinance/enso-v1


## :warning: Deprecated Codebase :warning:
This codebase has been deprecated.  Use this code at your own risk, and Enso does not take any responsibility for vulnerabilities or any impact thereafter from learning/utilizing this codebase.

## Setup and deploy on ✨ EnsoNet ✨

❗️ Link your github ssh key to `~/.ssh/ensonet` (or use the service account's key) ❗️

- **local** ✨ EnsoNet ✨ -> `MODE=dev`
- **remote** ✨ EnsoNet ✨ -> `MODE=prod`

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

### Get Subgraph Logs

   ```bash
    curl --location --request POST 'https://thegraph.com/hosted-service/subgraph/graphql' --data-raw '{"query":"{indexingStatusForCurrentVersion(subgraphName: \"ensofinance/enso-v1\") { subgraph fatalError { message } nonFatalErrors {message } } }"}' | jq
   ```
