# TourChain — Product & Technical Strategy

**Version:** 1.0 · April 2026
**Status:** Pre-launch · 13-day sprint plan
**Team:** 3 engineers

---

## A. Executive Product Definition

### What it is

TourChain is a trust-first adventure tourism platform for Nepal. It turns travel into a structured, story-driven experience where tourists follow verified routes, complete quests at real locations, earn on-chain proof of their journeys, and book guides whose reputations are transparent and tamper-proof. Think Komoot meets Duolingo meets Airbnb Experiences — but with Solana as the trust backbone and Nepal as the proving ground.

It is **not** a blockchain app that happens to involve tourism. It is a tourism product that uses blockchain where it genuinely solves trust, verification, and proof problems that web2 cannot.

### Who it is for

**Primary users:**
- Independent trekkers visiting Nepal (300K+ permits/year) who want safe, scam-free, culturally rich experiences
- Local guides and operators who want to build portable, verifiable reputations outside TripAdvisor's walled garden
- Small teahouse owners and activity operators who lose 20–25% to OTA commissions

**Secondary users:**
- Tourism boards and regulators who want transparent permit and revenue data
- Travel content creators who want provable adventure credentials

### Why it matters

Nepal's $2.4B trekking economy runs on paper permits, cash payments, and word-of-mouth trust. The result:
- 30–40% revenue leakage to corruption and administrative friction
- Guides build decade-long reputations on platforms they don't own
- Porters get shorted by agencies with no recourse
- Tourists have no way to verify guide credentials before booking
- No standard proof that someone actually completed a trek

These are not technically hard problems. They are institutionally stuck problems. TourChain solves them by making trust data portable, payments transparent, and achievements verifiable.

### What it solves better than current travel apps

| Problem | Current solution | TourChain solution |
|---|---|---|
| Guide trust | TripAdvisor reviews (platform-owned, gameable) | On-chain reputation PDAs that guides own forever |
| Booking safety | Pay cash to stranger, hope for the best | Milestone-based escrow with dispute resolution |
| Proof of completion | Instagram selfie | GPS-verified, guide-signed on-chain proof |
| Route discovery | Scattered blog posts | Structured quest system with checkpoints |
| Commission extraction | Viator takes 20–25% | Platform fee of 3–5%, rest goes to guide |
| Scam prevention | None | Verified operator badges, transparent review history |

---

## B. Core User Journeys

### 1. Tourist Journey

```
Download app → Browse quests/routes → Pick "Annapurna Circuit Quest"
→ View verified guide profiles + on-chain reputation scores
→ Book guide (payment held in escrow)
→ Day 1: Check in at Besisahar (GPS + QR scan at checkpoint)
    → First quest clue unlocked: "Find the prayer wheel at Dharapani"
→ Day 3: Complete quest task → earn XP + progress badge
→ Day 7: Reach Thorong La Pass → guide confirms completion
    → Milestone payment released to guide
    → Compressed NFT minted as proof-of-summit
→ Return: Leave review → guide reputation updated on-chain
→ View achievement collection → share proof → climb leaderboard
```

**Key design decisions:**
- Check-in uses GPS proximity + QR code at partner locations. No "honor system."
- Quest clues are culturally educational, not scavenger hunts in dangerous locations.
- All quests use verified public trails, registered teahouses, and approved operators.
- Payment milestones align with trek segments, not all-or-nothing.

### 2. Guide Journey

```
Apply on platform → Submit credentials (license, ID, references)
→ Admin verifies → Profile created with on-chain reputation PDA
→ Create service listing (Everest Base Camp trek, 14 days, $1,200)
→ Receive booking → Accept → Escrow funded
→ Lead trek → Confirm tourist check-ins at each checkpoint
→ Complete trek → Final milestone released
→ Receive review → Reputation score updated
→ After 50 completions → "Master Guide" badge (soul-bound cNFT)
→ Reputation travels with wallet — never locked to one platform
```

**Key design decisions:**
- Guides must be admin-verified before listing. No open marketplace on day 1.
- Reputation is on-chain because it is the guide's most valuable portable asset.
- Guides co-sign completions — prevents fake check-ins.

### 3. Admin Journey

```
Login to admin panel → Review pending guide applications
→ Check submitted documents + references
→ Approve or reject with reason
→ Monitor active disputes (tourist says guide no-showed)
→ Review evidence → Release or refund escrow
→ Flag suspicious reviews → Remove if fraudulent
→ View analytics: active treks, revenue, dispute rate, top guides
```

### 4. Safety / Dispute Journey

```
Tourist reports problem → Selects category:
  - Guide no-show
  - Safety concern
  - Billing dispute
  - Emergency (routes to SOS)
→ Dispute created with evidence upload
→ Admin reviews within 48 hours
→ Decision: refund, partial release, or dismiss
→ Both parties notified → Escrow resolved accordingly
→ Repeat offenders flagged → Guide suspended after threshold
```

**Safety rules baked into the product:**
- No quests in restricted areas, private property, or dangerous off-trail locations
- All quest locations are pre-verified public sites or approved partner venues
- Emergency SOS button on every active trek screen
- Guide verification includes background check and license validation
- Automatic alerts if a trekker hasn't checked in within expected window

---

## C. Tech Stack Recommendation

