#!/usr/bin/env bash

echo "Deploy mainnet..."
cp .env.mainnet .env
npm run build
scp -r ./build/* root@web.herewallet.app:/var/www/here-web

echo "Deploy testnet..."
cp .env.testnet .env
npm run build
scp -r ./build/* root@web.herewallet.app:/var/www/here-web-testnet

