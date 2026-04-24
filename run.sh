#!/bin/bash

# Variables d'environnement par défaut
export DHOST="${DHOST:-digital.ambervpn.online}"
export DPORT="${DPORT:-22}"
export PACKSKIP="${PACKSKIP:-0}"
export PORT="${PORT:-8080}"

echo "=========================================="
echo "   Proxy SSH WebSocket - Cloud Run"
echo "=========================================="
echo "Destination: ${DHOST}:${DPORT}"
echo "Skip packets: ${PACKSKIP}"
echo "Port interne: ${PORT}"
echo "=========================================="

# Lancer le proxy
node proxy3.js
