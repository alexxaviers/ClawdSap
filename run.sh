#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "Done."
}

trap cleanup SIGINT SIGTERM

# Set up backend venv if it doesn't exist
if [ ! -d "$ROOT/backend/venv" ]; then
    echo "Creating backend virtual environment..."
    python3 -m venv "$ROOT/backend/venv"
fi

# Install/update backend dependencies
echo "Installing backend dependencies..."
"$ROOT/backend/venv/bin/pip" install -q -r "$ROOT/backend/requirements.txt"

# Start Flask backend inside the venv
echo "Starting backend on :5000..."
"$ROOT/backend/venv/bin/python" "$ROOT/backend/app.py" &
BACKEND_PID=$!

# Start Next.js frontend
echo "Starting frontend on :3000..."
cd "$ROOT/frontend"
pnpm dev &
FRONTEND_PID=$!

wait $BACKEND_PID $FRONTEND_PID
