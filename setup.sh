#!/bin/bash

# Configuration of services and their specific start commands
# Note: For torrent, it always builds before starting.
services=(
    "backblaze-upload:npm start"
    "backend:npm start"
    "frontend:npm start"
    "torrent:npm run build && npm start"
    "tracker:npm start"
    
)

for config in "${services[@]}"; do
    IFS=':' read -r dir cmd <<< "$config"
    echo "Checking dependencies and starting $dir..."
    
    # Run in a subshell in the background
    (
        cd "$dir" || exit 1
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies for $dir..."
            npm install
        fi
        echo "Running: $cmd"
        eval "$cmd"
    ) &
done

echo "All services started. Waiting for them to complete (press Ctrl+C to exit all)..."
wait