### The Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion | Mature, fast, great DX. Next 16 is too bleeding-edge for a 13-day sprint — 15 is stable and well-documented. |
| Backend | Next.js API routes + Supabase Edge Functions | Eliminates a separate Express server. One deployment target. |
| Database | Supabase (Postgres) | See detailed comparison below. |
| Auth | Supabase Auth (email/social) + Solana wallet signature verification | Dual-auth: web2 users get normal login, web3 users connect wallet. |
| Solana | Anchor framework, PDAs, SPL Token (minimal), Bubblegum cNFTs | Only what adds real value. See program design below. |
| File storage | Supabase Storage (images, docs) + Arweave (NFT metadata only) | Cheap, fast for operational files. Permanent for on-chain artifacts. |
| Maps | Mapbox GL JS | Best trail/terrain rendering. Required for quest maps. |
| Analytics | PostHog (self-hostable, free tier) | Privacy-friendly, event-based, good for funnels. |
| Deployment | Vercel (frontend) + Supabase (hosted) + Solana Devnet → Mainnet | Zero-ops for a 3-person team. |

### Why Supabase over Firebase

This is not a neutral choice. **Supabase wins decisively for this project.** Here's why:

**1. Postgres is better for relational tourism data.**
Bookings reference guides who reference places who reference routes. This is deeply relational. Firestore's document model would force denormalization nightmares. Postgres handles joins, foreign keys, and complex queries natively.

**2. Row-Level Security (RLS) eliminates a backend auth layer.**
Instead of writing Express middleware to check "does this user own this booking?", you write a single RLS policy: `auth.uid() = user_id`. Every query automatically enforces it. This saves days of development.

**3. Supabase Auth handles both email AND wallet login.**
Custom auth providers let you add Solana wallet signature verification without building a separate auth server.

**4. Supabase Storage is simpler than Firebase Storage.**
Direct integration with RLS policies. No separate security rules file.

**5. Supabase is open source.**
If you outgrow the hosted service, you can self-host. Firebase locks you into Google.

**6. Real-time subscriptions for live trek tracking.**
Supabase Realtime gives you Postgres LISTEN/NOTIFY for free — live leaderboard updates, active trek status, etc.

**Final verdict: Supabase. Not close.**

### Supabase Schema Strategy

- All user-facing data in Postgres with RLS
- Auth via Supabase Auth (JWT-based)
- File uploads (guide docs, quest images) in Supabase Storage with bucket policies
- Edge Functions for Solana transaction relay and webhook processing
- Realtime subscriptions for live trek status and leaderboard

### What belongs on-chain vs off-chain

| Data | Location | Reason |
|---|---|---|
| Guide reputation score | **On-chain** (PDA) | Must be portable, tamper-proof, owned by guide |
| Booking escrow | **On-chain** (PDA + token accounts) | Trustless payment — neither party can cheat |
| Completion proof | **On-chain** (cNFT) | Permanent, verifiable, collectible |
| Quest definitions | **Off-chain** (Supabase) | Frequently updated, no trust requirement |
| Check-in records | **Off-chain** (Supabase) + on-chain hash | Fast writes, with anchored proof |
| User profiles | **Off-chain** (Supabase) | Personal data, GDPR, frequent updates |
| Reviews | **Off-chain** (Supabase) + on-chain summary | Full text off-chain, aggregated score on-chain |
| Booking metadata | **Off-chain** (Supabase) | Dates, preferences, contact info — no trust need |
| Payment amount + status | **On-chain** (escrow PDA) | Must be verifiable |
| Leaderboard | **Off-chain** (Supabase view) | Computed from on-chain + off-chain data |
| Admin actions | **Off-chain** (Supabase) | Internal operations |

**The principle:** Put data on-chain only when it needs to be trustless, portable, or permanently verifiable. Everything else stays in Postgres where it's fast, cheap, and queryable.

---

## D. Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js 15 (Vercel)                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Quest Map│ │ Booking  │ │ Profile  │ │ Admin    │       │
│  │ + Routes │ │ Flow     │ │ + Reputa-│ │ Panel    │       │
│  │          │ │          │ │ tion     │ │          │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
│       │            │            │            │              │
│  ┌────┴────────────┴────────────┴────────────┴────┐         │
│  │         Wallet Adapter (Phantom/Solflare)       │         │
│  └────────────────────┬───────────────────────────┘         │
└───────────────────────┼─────────────────────────────────────┘
                        │
          ┌─────────────┼─────────────────┐
          │             │                 │
          ▼             ▼                 ▼
┌─────────────┐ ┌──────────────┐ ┌───────────────┐
│  Supabase   │ │  Supabase    │ │  Solana       │
│  Postgres   │ │  Edge Fns    │ │  Devnet/Main  │
│             │ │              │ │               │
│ • Users     │ │ • TX relay   │ │ • Reputation  │
│ • Quests    │ │ • Webhook    │ │   PDA         │
│ • Bookings  │ │   handlers   │ │ • Escrow PDA  │
│ • Reviews   │ │ • Solana     │ │ • Completion  │
│ • Check-ins │ │   verify     │ │   cNFT mint   │
│ • Disputes  │ │              │ │               │
│ • Places    │ └──────┬───────┘ └───────┬───────┘
│ • Routes    │        │                 │
│             │        │    ┌────────────┘
│  + RLS      │        │    │
│  + Realtime │        ▼    ▼
│  + Storage  │ ┌──────────────┐
│             │ │  Arweave     │
└─────────────┘ │  (NFT meta   │
                │   only)      │
                └──────────────┘
```

### Event Flow: Booking → Completion → Reputation

```
1. Tourist selects quest + guide
2. Frontend → Supabase: Create booking record (status: pending)
3. Frontend → Solana: Initialize escrow PDA, transfer USDC
4. Supabase Edge Fn: Confirm TX, update booking status → confirmed
5. Guide accepts → status: active
6. Trek begins:
   a. Tourist arrives at checkpoint
   b. GPS check + QR scan → Supabase: create check_in record
   c. Guide co-signs check-in (wallet signature)
   d. If all checkpoints complete → eligible for completion
7. Guide confirms completion:
   a. Frontend → Solana: release_milestone on escrow
   b. Funds transfer to guide
   c. Frontend → Solana: mint completion cNFT to tourist
   d. Supabase Edge Fn: update booking status → completed
