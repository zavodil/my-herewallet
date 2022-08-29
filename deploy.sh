#!/usr/bin/env bash

echo "Deploy mainnet..."
cp .env.mainnet .env
npm run build
scp -P  222 -r ./build/* herewa@www21.your-server.de:~/public_html/web
scp -P  222 -r ./build/index.html herewa@www21.your-server.de:~/public_html/web/sign/index.html
scp -P  222 -r ./build/index.html herewa@www21.your-server.de:~/public_html/web/login/index.html

echo "Deploy testnet..."
cp .env.testnet .env
npm run build
scp -P  222 -r ./build/* herewa@www21.your-server.de:~/public_html/web-testnet
scp -P  222 -r ./build/index.html herewa@www21.your-server.de:~/public_html/web-testnet/sign/index.html
scp -P  222 -r ./build/index.html herewa@www21.your-server.de:~/public_html/web-testnet/login/index.html
