#!/bin/bash
set -e

echo "=== TourChain Deployment Script ==="
echo ""

# Set PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

# Check Solana CLI
echo "Checking Solana CLI..."
solana --version

# Check wallet
echo ""
echo "Wallet address:"
solana address

# Check balance
echo ""
echo "Wallet balance:"
solana balance --url devnet

# Deploy programs
echo ""
echo "Deploying programs to devnet..."
anchor deploy --provider.cluster devnet

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Program IDs:"
echo "  tourchain_reputation: 2GWdm3guUBQBLdA3VB9ECAwzN6UdpEMgs2VrKHiKfBXy"
echo "  tourchain_escrow: EsmThaTZhHLviAJFbpgaSTr6eCgUFGcSiboMRzb9JF6Z"
echo "  tourchain_proof: 3PfgspqxmvAh3FXUMGRPexBV7neXwLkKTPnv3gRWvPjm"