8. Tourist leaves review:
   a. Supabase: insert review record
   b. Supabase Edge Fn → Solana: update_reputation PDA
      (new average score, total completions += 1)
9. Leaderboard: Supabase materialized view recalculates ranks
```

### Safety Architecture

- All guide applications reviewed by human admin before activation
- Check-in requires GPS proximity (within 500m of checkpoint coordinates)
- Guide co-signature required for completion — prevents fake check-ins
- Dispute flow with evidence upload and 48-hour admin SLA
- Automatic guide suspension after 3 upheld disputes
- No quest locations in restricted areas — admin-curated only
- Emergency SOS routes to local emergency contacts + admin dashboard
- Rate limiting on all API endpoints via Supabase Edge Function middleware

---

## E. Solana Program Design

### Design Philosophy

**Three programs. Not nine.** The current repo has 9 Anchor programs, most of which are stubs. This is overengineered. For a 13-day sprint, you need exactly 3 programs that do real work:

1. **tourchain_reputation** — Guide/operator identity and reputation
2. **tourchain_escrow** — Booking payments with milestone release
3. **tourchain_proof** — Completion proof via compressed NFTs

Everything else (quests, routes, check-ins, reviews, leaderboards, admin) lives in Supabase. On-chain programs handle only what requires trustlessness.

---

### Program 1: tourchain_reputation

**Purpose:** Store and update guide reputation in a way that is portable, tamper-proof, and owned by the guide's wallet.

**Accounts:**

```rust
#[account]
pub struct GuideReputation {
    pub authority: Pubkey,          // Guide's wallet
    pub admin: Pubkey,              // Platform admin who verified this guide
    pub name: [u8; 64],             // Fixed-size name
    pub total_reviews: u32,
    pub total_score: u64,           // Sum of all review scores (1-5 scale, stored as 1-500 for precision)
    pub completed_treks: u32,
    pub active_since: i64,          // Unix timestamp
    pub is_verified: bool,
    pub is_suspended: bool,
    pub last_updated: i64,
    pub bump: u8,
}
// PDA seeds: ["guide", guide_wallet.key()]
// Size: 8 + 32 + 32 + 64 + 4 + 8 + 4 + 8 + 1 + 1 + 8 + 1 = 171 bytes
```

**Instructions:**

| Instruction | Signer | What it does | Access control |
|---|---|---|---|
| `initialize_guide` | admin | Creates GuideReputation PDA for a verified guide | Admin only (checked via admin PDA) |
| `update_reputation` | admin | Adds a review score, increments counters | Admin only — prevents self-review |
| `suspend_guide` | admin | Sets is_suspended = true | Admin only |
| `reinstate_guide` | admin | Sets is_suspended = false | Admin only |

**Events:**

```rust
#[event]
pub struct GuideRegistered {
    pub guide: Pubkey,
    pub name: [u8; 64],
    pub timestamp: i64,
}

