#!/usr/bin/env bash

rm -rf ./parcel-cache
rm -rf ./dist
npm run build
scp -r ./dist/* fedor@web.herewallet.app:/var/www/here/my
