#!/bin/bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"
cd /mnt/c/Users/Sanish/OneDrive/Desktop/tourchain/Tour_chain
anchor build 2>&1 | tee build.log
echo "Build exit code: $?"