#[event]
pub struct ReputationUpdated {
    pub guide: Pubkey,
    pub new_total_reviews: u32,
    pub new_average: u64, // score * 100 for 2 decimal precision
    pub completed_treks: u32,
}
```

**Failure cases:**
- Guide already initialized → Anchor `init` constraint prevents double-init
- Non-admin tries to update → constraint check fails
- Suspended guide receives booking → frontend checks `is_suspended` before allowing

**MVP vs Later:**
- MVP: initialize_guide, update_reputation
- Later: suspend_guide, reinstate_guide, transfer_authority (guide changes wallet)

---

### Program 2: tourchain_escrow

**Purpose:** Hold booking payments in a trustless escrow with milestone-based release and dispute resolution.

**Accounts:**

```rust
#[account]
pub struct BookingEscrow {
    pub tourist: Pubkey,
    pub guide: Pubkey,
    pub admin: Pubkey,              // Dispute resolver
    pub amount: u64,                // Total payment in USDC lamports
    pub released: u64,              // Amount released so far
    pub milestones: u8,             // Total milestones (e.g., 3)
    pub milestones_completed: u8,
    pub status: BookingStatus,
    pub created_at: i64,
    pub dispute_deadline: i64,      // After this, auto-release remaining
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum BookingStatus {
    Funded,        // Tourist has deposited
    Active,        // Guide accepted, trek started
    Completed,     // All milestones done
    Disputed,      // Under review
    Refunded,      // Returned to tourist
    Cancelled,     // Cancelled before start
}
// PDA seeds: ["escrow", tourist.key(), guide.key(), created_at.to_le_bytes()]
```

**Token accounts:**
- Escrow vault: PDA-owned USDC token account
- Tourist USDC ATA: source of funds
- Guide USDC ATA: destination on release

**Instructions:**

| Instruction | Signer | What it does |
|---|---|---|
| `create_escrow` | tourist | Initializes escrow PDA, transfers USDC from tourist to vault |
| `release_milestone` | guide + tourist (or admin) | Releases 1/N of funds to guide. Requires both signatures OR admin override. |
| `complete_booking` | guide + tourist | Releases remaining funds, sets status to Completed |
| `open_dispute` | tourist OR guide | Sets status to Disputed, freezes releases |
| `resolve_dispute` | admin | Splits remaining funds per admin decision |
| `cancel_booking` | tourist (if status == Funded, guide hasn't accepted) | Returns full amount to tourist |

**Access control:**
- Only the tourist can fund
- Milestone release requires dual signature (tourist + guide) OR admin
- Only admin can resolve disputes
- Cancel only works before guide acceptance

**Failure cases:**
- Tourist tries to cancel after trek starts → rejected
- Guide tries to release without tourist co-sign → rejected (unless admin override)
- Double-release attempt → milestones_completed check prevents overpay
- Escrow already completed → status check prevents re-entry

**MVP vs Later:**
- MVP: create_escrow, release_milestone, complete_booking, cancel_booking (use SOL instead of USDC to avoid SPL token complexity)
- V1: USDC support, open_dispute, resolve_dispute
- V2: Partial refund logic, auto-release after dispute_deadline

---

### Program 3: tourchain_proof

**Purpose:** Mint compressed NFTs as proof of trek completion. These are permanent, verifiable, and collectible.

**Approach:** Use Metaplex Bubblegum for compressed NFTs. Each completion mints a cNFT to the tourist's wallet at ~$0.00001 per mint.

**Accounts:**

```rust
// No custom account needed — Bubblegum handles the Merkle tree
// The program just wraps the CPI call with access control

#[account]
pub struct ProofAuthority {
    pub admin: Pubkey,
    pub merkle_tree: Pubkey,
    pub total_minted: u64,
    pub bump: u8,
}
// PDA seeds: ["proof_authority"]
```

**Instructions:**

| Instruction | Signer | What it does |
|---|---|---|
| `initialize_tree` | admin | Creates Merkle tree for cNFT minting |
| `mint_completion_proof` | admin | CPI to Bubblegum to mint cNFT to tourist wallet |

**Metadata per cNFT:**
```json
{
  "name": "Annapurna Circuit Completion",
  "symbol": "TREK",
  "uri": "https://arweave.net/{hash}",
  "attributes": [
    { "trait_type": "Route", "value": "Annapurna Circuit" },
    { "trait_type": "Duration", "value": "14 days" },
    { "trait_type": "Guide", "value": "Ram Gurung" },
    { "trait_type": "Completed", "value": "2026-04-15" },
    { "trait_type": "Checkpoints", "value": "12/12" }
  ]
}
```

**Access control:**
- Only admin (platform backend) can mint — prevents fake proofs
- Admin mints only after verifying completion via Supabase check-in records + guide co-signature

**MVP vs Later:**
- MVP: initialize_tree, mint_completion_proof with hardcoded metadata template
- V1: Dynamic metadata with Arweave upload
- V2: Rare badges (summit proofs, seasonal first-completions), collection-level metadata

---

## F. Data Model (Supabase Postgres)

```sql
-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    wallet_address TEXT UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'tourist' CHECK (role IN ('tourist', 'guide', 'admin')),
    xp INTEGER NOT NULL DEFAULT 0,
    rank TEXT NOT NULL DEFAULT 'novice',
    total_completions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- GUIDES (extends users with guide-specific data)
-- ============================================
CREATE TABLE guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number TEXT,
    license_document_url TEXT,
    bio TEXT,
    languages TEXT[] DEFAULT '{}',
    specialties TEXT[] DEFAULT '{}',
    years_experience INTEGER DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    reputation_pda TEXT,              -- Solana PDA address
    on_chain_score NUMERIC(5,2),      -- Cached from chain
    on_chain_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PLACES (verified locations)
-- ============================================
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'trailhead', 'checkpoint', 'summit', 'teahouse',
        'viewpoint', 'temple', 'village', 'activity_center'
    )),
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    altitude_meters INTEGER,
    region TEXT NOT NULL,
    qr_code_hash TEXT,                -- For QR check-in verification
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ROUTES
-- ============================================
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'moderate', 'challenging', 'extreme')),
    duration_days INTEGER NOT NULL,
    distance_km NUMERIC(6,1),
    max_altitude_meters INTEGER,
    region TEXT NOT NULL,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ROUTE CHECKPOINTS (ordered stops on a route)
-- ============================================
CREATE TABLE route_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id),
    sequence_order INTEGER NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(route_id, sequence_order)
);

-- ============================================
-- QUESTS (story-driven challenges at places)
-- ============================================
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES routes(id),
    place_id UUID REFERENCES places(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    story_text TEXT,                   -- Narrative / lore / clue
    quest_type TEXT NOT NULL CHECK (quest_type IN (
        'visit', 'photo', 'learn', 'interact', 'collect'
    )),
    xp_reward INTEGER NOT NULL DEFAULT 10,
    difficulty TEXT NOT NULL DEFAULT 'easy',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- SERVICES (guide offerings)
-- ============================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
    route_id UUID REFERENCES routes(id),
    title TEXT NOT NULL,
    description TEXT,
    price_usd NUMERIC(10,2) NOT NULL,
    max_group_size INTEGER NOT NULL DEFAULT 8,
    includes TEXT[] DEFAULT '{}',     -- ['meals', 'permit', 'porter']
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tourist_id UUID NOT NULL REFERENCES users(id),
    guide_id UUID NOT NULL REFERENCES guides(id),
    service_id UUID NOT NULL REFERENCES services(id),
    route_id UUID REFERENCES routes(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'active', 'completed',
        'disputed', 'refunded', 'cancelled'
    )),
    start_date DATE NOT NULL,
    end_date DATE,
    total_price_usd NUMERIC(10,2) NOT NULL,
    escrow_pda TEXT,                  -- Solana escrow PDA address
    escrow_tx_signature TEXT,         -- Funding transaction
    milestones_total INTEGER NOT NULL DEFAULT 1,
    milestones_completed INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- CHECK-INS
-- ============================================
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES users(id),
    place_id UUID NOT NULL REFERENCES places(id),
    quest_id UUID REFERENCES quests(id),
    method TEXT NOT NULL CHECK (method IN ('gps', 'qr', 'guide_confirm', 'gps_qr')),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    guide_signature TEXT,             -- Wallet signature from guide co-signing
    photo_url TEXT,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    guide_id UUID NOT NULL REFERENCES guides(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    on_chain_updated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(booking_id, reviewer_id)   -- One review per booking per user
);

