#!/bin/bash
set -e

echo "=== Initializing Bubblegum Merkle Tree ==="
echo ""

# Set PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

# Set environment variables
export ANCHOR_WALLET="$HOME/.config/solana/id.json"
export SOLANA_RPC="https://api.devnet.solana.com"

# Check wallet
echo "Wallet: $(solana address)"
echo "Balance: $(solana balance --url devnet)"
echo ""

# Check if wallet has enough SOL
BALANCE=$(solana balance --url devnet | awk '{print $1}')
if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo "Error: Need at least 2 SOL for merkle tree creation"
    echo "Current balance: $BALANCE SOL"
    exit 1
fi

echo "Initializing merkle tree..."
echo "This will cost approximately 2 SOL"
echo ""

# Run the script
npx tsx scripts/init-merkle-tree.ts

echo ""
echo "=== Merkle Tree Initialization Complete ==="
