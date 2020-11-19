#!/bin/bash
set -xe
: "${TEXTA_API_URL?Need an api url}"

sed -i "s#TEXTA_API_URL_REPLACE#$TEXTA_API_URL#g" /var/texta-rest/front/main*.js
sed -i "s#TEXTA_USE_UAA_REPLACE#$TEXTA_USE_UAA#g" /var/texta-rest/front/main*.js
sed -i "s#TEXTA_UAA_URL_REPLACE#$TEXTA_UAA_URL#g" /var/texta-rest/front/main*.js
sed -i "s#TEXTA_UAA_AUTH_URL_REPLACE#$TEXTA_UAA_AUTH_URL#g" /var/texta-rest/front/main*.js
sed -i "s#TEXTA_UAA_REDIRECT_URL_REPLACE#$TEXTA_UAA_REDIRECT_URL#g" /var/texta-rest/front/main*.js
sed -i "s#TEXTA_UAA_CLIENT_ID_REPLACE#$TEXTA_UAA_CLIENT_ID#g" /var/texta-rest/front/main*.js
sed -i "s#TEXTA_HOSTED_FILE_FIELD_REPLACE#$TEXTA_HOSTED_FILE_FIELD#g" /var/texta-rest/front/main*.js

exec "$@"
