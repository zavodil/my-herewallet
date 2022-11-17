#!/usr/bin/env bash

echo "Mainnet: Building..."
cp .env.mainnet .env
npm run build

echo "Mainnet: Repote deploying..."
scp ./universal-link/mainnet root@web.herewallet.app:/var/www/here-web/.well-known/apple-app-site-association
scp -r ./build/* root@web.herewallet.app:/var/www/here-web
echo "Mainnet: Complete!"

echo "Testnet: Building..."
cp .env.testnet .env
npm run build

echo "Testnet: Repote deploying..."
scp ./universal-link/testnet root@web.herewallet.app:/var/www/here-web/.well-known/apple-app-site-association
scp -r ./build/* root@web.herewallet.app:/var/www/here-web-testnet
echo "Testnet: Complete!"