-- ============================================
-- DISPUTES
-- ============================================
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    filed_by UUID NOT NULL REFERENCES users(id),
    category TEXT NOT NULL CHECK (category IN (
        'no_show', 'safety', 'billing', 'quality', 'other'
    )),
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
        'open', 'under_review', 'resolved_refund',
        'resolved_partial', 'resolved_dismissed'
    )),
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- ============================================
-- COMPLETION PROOFS (links to on-chain cNFTs)
-- ============================================
CREATE TABLE completion_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES users(id),
    route_id UUID REFERENCES routes(id),
    nft_mint_address TEXT,            -- Solana cNFT address
    mint_tx_signature TEXT,
    metadata_uri TEXT,                -- Arweave URI
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- LEADERBOARD VIEW
-- ============================================
CREATE MATERIALIZED VIEW leaderboard AS
SELECT
    u.id,
    u.display_name,
    u.avatar_url,
    u.xp,
    u.rank,
    u.total_completions,
    COUNT(DISTINCT ci.place_id) AS unique_places_visited,
    RANK() OVER (ORDER BY u.xp DESC) AS position
FROM users u
LEFT JOIN check_ins ci ON ci.user_id = u.id AND ci.verified = true
WHERE u.role = 'tourist'
GROUP BY u.id
ORDER BY u.xp DESC;

-- Refresh periodically via cron or trigger
-- REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;

-- ============================================
-- ROW LEVEL SECURITY (examples)
-- ============================================

-- Users can read all profiles, update only their own
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON users FOR SELECT USING (true);
CREATE POLICY "Self update" ON users FOR UPDATE USING (auth.uid() = id);

-- Bookings visible to tourist, guide, or admin
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own bookings" ON bookings FOR SELECT USING (
    auth.uid() = tourist_id
    OR auth.uid() IN (SELECT user_id FROM guides WHERE id = guide_id)
    OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
);

