# Enso V1 Subgraph- Kovan -

## Subgraph URL

Current Kovan Subgraph:
https://thegraph.com/explorer/subgraph/milonite/kenzo

HTTP
https://api.thegraph.com/subgraphs/name/milonite/kenzo

## Running Locally

Compile the contracts to generate the ABI.
Make sure to update package.json settings to point to your own graph account and local node.

## Setup and deploy on kovan

Authenticate

```bash
graph auth <TOKEN>
```

Code generator

```bash
yarn codegen

```

Prepare manifest and mappings with kovan addresses

```bash
yarn prepare:kovan

```

Build subgraph

```bash
yarn build

```

Deploy subgraph

```bash
yarn deploy:kovan
```

## Setup and deploy on remote fork

Prepare manifest and mappings with kovan addresses

```bash
yarn prepare:remote

```

Build subgraph

```bash
yarn build

```

Deploy subgraph

```bash
yarn deploy:remote
```
