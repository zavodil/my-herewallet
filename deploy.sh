#!/usr/bin/env bash

rm -rf ./parcel-cache
rm -rf ./dist
npm run build
scp -r ./dist/* root@web.herewallet.app:/var/www/here-connect
