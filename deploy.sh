#!/usr/bin/env bash

npm run build
scp -r ./build/* root@web.herewallet.app:/var/www/here-connect
