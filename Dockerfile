FROM node:16-alpine

# Add system dependencies
RUN apk add libsecret-dev bash git curl

# Copy the source files into the image
WORKDIR /app
COPY . .

# Change user
RUN chown node:node /app -R
USER node

# Download dependencies
RUN yarn --frozen-lockfile

CMD ["sh", "-c", "yarn prepare mainnet && yarn build:graph && yarn deploy:local"]
