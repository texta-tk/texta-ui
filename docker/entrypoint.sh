#!/bin/bash
set -xe
: "${TEXTA_API_URL?Need an api url}"

sed -i "s#REST_API_URL_REPLACE#$TEXTA_API_URL#g" /usr/share/nginx/html/main*.js

exec "$@"
