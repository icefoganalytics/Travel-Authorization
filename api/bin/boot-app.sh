#!/bin/sh

if [ "$NODE_ENV" != "production" ]; then
  # Run initializers in development
  # Keep in sync with api/tests/global-setup.ts
  npm run ts-node -- --files src/initializers/index.ts
else
  # Run initializers in production
  node ./dist/initializers/index.js
fi

# Start the application
if [ "$NODE_ENV" != "production" ]; then
  npm run start
else
  node ./dist/server.js
fi
