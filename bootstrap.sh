#!/usr/bin/env bash
set -euo pipefail

# ———— Usage ————
# From a fresh Ubuntu EC2:
#   curl -fsSL https://raw.githubusercontent.com/glamprinakis/Web3/main/bootstrap.sh | bash -s -- \
#     DB_PASSWORD=YOUR_DB_PW JWT_SECRET=YOUR_JWT_SECRET

# Parse args into env
for kv in "$@"; do
  export "${kv%%=*}"="${kv#*=}"
done

if [[ -z "${DB_PASSWORD-}" || -z "${JWT_SECRET-}" ]]; then
  echo "Missing required vars. Usage:"
  echo "   curl … | bash -s -- DB_PASSWORD=xxx JWT_SECRET=yyy"
  exit 1
fi

# 1) Clone or update the repo
WORKDIR="$HOME/Web3"
if [[ ! -d $WORKDIR ]]; then
  git clone https://github.com/glamprinakis/Web3.git "$WORKDIR"
else
  cd "$WORKDIR" && git pull
fi
cd "$WORKDIR"

# 2) Create .env if needed
if [[ ! -f .env ]]; then
  cat > .env <<EOF
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
EOF
  echo ".env created; fill or adjust if needed"
fi

# 3) Build & start everything
docker compose -f docker-compose.prod.yml run --rm frontend-builder
docker compose -f docker-compose.prod.yml up -d --build

echo
echo "Deployed! Visit http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/"