-- Reviews are public read, only reviewer can create
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviewer creates" ON reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);
```

---

## G. Implementation Roadmap

### MVP (Days 1–7) — "It works, it's real"

Ship:
- Supabase schema deployed with seed data (5 routes, 10 places, 3 guides)
- Supabase Auth (email signup + wallet connect)
- Frontend: Home page, quest/route browser, guide profiles, booking flow
- tourchain_reputation program deployed to devnet
- Basic check-in flow (GPS proximity)
- Booking creates a record in Supabase (escrow stub — SOL transfer on devnet)
- Guide dashboard: view bookings, confirm completion
- Review submission → on-chain reputation update
- Mobile-responsive design

Postpone:
- Real USDC escrow (use SOL or mock)
- cNFT minting (show the metadata, mint in V1)
- Dispute flow
- Admin panel
- Leaderboard

### V1 (Days 8–11) — "It's impressive"

Ship:
- tourchain_escrow program with real SOL milestone release
- tourchain_proof program with Bubblegum cNFT minting
- Admin panel: guide verification, dispute review
- Leaderboard (materialized view + frontend)
- Quest system with story text and XP rewards
- QR code check-in at partner locations
- Polish: animations, loading states, error handling
- One Piece narrative layer: quest clues, "Laughing Island" final quest

Postpone:
- USDC support
- Arweave metadata upload
- Multi-language
- Push notifications

### V2 (Post-hackathon) — "It's a company"

Ship:
- USDC escrow with real SPL token transfers
- Arweave permanent metadata storage
- Full dispute resolution with evidence upload
- Guide payout dashboard with earnings history
- Tourist mobile app (React Native or Expo)
- Nepal Tourism Board API integration
- Permit verification system
- Multi-language (Nepali, English, Chinese, Korean, Japanese)
- Push notifications for trek updates
- Advanced analytics dashboard
- Seasonal dynamic pricing

---

## H. 13-Day Execution Plan

**Team:**
- **S** = Solana / backend engineer
- **F** = Full-stack frontend engineer
- **P** = Product / UX / demo engineer

---

### Day 1 — Foundation

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | Supabase project + schema | All tables created, RLS policies active, seed data loaded | `psql` queries return seed routes, places, guides |
| F | Next.js repo + layout | App router structure, Tailwind + shadcn configured, landing page shell | `npm run dev` shows styled landing page |
| P | Design system + wireframes | Figma/sketch of 6 core screens, color palette, font choices | Team reviews and approves screen flows |

### Day 2 — Auth + Data Layer

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | Supabase Auth + wallet connect | Email signup, wallet signature login, session management | User can sign up, log in, and see their profile |
| F | Route/quest browser | Fetches routes + places from Supabase, displays cards with Mapbox | Browse page shows 5 routes with map pins |
| P | Guide profile page design | Static guide profile with reputation display, service listing | Guide profile page renders with mock data |

### Day 3 — Solana Program 1

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | tourchain_reputation deployed | Anchor program on devnet with initialize_guide + update_reputation | CLI test: create guide PDA, update score, read back |
| F | Booking flow UI | Multi-step form: select service → pick dates → confirm | Tourist can walk through booking form (no payment yet) |
| P | Connect guide profiles to Supabase | Real data from guides table, reputation from on-chain PDA | Guide page shows real data + on-chain score |

### Day 4 — Booking + Escrow Foundation

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | tourchain_escrow program v1 | create_escrow (SOL transfer to PDA vault) + release_milestone | CLI test: fund escrow, release one milestone |
| F | Booking submission wired | Frontend creates Supabase booking + calls escrow program | Tourist can book and see "Confirmed" status |
| P | Guide dashboard v1 | Guide sees incoming bookings, can accept/view details | Guide logs in and sees their bookings list |

### Day 5 — Check-in System

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | Check-in API + GPS verification | Supabase Edge Function validates GPS proximity to checkpoint | Check-in request within 500m succeeds, outside fails |
| F | Check-in UI + map progress | Tourist sees checkpoint list on active trek, can check in | Check-in button appears when near checkpoint, records to DB |
| P | Quest content creation | Write 10 quests with story text for Annapurna route | Quests visible on route detail page with narrative |

### Day 6 — Completion + Review Flow

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | Completion + reputation update | Guide confirms completion → escrow released → reputation PDA updated | End-to-end: complete booking → funds move → score updates |
| F | Review submission UI | Tourist submits rating + comment after completion | Review saved to Supabase, triggers on-chain update |
| P | Tourist profile + achievements | Profile page shows completions, XP, rank, check-in history | Tourist can see their journey history |

### Day 7 — MVP Polish

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | Error handling + edge cases | Graceful failures for all Solana calls, retry logic | No unhandled promise rejections in any flow |
| F | Responsive polish | All pages work on mobile, loading states, empty states | Full flow works on phone-sized viewport |
| P | Seed realistic content | Photos, descriptions, guide bios for all demo content | Every page looks populated and real |

**MVP CHECKPOINT: Full booking → check-in → completion → review → reputation loop working end-to-end on devnet.**

### Day 8 — cNFT Proof System

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | tourchain_proof program | Merkle tree initialized, mint_completion_proof working | CLI: mint cNFT, verify it exists in tourist wallet |
| F | Proof display in profile | Tourist sees cNFT proof cards in their achievement collection | Completion proof shows with metadata in profile |
| P | Admin panel v1 | Guide verification queue: approve/reject with notes | Admin can verify a pending guide application |

### Day 9 — Leaderboard + Gamification

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | Leaderboard materialized view | Supabase view + refresh function + API endpoint | Leaderboard returns ranked users with XP and completions |
| F | Leaderboard page + rank badges | Visual leaderboard with rank badges and XP display | Leaderboard page shows ranked tourists |
| P | One Piece narrative integration | "Laughing Island" final quest, story arc across routes | Quest browser has One Piece themed meta-quest |

### Day 10 — QR Check-in + Admin

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | QR code generation + verification | HMAC-based daily QR codes for checkpoint locations | QR scan at checkpoint creates verified check-in |
| F | QR scanner in app | Camera-based QR scan on mobile web | Tourist scans QR at checkpoint, check-in records |
| P | Dispute flow UI | Dispute submission form + admin review panel | Tourist can file dispute, admin can resolve it |

### Day 11 — Integration + Hardening

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | Full integration test | Script that runs entire flow: register → book → check-in → complete → review → mint | Script passes end-to-end on devnet |
| F | Error boundaries + edge cases | Handle wallet disconnects, network errors, empty states | No crashes on any user path |
| P | Demo script + talking points | Written 4-minute demo script with screenshots | Team rehearses demo once |

### Day 12 — Demo Polish

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | Performance + reliability | Optimize RPC calls, add caching, fix any flaky transactions | All Solana calls complete in <3 seconds |
| F | Animation + micro-interactions | Framer Motion on key transitions, confetti on completion | Check-in and completion moments feel celebratory |
| P | Landing page + pitch video | Hero section, value prop, demo recording | Landing page could convince a stranger |

### Day 13 — Ship Day

| Owner | Goal | Deliverable | Done when |
|---|---|---|---|
| S | Final devnet deploy + verify | All 3 programs verified on Solana Explorer, clean deploy | Programs show green on explorer |
| F | Production deploy on Vercel | Final build, environment variables set, domain configured | Live URL works end-to-end |
| P | Submission package | README, demo video, architecture diagram, pitch deck | All submission materials uploaded |

---

## I. Claude Code CLI Prompts

### 1. Repo Audit

```
Audit this Solana tourism project repository. Check every file in programs/, apps/web/, backend/, and sdk/. For each file, report: (1) whether it compiles/runs, (2) any hardcoded secrets or paths, (3) any stub/placeholder code with "TODO" or "would go here" comments, (4) any security issues (missing access control, unbounded inputs, missing validation). Output a prioritized fix list with file paths and line numbers. Pay special attention to: Anchor.toml wallet path format, empty IDLs in sdk/src/index.ts, undefined variables in backend routes, and missing Bubblegum tree provisioning.
```

### 2. Architecture Setup

```
Set up a Next.js 15 (App Router) project with TypeScript, Tailwind CSS, and shadcn/ui. Create the following route structure: /(public): landing page, /explore (route browser), /guide/[id] (guide profile). /(auth): /login, /signup. /(app): /dashboard, /book/[serviceId], /trek/[bookingId] (active trek with check-ins), /profile, /leaderboard. /(admin): /admin/guides, /admin/disputes, /admin/analytics. Configure Supabase client with environment variables. Add @solana/wallet-adapter-react with Phantom and Solflare adapters. Add Mapbox GL JS. Create a shared layout with navigation, wallet connect button, and auth state. All pages should be responsive.
```

### 3. Solana Program — Reputation

```
Write an Anchor program called "tourchain_reputation" for Solana. It manages guide reputation PDAs. Accounts: GuideReputation with fields: authority (Pubkey), admin (Pubkey), name ([u8; 64]), total_reviews (u32), total_score (u64), completed_treks (u32), active_since (i64), is_verified (bool), is_suspended (bool), last_updated (i64), bump (u8). PDA seeds: ["guide", authority.key()]. Instructions: (1) initialize_guide — admin creates a new guide PDA, (2) update_reputation — admin adds a review score and increments completed_treks, (3) suspend_guide — admin sets is_suspended to true, (4) reinstate_guide — admin sets is_suspended to false. All instructions require admin signature. Emit events for each instruction. Include proper error codes. Write a comprehensive test file using anchor-bankrun or solana-program-test.
```

### 4. Solana Program — Escrow

```
Write an Anchor program called "tourchain_escrow" for Solana. It holds SOL in a PDA vault for milestone-based booking payments. Accounts: BookingEscrow with fields: tourist (Pubkey), guide (Pubkey), admin (Pubkey), amount (u64), released (u64), milestones (u8), milestones_completed (u8), status (enum: Funded/Active/Completed/Disputed/Refunded/Cancelled), created_at (i64), dispute_deadline (i64), bump (u8). PDA seeds: ["escrow", tourist.key(), guide.key(), created_at.to_le_bytes()]. The vault PDA holds native SOL. Instructions: (1) create_escrow — tourist transfers SOL to vault PDA, (2) activate — guide accepts the booking, (3) release_milestone — requires tourist + guide signature, transfers amount/milestones SOL to guide, increments milestones_completed, (4) complete_booking — releases remaining funds when all milestones done, (5) cancel_booking — returns funds to tourist if status is Funded. Include overflow checks, status guards, and proper error codes. Write tests.
```

### 5. Database Schema

```
Create a Supabase migration file with the complete schema for TourChain. Tables: users (id, email, wallet_address, display_name, avatar_url, role, xp, rank, total_completions, timestamps), guides (id, user_id FK, license info, bio, languages[], specialties[], is_verified, reputation_pda, on_chain_score, timestamps), places (id, name, description, category enum, lat, lng, altitude, region, qr_code_hash, timestamps), routes (id, name, description, difficulty enum, duration_days, distance_km, region, timestamps), route_checkpoints (route_id, place_id, sequence_order, is_required), quests (id, route_id, place_id, title, description, story_text, quest_type enum, xp_reward), services (guide_id, route_id, title, price_usd, max_group_size, includes[]), bookings (tourist_id, guide_id, service_id, status enum, dates, price, escrow_pda, milestones), check_ins (booking_id, user_id, place_id, method enum, lat, lng, guide_signature, verified), reviews (booking_id, reviewer_id, guide_id, rating 1-5, comment), disputes (booking_id, filed_by, category, description, evidence_urls[], status, resolution), completion_proofs (booking_id, user_id, nft_mint_address, metadata_uri). Add RLS policies: public read on users/guides/places/routes/reviews, self-only write on own records, admin full access. Create a materialized view for the leaderboard. Include seed data: 5 Nepal trekking routes, 15 checkpoint places, 3 verified guides, 10 quests.
```

### 6. Frontend — Core Flows

```
Build the core frontend flows for TourChain in Next.js 15 with shadcn/ui and Tailwind. (1) Explore page: grid of route cards fetched from Supabase, filterable by difficulty and region, each card shows name, image, duration, difficulty badge. Clicking opens route detail with Mapbox map showing checkpoints. (2) Guide profile: avatar, bio, languages, on-chain reputation score (fetch from Solana PDA), service listings, reviews. (3) Booking flow: select service → pick dates → connect wallet → confirm booking (creates Supabase record + calls escrow program). (4) Active trek view: shows checkpoint progress bar, check-in buttons (enabled when GPS is within 500m), quest clues that unlock on check-in. (5) Profile page: user stats, XP, rank badge, completion proof cards (cNFT display), check-in history on map. Use Framer Motion for page transitions and check-in celebrations. All pages must be mobile-first responsive.
```

### 7. Auth Implementation

```
Implement dual authentication for TourChain. (1) Supabase Auth: email/password signup and login using @supabase/ssr for Next.js App Router. Create middleware that protects /dashboard, /book, /trek, /profile, /admin routes. Store session in cookies. (2) Wallet connect: add @solana/wallet-adapter with Phantom and Solflare. When a logged-in user connects wallet, save wallet_address to their Supabase user record. (3) Wallet signature verification: for on-chain actions (booking, review), require the user to sign a message proving wallet ownership. Verify signature server-side before executing Solana transactions. (4) Role-based access: tourists see tourist dashboard, guides see guide dashboard, admins see admin panel. Check role from Supabase users table. (5) Create AuthProvider context that exposes: user, session, wallet, isGuide, isAdmin, signIn, signOut, connectWallet.
```

### 8. Admin Panel

```
Build an admin panel for TourChain at /admin with these pages: (1) Guide Verification — table of pending guide applications with document links, approve/reject buttons, rejection reason input. On approve: update guides.is_verified in Supabase + call initialize_guide on tourchain_reputation program. (2) Dispute Management — table of open disputes with booking details, both parties' info, evidence links. Resolution actions: refund, partial release, dismiss. Updates dispute status and triggers escrow action. (3) Analytics Dashboard — cards showing: total users, active treks, total bookings, revenue, dispute rate. Charts: bookings over time, top routes, top guides. Data from Supabase aggregation queries. (4) Content Management — CRUD for places, routes, quests. Form with map picker for place coordinates. All admin pages require role='admin' check. Use shadcn/ui data tables with sorting and filtering.
```

### 9. Testing + Hardening

```
Add comprehensive testing to TourChain. (1) Anchor program tests: test every instruction in all 3 programs — happy path and failure cases. Test: initialize guide, update reputation, double-init rejection, non-admin rejection. Test: create escrow, release milestone, over-release rejection, cancel after activation rejection. Use anchor-bankrun. (2) Frontend tests: add Vitest + React Testing Library. Test: booking flow renders correctly, auth redirects work, wallet connect state management. (3) Integration test script: a single TypeScript script that runs the full flow on devnet — create guide → book service → fund escrow → check in → complete → review → update reputation → mint proof. (4) Security hardening: add rate limiting to Supabase Edge Functions, input validation with Zod on all API inputs, CSP headers in Next.js config, sanitize all user-generated content before display.
```

### 10. Demo Polish

```
Polish TourChain for demo presentation. (1) Landing page: hero with Nepal mountain background, value proposition, "Start Your Adventure" CTA, feature highlights (trust, quests, proof), how-it-works section with 3 steps, footer. Use Framer Motion for scroll-triggered animations. (2) Loading states: skeleton loaders on all data-fetching pages, optimistic updates on check-ins and reviews. (3) Celebration moments: confetti animation on trek completion, XP counter animation on check-in, rank-up modal when XP threshold crossed. (4) Empty states: friendly illustrations and CTAs when no bookings, no check-ins, no reviews. (5) Error states: toast notifications for failed transactions, retry buttons, wallet connection prompts. (6) Demo data: ensure all routes have high-quality images, guide profiles have realistic bios and photos, quest text is engaging and culturally accurate. (7) One Piece Easter egg: "Laughing Island" quest chain with treasure hunt narrative that spans multiple routes.
```

---

## J. What to Avoid

**Overbuilding:**
- Do NOT build 9 Anchor programs. Build 3. The others are complexity theater.
- Do NOT add Wormhole cross-chain bridge. Your users are in Nepal with Phantom wallets, not bridging from Ethereum.
- Do NOT build a custom token ($TREK) for the hackathon. Tokens invite regulatory questions and add zero product value in 13 days. Use XP points in Supabase.
- Do NOT build a DAO governance system. No one is voting on proposals in week 2 of a startup. Admin makes decisions.

**Token-first thinking:**
- If your first instinct is "what's the token model?", you're building a ponzi, not a product. The product is trust infrastructure for tourism. Tokens come in year 2 if ever.

**DeFi complexity:**
- Do NOT route escrow funds through Kamino/Solend/MarginFi for yield. The yield on a $1,200 booking held for 2 weeks is about $3. It adds massive smart contract risk for pocket change. Ship the escrow. Skip the yield vault.

**Unsafe quest design:**
- NEVER create quests that require going off-trail, entering private property, climbing to dangerous viewpoints, or doing anything a reasonable person would consider risky.
- Every quest location must be a verified public place or approved partner venue.
- No quests that require nighttime completion, solo wilderness navigation, or interaction with wildlife.

**Hardcoded secrets:**
- No Mapbox tokens in source code.
- No wallet keypair paths with Windows backslashes.
- No MongoDB localhost connection strings without env var fallback.
- No treasury addresses baked into program constants.
- Use .env.local for all secrets. Create .env.example with placeholders.

**Mock data that never gets replaced:**
- The current dashboard shows "1,248 tourists" and "4,520 SOL in escrow" as hardcoded strings. This is the hallmark of a project that looks good in screenshots but falls apart on click. Every number must come from a database query or on-chain read.

**Missing auth:**
- The current backend has zero authentication. Anyone can call any endpoint. This is a critical vulnerability. Supabase RLS solves this at the database level — but you still need auth on Edge Functions.

**Missing tests:**
- Zero test files is not acceptable for a project handling money. Write at minimum: one test per Anchor instruction and one integration test for the full booking flow.

**Confusing UX:**
- Do not make tourists understand PDAs, program IDs, or transaction signatures. They should see "Book Now", not "Initialize Escrow PDA". The blockchain is infrastructure, not UI.
- Wallet connect should be optional for browsing. Required only at booking time.

**Fragile on-chain design:**
- Do NOT store unbounded Strings on-chain. Use fixed-size byte arrays.
- Do NOT use wallet-derived PDAs without bumps.
- Do NOT skip access control on any instruction.
- Do NOT assume devnet behavior matches mainnet.

**Things that look impressive but aren't real:**
- ZK GPS proofs sound amazing in a pitch deck. Building Groth16 circuits for GPS verification in 13 days is not possible for a 3-person team. Use simple GPS proximity + guide co-signature instead. It solves the same problem with 1% of the complexity.
- "AI-powered trip planning" is a feature, not a product. If the AI planner is the best part of your demo, you're a ChatGPT wrapper, not a tourism platform.

---

## K. Final Strategy

### The minimum version that can win

A working demo that shows:
1. Tourist browses routes on a beautiful map
2. Books a verified guide (real reputation score from Solana PDA)
3. Checks in at 3 checkpoints on a trek (GPS verification)
4. Completes trek → guide confirms → escrow releases SOL to guide
5. Tourist receives completion proof (cNFT in wallet)
6. Tourist leaves review → guide reputation updates on-chain
7. Leaderboard shows tourist ranking

This loop, live on devnet with real data, is more impressive than 9 stub programs with a polished landing page. Judges want to see money move, state change, and real user value.

### The version that can become a real company

Everything above plus:
- USDC payments (not SOL — tourists don't hold SOL)
- Nepal Tourism Board partnership for permit integration
- Mobile app (React Native) for on-trail use
- 50+ verified guides in Kathmandu, Pokhara, and Lukla
- Guide payout system with bank/eSewa integration
- Multi-language support (English, Nepali, Chinese, Korean)
- Insurance/emergency fund with real underwriting
- API for third-party travel agencies to build on top

### The biggest risk

**Not government partnership — it's user acquisition.** You can build perfect infrastructure, but if tourists don't know TourChain exists, guides won't list, and if guides don't list, tourists have nothing to book. The cold-start problem is the real threat.

Mitigation: Start with 5 guides in Kathmandu who are already on TripAdvisor. Offer them zero-commission listings for 6 months. Get 50 tourists through them. Use those completion proofs and reviews as social proof to recruit the next 50 guides.

### The most important next action

**Deploy the 3 Anchor programs to devnet today.** Everything else — the frontend, the content, the demo — is decoration on top of working infrastructure. If the programs don't work, nothing works. Start with `tourchain_reputation`. Get a PDA created and read back. Then build outward.

---

*This document is a living strategy. Update it as you build. Delete sections that become irrelevant. The goal is not to follow a plan — it's to ship a product that tourists in Nepal would actually use.*
