#!/usr/bin/env bash

echo "Mainnet: Building..."
cp .env.mainnet .env
npm run build

echo "Mainnet: Universal link coping..."
mkdir ./build/.well-known
cp ./universal-link/mainnet ./build/.well-known/apple-app-site-association

echo "Mainnet: Repote deploying..."
scp -r ./build/* root@web.herewallet.app:/var/www/here-web
echo "Mainnet: Complete!"

echo "Testnet: Building..."
cp .env.testnet .env
npm run build

echo "Testnet: Universal link coping..."
mkdir ./build/.well-known
cp ./universal-link/testnet ./build/.well-known/apple-app-site-association

echo "Testnet: Repote deploying..."
scp -r ./build/* root@web.herewallet.app:/var/www/here-web-testnet
echo "Testnet: Complete!"
