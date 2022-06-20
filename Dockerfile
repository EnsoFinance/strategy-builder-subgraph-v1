FROM node:16-alpine

# Add system dependencies
RUN apk add libsecret-dev bash git curl

# Copy the source files into the image
WORKDIR /app
COPY . .

ARG PUID=1000
ARG PGID=1000
RUN adduser -H -u ${PUID} -g ${PGID} -D enso-subgraph
RUN mkdir -p /home/enso-subgraph
RUN chown -R enso-subgraph:enso-subgraph /home/enso-subgraph

USER enso-subgraph

# Download dependencies
RUN yarn --frozen-lockfile

CMD ["sh", "-c", "yarn prepare mainnet && yarn build:graph && yarn deploy:local"]
