#!/bin/bash

export TEXTA_UAA_URL="${TEXTA_UAA_URL:-http://localhost:8080/uaa}"

# wait for server to start
until $(curl --output /dev/null --silent --head --fail "$TEXTA_UAA_URL"); do
    echo "Waiting for UAA server to run."
    sleep 5
done
echo "UAA server running."

export TEXTA_HEALTH_URL="${TEXTA_HEALTH_URL:-http://texta-rest/api/v1/health/}"

# wait for server to start
until $(curl --output /dev/null --silent --head --fail "$TEXTA_HEALTH_URL"); do
    echo "Waiting for texta-rest backend."
    sleep 5
done
echo "texta-rest backend running."
