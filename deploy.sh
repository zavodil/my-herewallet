#!/usr/bin/env bash

npm run build
scp -r ./dist/* root@web.herewallet.app:/var/www/here-connect
