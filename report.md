Tourism Chain Nepal — Full Repository Audit Report                                                                                                           
                                                                                                                                                               
  ---                                                                                                                                                          
  1. Executive Summary                                                                                                                                         
                                                                                                                                                               
  Tourism Chain Nepal is an early-stage Solana hackathon project building a decentralized tourism ecosystem for Nepal. The repository is a monorepo containing
  9 Anchor smart contracts (Rust), a Next.js 16 frontend, an Express.js/MongoDB backend, and a TypeScript SDK.                                                 
  
  Overall status: ~35–40% complete. Not production-ready. Has 5+ critical security issues and ~20 high/medium issues.                                          
                  
  One of nine smart contracts is deployed. The rest are stubs. Escrow logic, NFT minting, and DAO voting are all structurally present but functionally         
  incomplete. The UI is polished and the architecture is well-conceived — the implementation has not caught up.
                                                                                                                                                               
  ---             
  2. System Inventory
                     
  Stack
                                                                                                                                                               
  ┌─────────────────┬────────────────────────────────┬─────────────────────────────────┐
  │      Layer      │           Technology           │             Version             │                                                                       
  ├─────────────────┼────────────────────────────────┼─────────────────────────────────┤
  │ Smart Contracts │ Rust + Anchor                  │ anchor-lang 1.0.0 / Rust 1.89.0 │
  ├─────────────────┼────────────────────────────────┼─────────────────────────────────┤
  │ Frontend        │ Next.js + React                │ 16.2.4 / 19.2.4                 │                                                                       
  ├─────────────────┼────────────────────────────────┼─────────────────────────────────┤                                                                       
  │ Styling         │ Tailwind CSS 4 + Framer Motion │ ^4 / ^12                        │                                                                       
  ├─────────────────┼────────────────────────────────┼─────────────────────────────────┤                                                                       
  │ Backend         │ Express.js + Mongoose          │ ^5.2.1 / ^9.4.1                 │
  ├─────────────────┼────────────────────────────────┼─────────────────────────────────┤                                                                       
  │ Database        │ MongoDB                        │ (via Mongoose)                  │
  ├─────────────────┼────────────────────────────────┼─────────────────────────────────┤                                                                       
  │ Wallet          │ Phantom only                   │ @solana/wallet-adapter          │
  ├─────────────────┼────────────────────────────────┼─────────────────────────────────┤                                                                       
  │ NFTs            │ Metaplex Bubblegum (cNFT)      │ mpl-bubblegum ^5.0.2            │
  ├─────────────────┼────────────────────────────────┼─────────────────────────────────┤                                                                       
  │ Maps            │ Mapbox GL                      │ ^3.22.0                         │
  └─────────────────┴────────────────────────────────┴─────────────────────────────────┘                                                                       
                  
  Main Modules

  ┌──────────────────┬────────────────────────────┬─────────────────────────────────┐
  │      Module      │            Path            │             Purpose             │
  ├──────────────────┼────────────────────────────┼─────────────────────────────────┤                                                                          
  │ tourism_registry │ programs/tourism_registry/ │ Operator registration + reviews │
  ├──────────────────┼────────────────────────────┼─────────────────────────────────┤                                                                          
  │ booking_escrow   │ programs/booking_escrow/   │ Booking + escrow (stub)         │
  ├──────────────────┼────────────────────────────┼─────────────────────────────────┤                                                                          
  │ experience_nft   │ programs/experience_nft/   │ NFT minting (stub)              │
  ├──────────────────┼────────────────────────────┼─────────────────────────────────┤                                                                          
  │ loyalty_token    │ programs/loyalty_token/    │ $TREK token staking (stub)      │
  ├──────────────────┼────────────────────────────┼─────────────────────────────────┤                                                                          
  │ dao_governance   │ programs/dao_governance/   │ DAO voting (stub)               │
  ├──────────────────┼────────────────────────────┼─────────────────────────────────┤                                                                          
  │ route_registry   │ programs/route_registry/   │ Route checkpoints (stub)        │
  ├──────────────────┼────────────────────────────┼─────────────────────────────────┤                                                                          
  │ carbon_credits   │ programs/carbon_credits/   │ CO2 offset tracking             │
  ├──────────────────┼────────────────────────────┼─────────────────────────────────┤                                                                          
  │ pricing_oracle   │ programs/pricing_oracle/   │ Peak season pricing             │
  ├──────────────────┼────────────────────────────┼─────────────────────────────────┤                                                                          
  │ sos_insurance    │ programs/sos_insurance/    │ Emergency alert + payout (stub) │
  ├──────────────────┼────────────────────────────┼─────────────────────────────────┤                                                                          
  │ web              │ apps/web/                  │ Next.js frontend                │
  ├──────────────────┼────────────────────────────┼─────────────────────────────────┤                                                                          
  │ backend          │ backend/                   │ Express API + Solana relay      │
  ├──────────────────┼────────────────────────────┼─────────────────────────────────┤                                                                          
  │ sdk              │ sdk/                       │ TypeScript SDK (empty IDLs)     │
  └──────────────────┴────────────────────────────┴─────────────────────────────────┘                                                                          
  
  Entrypoints                                                                                                                                                  
                  
  - Frontend: apps/web/src/app/layout.tsx, page.tsx                                                                                                            
  - Backend: backend/src/index.js → port 3001
  - SDK: sdk/src/index.ts (class TourismChain)                                                                                                                 
  - Programs: each programs/*/src/lib.rs
                                                                                                                                                               
  External Services
                                                                                                                                                               
  - Solana Devnet RPC (hardcoded)                                                                                                                              
  - Metaplex Bubblegum (cNFT minting — partially wired)
  - Mapbox GL (hardcoded placeholder token)                                                                                                                    
  - MongoDB (localhost fallback)                                                                                                                               
  
  ---                                                                                                                                                          
  3. Architecture Map
                                                                                                                                                               
  Outside-In View
                                                                                                                                                               
  User Browser    
    → Next.js 16 UI (apps/web/)                                                                                                                                
        → Phantom wallet adapter (Devnet only)
        → POST /api/planner (heuristic trip recommendations)                                                                                                   
        → Solana RPC (direct, via @solana/web3.js)                                                                                                             
                                                                                                                                                               
  External Actor                                                                                                                                               
    → Express.js API (backend/, port 3001)                                                                                                                     
        → MongoDB (Tourist, Place, Visit models)                                                                                                               
        → QR verification (HMAC-SHA256 daily token)
        → backend/src/services/solanaService.js                                                                                                                
            → tourism_registry program (deployed)
            → bubblegumService.js → Merkle tree (must be pre-provisioned)                                                                                      
                                                                                                                                                               
  Inside-Out View                                                                                                                                              
                                                                                                                                                               
  Solana Programs (9 total, 1 deployed)
    ↑ called by backend via Anchor provider (keypair from file)
    ↑ called by SDK (empty IDLs — not functional)                                                                                                              
    ↑ called by frontend directly (wallet adapter, partial)
                                                                                                                                                               
  MongoDB         
    ↑ written by backend on QR-verified visit                                                                                                                  
    ↑ read by leaderboard, NFT, profile endpoints                                                                                                              
                                                                                                                                                               
  Frontend                                                                                                                                                     
    ↑ calls backend /api/planner only (other calls are mock/static)                                                                                            
    ↑ connects Phantom wallet for on-chain actions (not fully wired)                                                                                           
  
  ---                                                                                                                                                          
  4. What Is Working
                                                                                                                                                               
  ┌──────────────────────────────────┬──────────────────────────────────────┬────────────────────────────────────────┐
  │             Feature              │               File(s)                │                 Status                 │
  ├──────────────────────────────────┼──────────────────────────────────────┼────────────────────────────────────────┤
  │ Operator registration (on-chain) │ programs/tourism_registry/src/lib.rs │ Confirmed working — deployed to devnet │
  ├──────────────────────────────────┼──────────────────────────────────────┼────────────────────────────────────────────┤
  │ Operator review submission       │ same                                 │ Confirmed working                          │                                     
  ├──────────────────────────────────┼──────────────────────────────────────┼──────────────────────────────────────────────┤
  │ Reputation score update          │ same                                 │ Confirmed working                            │                                   
  ├──────────────────────────────────┼──────────────────────────────────────┼──────────────────────────────────────────────┤                                   
  │ QR generation + verification     │ backend/src/services/qrService.js    │ Confirmed working — HMAC logic correct       │
  ├──────────────────────────────────┼──────────────────────────────────────┼──────────────────────────────────────────────┤                                   
  │ Visit recording + tier promotion │ backend/src/routes/visits.js         │ Likely working — logic sound, DB-dependent   │
  ├──────────────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────────┤                        
  │ Leaderboard queries              │ backend/src/routes/leaderboard.js              │ Likely working — MongoDB aggregation correct  │
  ├──────────────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────────┤                        
  │ NFT metadata endpoint            │ backend/src/routes/nfts.js                     │ Likely working (except localhost image URL)   │
  ├──────────────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────────┤                        
  │ Frontend UI (static)             │ apps/web/src/app/                              │ Confirmed working — renders with static data  │
  ├──────────────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────────┤                        
  │ Staking account creation         │ programs/loyalty_token/src/lib.rs (stake_trek) │ Likely working — token transfer logic present │
  ├──────────────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────────┤                        
  │ Carbon offset account creation   │ programs/carbon_credits/src/lib.rs             │ Likely working — calculations present         │
  ├──────────────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────────┤                        
  │ CO2 offset retire (idempotent)   │ same                                           │ Likely working                                │
  ├──────────────────────────────────┼────────────────────────────────────────────────┼───────────────────────────────────────────────┤                        
  │ Pricing config update            │ programs/pricing_oracle/src/lib.rs             │ Likely working                                │
  └──────────────────────────────────┴────────────────────────────────────────────────┴───────────────────────────────────────────────┘                        
                  
  ---                                                                                                                                                          
  5. What Is Not Working

  ┌──────────────────────────────┬────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────────┐
  │           Feature            │                        File(s)                         │                            Problem                             │
  ├──────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ Escrow: actual USDC transfer │ programs/booking_escrow/src/lib.rs:create_booking      │ Broken — comment: "would transfer USDC in real implementation" │
  ├──────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤
  │ Milestone fund release       │ programs/booking_escrow/src/lib.rs:release_milestone   │ Broken — function exists, no transfer logic                    │   
  ├──────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤   
  │ cNFT minting (experience)    │ programs/experience_nft/src/lib.rs:mint_experience_nft │ Broken — no CPI to Bubblegum; emits event only                 │   
  ├──────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤   
  │ Checkpoint badge minting     │ programs/route_registry/src/lib.rs:check_in            │ Broken — comment: "CPI to Bubblegum would go here"             │
  ├──────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤   
  │ $TREK earning                │ programs/loyalty_token/src/lib.rs:earn_trek            │ Broken — function body is empty                                │
  ├──────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤   
  │ Unstake transfer             │ programs/loyalty_token/src/lib.rs:unstake_trek         │ Broken — comment: "Signer would be vault PDA in real impl"     │
  ├──────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤   
  │ SOS insurance payout         │ programs/sos_insurance/src/lib.rs:payout_insurance     │ Broken — comment: "payout logic would go here"                 │
  ├──────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤   
  │ DAO duplicate vote guard     │ programs/dao_governance/src/lib.rs:cast_vote           │ Broken — no voter deduplication                                │
  ├──────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤   
  │ SDK program calls            │ sdk/src/index.ts                                       │ Broken — all programs initialized with {} as Idl               │
  ├──────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤   
  │ Actions: support donation    │ backend/src/routes/actions.js:64                       │ Broken — uses undefined connection variable; will crash        │
  ├──────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤   
  │ Mapbox map rendering         │ apps/web/src/components/Map.tsx:8                      │ Broken — hardcoded placeholder token                           │
  ├──────────────────────────────┼────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────────┤   
  │ bubblegumService tree        │ backend/src/services/bubblegumService.js               │ Broken — MERKLE_TREE_PUBKEY env var required, not provisioned  │
  └──────────────────────────────┴────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────────┘   
                  
  ---                                                                                                                                                          
  6. What Is Missing
                                                                                                                                                               
  - No tests — zero test files found anywhere in the repo
  - No .env.example — no documented required environment variables                                                                                             
  - No CI/CD — no .github/workflows/, no Makefile, no deploy scripts
  - No authentication layer — backend has no JWT/session validation; wallet signature verification absent                                                      
  - No rate limiting — all Express routes accept unlimited requests                                                                                            
  - No input validation — no Zod, Joi, or express-validator anywhere                                                                                           
  - No error handling middleware — Express has no global error handler                                                                                         
  - No dispute resolution logic — dispute_deadline exists in booking_escrow but no dispute flow
  - No oracle integration — pricing_oracle and sos_insurance reference Switchboard but use none                                                                
  - No IDL files — programs not compiled yet (no target/idl/ artifacts in repo)                                                                                
  - No Merkle tree provisioning — Bubblegum tree never initialized; MERKLE_TREE_PUBKEY undefined                                                               
  - No mainnet config — entire project locked to devnet                                                                                                        
  - Booking page (apps/web/src/app/book/[operatorId]/page.tsx) — uses all static data; no real operator ID lookups                                             
  - Dashboard data — all stats are hardcoded placeholder values (e.g., "1,248 tourists", "4,520 SOL in escrow")                                                
  - SDK booking.ts — file appears corrupt/truncated/binary                                                                                                     
                                                                                                                                                               
  ---                                                                                                                                                          
  7. Risks and Bugs                                                                                                                                            
                  
  Critical Bugs

  1. connection undefined — backend/src/routes/actions.js:64: POST /api/actions/support/:placeId crashes immediately. connection is never defined in that file.
  2. Empty Anchor IDLs in SDK — sdk/src/index.ts: Every getXProgram() call passes {} as Idl. All SDK calls will fail at runtime with Anchor deserialization
  errors.                                                                                                                                                      
  3. Windows-only fallback path — backend/src/services/solanaService.js:11: Falls back to C:/Users/asus/.config/solana/id.json. Will throw ENOENT on Linux/Mac.
  4. Duplicate DAO votes — programs/dao_governance/src/lib.rs:cast_vote: No PDA or set to track whether voter already voted. One wallet can call cast_vote     
  indefinitely, inflating vote counts.                                                                                                                         
  5. PDA seed collision on title — programs/dao_governance/src/lib.rs:create_proposal: PDA uses ["proposal", title.as_bytes()]. Two proposals with same title  
  will attempt to initialize the same account.                                                                                                                 
                  
  High Risks                                                                                                                                                   
                  
  6. Escrow holds no funds — programs/booking_escrow tracks bookings as state but never locks tokens. The entire escrow security model is non-functional.      
  7. SOS payout has no access control — programs/sos_insurance/src/lib.rs:payout_insurance: accepts any Signer as authority. Anyone can authorize a payout.
  8. Unbounded string fields on-chain — sos_insurance stores lat: String and long: String with no max length. Anchor accounts need fixed sizes; large inputs   
  will cause allocation failures or excess rent.                                                                                                               
  9. Checkpoint ID not range-checked — programs/route_registry/src/lib.rs:check_in: checkpoint_id is accepted as u8 but never validated against                
  route.num_checkpoints (hardcoded 5). Checkpoint IDs 5–255 are accepted but semantically invalid.                                                             
  10. Mapbox token in source — apps/web/src/components/Map.tsx:8: Token is a placeholder string, not a real secret, but the pattern of hardcoding tokens in
  source will cause issues when a real token is placed here and committed.                                                                                     
                  
  ---                                                                                                                                                          
  8. Security Review

  Critical

  ┌────────────────────────────────────────────────────────────────┬──────────────────────────────────────────┬──────────┐
  │                             Issue                              │                 Location                 │ Severity │
  ├────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┼──────────┤                                 
  │ Private key loaded from filesystem, hardcoded fallback path    │ backend/src/services/solanaService.js:11     │ CRITICAL │
  ├────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┼──────────┤                                 
  │ No wallet signature verification on register/profile endpoints │ backend/src/routes/auth.js                   │ CRITICAL │                                 
  ├────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┼──────────┤                                 
  │ Any signer can authorize SOS insurance payout                  │ programs/sos_insurance/src/lib.rs            │ CRITICAL │                                 
  ├────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────┼──────────┤                                 
  │ Duplicate vote possible in DAO                                 │ programs/dao_governance/src/lib.rs:cast_vote │ CRITICAL │
  └────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────┴──────────┘                                 
                  
  High                                                                                                                                                         
                  
  ┌────────────────────────────────────────────────────────────────────┬─────────────────────────────────┬──────────┐
  │                               Issue                                │            Location             │ Severity │
  ├────────────────────────────────────────────────────────────────────┼───────────────────────────────────────┼──────────┤
  │ Unbounded String fields in Solana accounts (DoS/bloat)             │ sos_insurance, tourism_registry       │ HIGH     │
  ├────────────────────────────────────────────────────────────────────┼───────────────────────────────────────┼──────────┤
  │ No rate limiting on any endpoint                                   │ backend/src/index.js                  │ HIGH     │                                    
  ├────────────────────────────────────────────────────────────────────┼───────────────────────────────────────┼──────────┤                                    
  │ No authentication on /api/places/create (anyone can create places) │ backend/src/routes/places.js          │ HIGH     │                                    
  ├────────────────────────────────────────────────────────────────────┼───────────────────────────────────────┼──────────┤                                    
  │ Backend keypair held in memory for server lifetime                 │ backend/src/services/solanaService.js │ HIGH     │
  ├────────────────────────────────────────────────────────────────────┼───────────────────────────────────────┼──────────┤                                    
  │ Hardcoded treasury address, no config                              │ backend/src/routes/actions.js:58      │ HIGH     │
  └────────────────────────────────────────────────────────────────────┴───────────────────────────────────────┴──────────┘                                    
                  
  Medium                                                                                                                                                       
                  
  ┌──────────────────────────────────────────────────┬───────────────────────────────┬──────────┐
  │                      Issue                       │           Location            │ Severity │
  ├──────────────────────────────────────────────────┼──────────────────────────────────────────────┼──────────┤
  │ No input validation/sanitization on any endpoint │ entire backend                               │ MEDIUM   │
  ├─────────────────────────────────────────────────────────┼──────────────────────────────────────────────┼──────────┤
  │ MongoDB default localhost, no auth                      │ backend/src/index.js:9                       │ MEDIUM   │                                        
  ├─────────────────────────────────────────────────────────┼──────────────────────────────────────────────┼──────────┤                                        
  │ NFT metadata image URLs point to localhost:3001         │ backend/src/routes/nfts.js:52                │ MEDIUM   │                                        
  ├─────────────────────────────────────────────────────────┼──────────────────────────────────────────────┼──────────┤                                        
  │ Hardcoded Devnet in frontend (no mainnet path)          │ apps/web/src/components/SolanaProvider.tsx:7 │ MEDIUM   │
  ├─────────────────────────────────────────────────────────┼──────────────────────────────────────────────┼──────────┤                                        
  │ CORS wildcard (app.use(cors()) — no origin restriction) │ backend/src/index.js:7                       │ MEDIUM   │
  └─────────────────────────────────────────────────────────┴──────────────────────────────────────────────┴──────────┘                                        
                  
  ---                                                                                                                                                          
  9. Test and Quality Review
                            
  Tests: NONE. Zero test files found anywhere — no Anchor tests (tests/), no Jest/Vitest tests, no integration tests.
                                                                                                                                                               
  Code quality observations:                                                                                                                                   
  - TypeScript strict mode enabled in frontend (tsconfig.json) — positive                                                                                      
  - Rust overflow-checks = true in release profile — positive                                                                                                  
  - skip-lint = false in Anchor.toml but anchor build --skip-lint referenced in BUILD_GUIDE.md — contradictory
  - ESLint configured (eslint-config-next) — likely passing since no custom rules found                                                                        
  - Comments throughout programs acknowledge stub status — at least honest                                                                                     
  - SDK booking.ts appears corrupted/truncated — not auditable                                                                                                 
                                                                                                                                                               
  Test coverage: 0%. No quality gates exist.                                                                                                                   
                                                                                                                                                               
  ---                                                                                                                                                          
  10. Deployment / Readiness Review                                                                                                                            
                                   
  ┌────────────────────────────────────┬────────────────────────────────┐
  │              Concern               │            Finding             │                                                                                      
  ├────────────────────────────────────┼────────────────────────────────┤
  │ Deployed programs                  │ 1 of 9 (tourism_registry only) │                                                                                      
  ├────────────────────────────────────┼────────────────────────────────┤
  │ CI/CD pipeline                     │ None                           │
  ├────────────────────────────────────┼───────────────────────────────────────┤                                                                               
  │ Environment variable documentation │ None (.env.example missing)           │
  ├────────────────────────────────────┼───────────────────────────────────────┤                                                                               
  │ Docker/containerization            │ None                                  │
  ├────────────────────────────────────┼───────────────────────────────────────┤                                                                               
  │ Process manager (PM2, systemd)     │ None                                  │
  ├────────────────────────────────────┼───────────────────────────────────────┤                                                                               
  │ Secrets management                 │ Filesystem keypair (no KMS, no Vault) │
  ├────────────────────────────────────┼───────────────────────────────────────┤                                                                               
  │ Database migrations                │ None (Mongoose auto-schema)           │
  ├────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤                                                  
  │ Health check endpoint              │ None                                                               │
  ├────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤                                                  
  │ Logging                            │ console.log only                                                   │
  ├────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤                                                  
  │ Monitoring                         │ None                                                               │
  ├────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤                                                  
  │ Anchor wallet path                 │ ~\.config\solana\id.json (Windows backslash — won't work on Linux) │
  ├────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤                                                  
  │ IDL artifacts                      │ Not committed — programs must be built before SDK or backend works │
  ├────────────────────────────────────┼────────────────────────────────────────────────────────────────────┤                                                  
  │ Merkle tree                        │ Not provisioned — Bubblegum minting will fail at runtime           │
  └────────────────────────────────────┴────────────────────────────────────────────────────────────────────┘                                                  
                  
  Verdict: Cannot be deployed as-is. The Anchor wallet path will fail on Linux, 8 programs lack real IDs, the backend will crash on actions.js:64, and the     
  Bubblegum tree doesn't exist.
                                                                                                                                                               
  ---             
  11. Prioritized Fix List
                          
  P0 — Critical (blocks basic functionality or has security exploit potential)
                                                                                                                                                               
  1. Fix crash: undefined connection in backend/src/routes/actions.js:64 — add const { Connection } = require('@solana/web3.js') and initialize connection, or 
  remove the dead route.                                                                                                                                       
  2. Secure private key loading (backend/src/services/solanaService.js:11) — require WALLET_PATH env var to be explicitly set; crash fast with a clear message 
  if missing; never fall back to a hardcoded path.                                                                                                             
  3. Add wallet signature verification to /api/auth/register (backend/src/routes/auth.js) — require a signed message proving ownership of the submitted
  walletAddress before creating/updating the account.                                                                                                          
  4. Fix DAO duplicate vote (programs/dao_governance/src/lib.rs:cast_vote) — add a VoteRecord PDA with seeds ["vote", proposal, voter]; use init constraint to
  guarantee one-vote-per-wallet.                                                                                                                               
  5. Fix SOS insurance authority check (programs/sos_insurance/src/lib.rs:payout_insurance) — add an admin PDA or store the authority on the EmergencyAlert at
  creation time; validate it in payout_insurance.                                                                                                              
                  
  P1 — Important (features expected to work but don't)                                                                                                         
                  
  6. Implement USDC escrow in booking_escrow — add SPL token accounts and actual transfer CPIs in create_booking and release_milestone.                        
  7. Implement earn_trek in loyalty_token — add mint authority PDA and SPL token mint CPI; empty function body currently does nothing.
  8. Fix SDK IDLs (sdk/src/index.ts) — generate IDL artifacts (anchor build) and import them; replace all {} as Idl usages.                                    
  9. Fix Anchor wallet path (Anchor.toml) — change '~\.config\solana\id.json' to ~/.config/solana/id.json (forward slashes); or use ANCHOR_WALLET env var.     
  10. Add rate limiting and input validation to Express backend — add express-rate-limit on all routes and Zod/Joi schema validation on POST bodies.           
  11. Create .env.example — document all required env vars: MONGODB_URI, SOLANA_RPC, WALLET_PATH, MERKLE_TREE_PUBKEY, MAPBOX_TOKEN.                            
  12. Restrict CORS (backend/src/index.js:7) — replace app.use(cors()) with explicit origin allowlist.                                                         
                                                                                                                                                               
  P2 — Nice to Have                                                                                                                                            
                                                                                                                                                               
  13. Add Switchboard oracle integration to pricing_oracle instead of manual admin updates.                                                                    
  14. Move Mapbox token to env var — NEXT_PUBLIC_MAPBOX_TOKEN in apps/web/src/components/Map.tsx.
  15. Add more wallet adapters — Backpack, Solflare, etc. in SolanaProvider.tsx.                                                                               
  16. Add anchor test suite — at minimum, one test per instruction in tourism_registry (the one deployed program).                                             
  17. Fix PDA seed uniqueness in dao_governance (add timestamp or counter to proposal seed).                                                                   
  18. Cap string lengths on-chain — replace String fields in SOS insurance with [u8; N] fixed arrays or enforce max_len constraints.                           
  19. Replace hardcoded stat values in frontend — connect dashboard and home page to real on-chain/API data.                                                   
  20. Add health check endpoint to Express (GET /health).                                                                                                      
                                                                                                                                                               
  ---                                                                                                                                                          
  12. Final Verdict                                                                                                                                            
                   
  Tourism Chain Nepal is a well-structured, architecturally coherent hackathon prototype with a serious implementation gap. The UI is polished and the
  9-program contract architecture is thoughtful. However:                                                                                                      
  
  - 8 of 9 smart contracts are stubs — not deployed, not functional                                                                                            
  - The escrow and NFT minting systems — the core value propositions — don't work
  - 5 critical security issues exist that would allow vote manipulation, unauthorized payouts, and identity spoofing                                           
  - No tests, no CI, no deployment pipeline                                                                                                                    
  - Backend will crash on one of its own routes in production                                                                                                  
                                                                                                                                                               
  This is appropriate for a hackathon demo where the UI and vision are evaluated, not execution. It is not appropriate for user funds or mainnet deployment    
  without significant remediation.                                                                                                                             
                                                                                                                                                               
  ---             
  "I Would Fix These First"
                                                                                                                                                               
  ┌─────┬──────────────────────────────────────────────────┬──────────────────────────────────────────┬────────────────────────────────────────────────────┐
  │  #  │                      Action                      │                   File                   │                        Why                         │   
  ├─────┼──────────────────────────────────────────────────┼──────────────────────────────────────────┼────────────────────────────────────────────────────┤   
  │ 1   │ Fix crash: add connection to actions route          │ backend/src/routes/actions.js:64         │ Server will crash on any donation attempt       │
  ├─────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────┼─────────────────────────────────────────────────┤   
  │ 2   │ Require env var for wallet keypair, remove          │ backend/src/services/solanaService.js:11 │ Security + portability (fails on every          │   
  │     │ hardcoded path                                      │                                          │ non-Windows machine)                            │   
  ├─────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────┼─────────────────────────────────────────────────┤   
  │ 3   │ Add vote deduplication PDA to DAO governance        │ programs/dao_governance/src/lib.rs       │ Core governance is exploitable today            │   
  ├─────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────┼─────────────────────────────────────────────────┤   
  │ 4   │ Implement wallet signature verification on          │ backend/src/routes/auth.js               │ Anyone can register as any wallet               │
  │     │ /api/auth/register                                  │                                          │                                                 │   
  ├─────┼─────────────────────────────────────────────────────┼──────────────────────────────────────────┼─────────────────────────────────────────────────┤
  │ 5   │ Build programs + import real IDLs into SDK          │ sdk/src/index.ts                         │ All SDK calls fail silently with empty IDL      │   
  └─────┴─────────────────────────────────────────────────────┴──────────────────────────────────────────┴─────────────────────────────────────────────────┘   
