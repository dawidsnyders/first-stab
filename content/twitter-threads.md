# Kamino Fixed Rates - Content Strategy

> **Philosophy:** Twitter = punchy hooks that drive to long-form. Blog/video = where the depth lives. Thread content becomes articles.

---

## Twitter Posts (Short-Form)

### 1. Main Announcement (@kamino)

**Timing:** Launch Day T-0
**Format:** Post + reply with blog link

---

**Tweet:**

Introducing Kamino Fixed Rates.

Fixed-rate, fixed-term borrowing. The foundation for institutional credit on Solana.

Live today with @FalconX as our first institutional borrower.

[VIDEO: Marius 60-90sec announcement]

---

**Reply:**

Full details: [blog link]

---

### 2. Co-Founder Post (@y2kappa)

**Timing:** Launch Day T+15min
**Format:** Long-form X post

---

Today we're launching Fixed Rates—the single most important piece of credit infrastructure for institutions in DeFi.

Before crypto, I worked at Bloomberg building financial infrastructure. One thing was always true in TradFi: serious players need predictable cost of capital. Variable rates work for some use cases. They don't work for institutions managing quarterly P&Ls or RWA strategies with fixed yield profiles.

The fundamental issue with utilization-based rates: when a large borrower takes $30M from a $100M pool, utilization jumps from 50% to 80%. Everyone's rate doubles overnight. Neither borrowers nor lenders control what they'll pay tomorrow. Both are rate takers.

Fixed Rates inverts this. Borrowers lock their rate for 1, 3, or 6 months. No surprises. No rate spikes at 2am because someone else entered the pool. Predictable cost of capital—the way institutions actually operate.

What excites me most: this creates DeFi's first real yield curve. Different rates for different durations. Term structure. Price discovery driven by actual supply and demand, not algorithmic utilization curves. This is how real credit markets work. Now it's onchain.

We built this on the same infrastructure that's processed $100B+ in loans with zero bad debt. Same Kamino Lend smart contracts. Same security model. 18 audits. 3 formal verifications. Open source from day one. New capability, proven foundation.

This is just the first step. Borrow Intents is coming next—letting borrowers post their desired terms onchain. A limit order for credit. Then RWA-specific markets. Then Multiply integration. The infrastructure for institutional DeFi is being built. On Kamino. On Solana.

Try Fixed Rates today: [link]
Full announcement: [blog link]
Institutions: institutions@kamino.finance

---

### 3. Pre-Launch Teaser Posts

**L-14:**
DeFi rates can swing 300% in a day. For institutions? Untenable. We're fixing this. [GRAPHIC]

**L-10:**
What institutions need from DeFi credit: predictable costs, duration matching, size without impact, battle-tested security. We listened. [GRAPHIC]

**L-3:**
Fixed rate. Fixed term. January. [VIDEO TEASER]

---

### 4. Post-Launch Hook Posts

**L+1 (FalconX quote):**
"Kamino is providing the term structure necessary to operationalize our Asset-Liability Management." – Craig Birchall @FalconX [QUOTE CARD]

**L+2 (How-to hook):**
Lock your rate in 3 steps. Full walkthrough: [blog/video link]

**Weekly stats:**
Fixed Rates week [X]: $[X]M borrowed, [X] active loans. [STATS GRAPHIC]

---

## Long-Form Content (Blog / Articles)

### Article 1: "The Variable Rate Problem" (L-14)

**Publish on:** gov.kamino.finance blog
**Hook post:** Links to this from L-14 teaser

---

**Outline:**

1. **The $200B Problem**
   - Almost all DeFi lending uses utilization-based variable rates
   - Rates determined by pool utilization, can swing 300% in a day
   - A borrower at 5% might pay 15% next week

2. **Why This Breaks Institutional Use Cases**
   - Institutions budget quarterly—can't tell CFO cost might double
   - RWA strategies need predictable spreads
   - Large borrowers move the market against themselves by entering

3. **What Traditional Finance Does Differently**
   - Repo markets, credit lines, corporate bonds—all fixed rate
   - Why? Institutions need to forecast costs
   - Duration matching is fundamental to ALM

4. **Real Examples of What Breaks**
   - Carry trades invert when borrow rates spike
   - Institutions can't extend fixed-rate credit lines to clients
   - RWA issuers can't build fixed-income products

5. **The Infrastructure Gap**
   - The building block doesn't exist in DeFi
   - Until now—introducing Fixed Rates (teaser)

---

### Article 2: "Why Institutions Need Fixed Rates" (L-12)

