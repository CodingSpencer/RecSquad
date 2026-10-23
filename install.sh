#!/usr/bin/env bash
# install.sh - set up the RecSquad bakeoff on a fresh machine.
#
# Usage:
#   git clone https://github.com/CodingSpencer/RecSquad.git
#   cd RecSquad
#   chmod +x install.sh
#   ./install.sh
#
# Installs dependencies and environment files that are NOT committed to GitHub
# (node_modules, .env.local, etc.).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$REPO_ROOT/frontend"

echo "==> RecSquad bakeoff installer"
echo "    Repo root: $REPO_ROOT"

# --- 1. Check prerequisites --------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not installed. Install Node.js 20+ from https://nodejs.org/" >&2
  exit 1
fi
NODE_MAJOR="$(node -v | sed 's/^v//' | cut -d. -f1)"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "ERROR: Node.js 18+ is required (found $(node -v))." >&2
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is not installed." >&2
  exit 1
fi
echo "    Node $(node -v), npm $(npm -v) OK"

# --- 2. Install frontend dependencies ---------------------------------------
echo "==> Installing frontend dependencies (npm install)"
cd "$FRONTEND_DIR"
npm install

# --- 3. Environment file -----------------------------------------------------
ENV_FILE="$FRONTEND_DIR/.env.local"
ENV_EXAMPLE="$FRONTEND_DIR/.env.example"
if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "==> Created $ENV_FILE from .env.example"
    echo "    !! Edit $ENV_FILE and fill in your Supabase URL and anon key before running."
  else
    cat > "$ENV_FILE" <<'EOF'
# Supabase (required for auth and database)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EOF
    echo "==> Created $ENV_FILE (template)"
  fi
else
  echo "==> $ENV_FILE already exists; leaving it untouched"
fi

# --- 4. Root-level dependencies (if any) -------------------------------------
cd "$REPO_ROOT"
if [ -f "$REPO_ROOT/package.json" ]; then
  if [ ! -d "$REPO_ROOT/node_modules" ]; then
    echo "==> Installing root-level dependencies"
    npm install
  else
    echo "==> Root node_modules already present"
  fi
fi

echo ""
echo "==> Install complete!"
echo "    Next steps:"
echo "      1. Edit frontend/.env.local with your Supabase credentials."
echo "      2. cd frontend && npm run dev"
echo "      3. Open http://localhost:3000"
