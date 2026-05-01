use # TourChain - Web3 Tourism Platform 🏔️

Blockchain-powered tourism platform for Nepal built on Solana.

## Features

✅ AI Trip Planner - Natural language route recommendations  
✅ Blockchain Escrow - Secure payments with smart contracts  
✅ Solana Blinks - Shareable booking links  
✅ GPS Check-in - Location verification  
✅ NFT Badges - Completion proof tokens  
✅ Gamification - XP, ranks, achievements  

## Quick Start

```bash
# Start frontend
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000

## Test Features

- **AI Planner:** http://localhost:3000/planner
- **Explore Routes:** http://localhost:3000/explore
- **Dashboard:** http://localhost:3000/dashboard
- **Leaderboard:** http://localhost:3000/leaderboard

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Blockchain:** Solana, Anchor 0.30.1
- **Database:** Supabase (PostgreSQL)
- **Wallet:** Phantom, Solflare

## Smart Contracts

Located in `programs/`:
- `tourchain_reputation` - Guide reputation system
- `tourchain_escrow` - Milestone-based payments
- `tourchain_proof` - NFT minting with Bubblegum

## Environment Variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
```

## Demo

The wallet integration works! When you book:
1. Connect Phantom wallet
2. Fill booking details
3. Wallet opens for approval
4. (Programs need deployment to complete transaction)

## Status

✅ Frontend - Complete  
✅ Smart Contracts - Built  
✅ AI Features - Working  
✅ Blinks API - Functional  
⏳ Deployment - Pending  

## License

MIT