**Publish on:** gov.kamino.finance blog
**Audience:** Institutional readers, RWA issuers

---

**Outline:**

1. **What We Learned Talking to Institutions**
   - Spent a year talking to trading desks, funds, brokers
   - Four consistent needs emerged

2. **Need #1: Predictable Funding Costs**
   - "Can't tell CFO cost of capital might double"
   - Quarterly/annual planning cycles don't fit variable rates

3. **Need #2: Duration Matching**
   - Assets have yield profiles (3-month, 6-month)
   - Need matching funding costs for ALM
   - Asset-liability management is fundamental

4. **Need #3: Size Without Impact**
   - Large borrowers push utilization-based rates up
   - $20M borrow moves the market against yourself
   - Fixed rates eliminate this dynamic

5. **Need #4: Track Record and Security**
   - Audits, formal verification, proven history required
   - Not optional—table stakes for institutional adoption

6. **How Kamino Addresses All Four**
   - Fixed Rates product overview
   - $100B+ loans, $0 bad debt, 18 audits

---

### Article 3: "How Fixed Rates Work" (Launch Day)

**Publish on:** gov.kamino.finance blog
**Purpose:** Technical deep dive

---

**Outline:**

1. **The Mechanics**
   - Lock rate for 1, 3, or 6 months
   - Rate locked from day one through expiry
   - No changes regardless of utilization

2. **Conditional Liquidity**
   - Lenders signal availability at specific rates
   - No opportunity cost while waiting
   - Funds stay productive until borrowed

3. **Instant Execution**
   - When terms match, borrow atomically
   - Single transaction
   - No negotiation or waiting

4. **Auto-Rollover**
   - Loans can extend automatically at maturity
   - If liquidity available at similar terms
   - Seamless continuous exposure

5. **The Withdrawal Queue**
   - How lenders exit
   - Orderly liquidity management

6. **What This Enables: DeFi's First Yield Curve**
   - Different rates for different durations
   - Real price discovery for credit
   - Term structure emerges from supply/demand

---

### Article 4: "Fixed Rates for RWA Issuers" (L+3)

**Publish on:** gov.kamino.finance blog
**Audience:** RWA protocols, tokenized asset issuers

---

**Outline:**

1. **The RWA Financing Problem**
   - Tokenized assets often have fixed yield profiles
   - Variable borrowing costs create spread risk
   - Can't build fixed-income products on variable funding

2. **Duration Matching for RWAs**
   - Match 3-month T-bill yield with 3-month fixed borrow
   - Predictable spreads enable real products

3. **Scaling Without Impact**
   - Large borrows don't spike rates
   - Institutional scale is possible

4. **Integration Path**
   - How RWA issuers can integrate
   - API access, institutional onboarding

---

### Article 5: "Under the Hood: Fixed Rates Architecture" (L+7)

**Publish on:** gov.kamino.finance blog
**Audience:** Technical, developers, auditors

---

**Outline:**

1. **Design Philosophy**
   - Built on proven Kamino Lend infrastructure
   - Same security model, new capability

2. **Rate Locking Mechanism**
   - How rates are locked on-chain
   - Smart contract mechanics

3. **Liquidation Handling**
   - Same collateral/health factor model
   - What happens if position becomes unhealthy

4. **Security Posture**
   - 18 audits, 3 formal verifications
   - Open source, verifiably built

5. **Roadmap: Borrow Intents**
   - Limit orders for credit
   - Post desired terms, lenders fill

---

## Video Content

| Asset | Length | Purpose |
|-------|--------|---------|
| Marius announcement | 60-90s | Main launch, tweets from @kamino and @y2kappa |
| Product walkthrough | 2-3min | Embed in "How Fixed Rates Work" article |
| Teaser clip | 15-30s | L-3 pre-launch hype |
| "Variable rate problem" explainer | 2min | Embed in Article 1 |
| Institutional use case | 2min | For institutional outreach |

---

## Content Calendar Summary

| Day | Twitter | Long-Form |
|-----|---------|-----------|
| L-14 | Teaser post | Article 1: Variable Rate Problem |
| L-12 | - | Article 2: Why Institutions Need This |
| L-10 | Teaser post | - |
| L-3 | Video teaser | - |
| L-0 | Main announcement + Marius post | Article 3: How Fixed Rates Work |
| L+1 | FalconX quote | - |
| L+2 | How-to hook | - |
| L+3 | - | Article 4: RWA Issuers |
| L+7 | - | Article 5: Technical Deep Dive |
| Weekly | Stats posts | - |

---

*Content Strategy v3.0 - Long-form focus*
