# Kamino Prime — Vault Documentation Outline

> **Purpose**: Map the complete documentation structure for curator-facing lending vault documentation. This outline captures every feature, flow, setting, and parameter extracted from the two product meetings. Content will be populated in a subsequent pass.

> **Audience**: Risk curators who create and manage lending vaults on Kamino.

> **Standard**: Stripe-quality documentation — clear, exhaustive, well-structured, example-driven.

---

## Table of Contents

1. [Introduction & Overview](#1-introduction--overview)
   - 1.1 What is Kamino Prime?
   - 1.2 What Are Vaults?
   - 1.3 Why Vaults Exist
   - 1.4 Vault Structure
   - 1.5 Key Concepts
   - 1.6 Architecture at a Glance
   - 1.7 Allocation Management
   - 1.8 Wallet & Signing Modes
2. [Creating a Vault](#2-creating-a-vault)
   - 2.1 Create Vault Flow
   - 2.2 Required Parameters
   - 2.3 Fee Configuration
   - 2.4 Advanced Settings
   - 2.5 First Loss Capital
3. [Managing a Vault](#3-managing-a-vault)
   - 3.1 Vault Settings Tab (Info, Admin, Fees, Farm)
   - 3.2 Allocation Settings Tab
     - Allocation Overview & Reserve List
     - Liquidity Buffer (Unallocated Weight & Cap)
     - Weight Management & APY Simulation
     - Add/Remove Reserves
     - **Allocation Types: Standard & Conditional Liquidity**
     - Sync Allocations
     - Whitelisting
   - 3.3 Vault Stats Tab
4. [Cross-cutting Concepts](#4-cross-cutting-concepts)
   - 4.1 Transaction Flow
   - 4.2 Multisig (Squads) Integration
   - 4.3 Hot Wallet vs Multisig Admin
   - 4.4 Reserve Types (Variable vs Fixed)
   - 4.5 Vault Lifecycle

---

## 1. Introduction & Overview

### 1.1 What is Kamino Prime?
Kamino Prime is the platform for risk curators to create and manage lending vaults on Kamino. Curators use Kamino Prime to build professionally managed lending products — accepting deposits, allocating capital across reserves and markets, and actively optimizing yield and risk.

### 1.2 What Are Vaults?

Vaults are an established abstraction layer on Kamino that aggregate lender capital and manage allocation across reserves. They are heavily used and critical infrastructure.

A vault is a single-token pool (e.g., a USDC vault) that:
- Accepts deposits from lenders
- Issues vault shares (receipt tokens) representing proportional ownership
- Manages allocation across multiple reserves and markets
- Handles rebalancing based on vault manager decisions

### 1.3 Why Vaults Exist

Without vaults, lenders would need to:
- Manually select which reserves to deposit into across multiple markets
- Monitor yields across dozens of reserves
- Move capital between reserves as conditions change
- Handle the complexity of managing multiple positions

Vaults professionalize this. Lenders deposit once. Vault managers (risk curators) handle all allocation decisions. Active management replaces passive, fragmented lending.

### 1.4 Vault Structure

**Example: USDC Prime Vault**

Lenders deposit USDC. The vault manager allocates:
- 60% to Main Market USDC variable reserve
- 30% to JLP Market USDC variable reserve
- 10% to Altcoin Market USDC variable reserve

Allocations are committed — capital physically moves into these reserves and earns whatever those reserves currently yield.

### 1.5 Key Concepts

| Concept | Definition |
|---------|------------|
| **Vault** | A single-token pool that aggregates lender capital and allocates across lending reserves |
| **Deposit Token** | The single token a vault accepts (e.g., USDC). Set at creation, immutable. |
| **Receipt Token (kToken)** | Token depositors receive representing their proportional share of the vault |
| **Reserve** | A specific lending pool inside a market (e.g., USDC floating rate in Market X) |
| **Market** | A lending market containing one or more reserves — allocations target reserves, NOT markets directly |
| **Variable Rate Reserve** | A reserve where the interest rate floats based on supply/demand (utilisation) |
| **Fixed Rate Reserve** | A reserve offering a fixed interest rate for a set duration (e.g., 5% for 3 months) |
| **Weight** | A relative number controlling what proportion of the vault is allocated to each reserve |
| **Curator / Admin** | The wallet (hot wallet or multisig) that controls vault settings and allocations |
| **Conditional Liquidity** | Capital signaled as available to fixed-rate reserves while remaining deployed in variable-rate reserves (see §3.2.7) |

### 1.6 Architecture at a Glance
- One vault → one deposit token → many reserve allocations across many markets
- A single market can have multiple reserves of the same token (e.g., USDC floating rate + USDC fixed rate 5% for 3 months)
- Allocations target specific **reserves**, not markets
- Vault management UI is organized into three tabs: Vault Settings, Allocation Settings, Vault Stats

### 1.7 Allocation Management

Vault managers actively adjust allocations based on:
- Relative yields across markets and reserves
- Risk assessment of different collateral types in each market
- Utilisation levels in different reserves
- Overall market conditions
- Fixed rate opportunities via Conditional Liquidity (see §3.2.7)

### 1.8 Wallet & Signing Modes
- **Hot wallet**: Direct transaction signing from a connected wallet
- **Multisig (Squads)**: Transaction simulation produces a base58 encoded transaction for execution in Squads
- All vault management actions support both modes

---

## 2. Creating a Vault

### 2.1 Create Vault Flow — Overview
- Step-by-step walkthrough of the vault creation process
- What happens on-chain when you create a vault
- Post-creation redirect behavior (→ vault page → allocation settings tab)

### 2.2 Required Parameters

#### 2.2.1 Deposit Token (Vault Token)
- Select the token the vault will accept for deposits
- This determines which reserves are available for allocation
- Cannot be changed after creation

#### 2.2.2 Vault Name
- Human-readable name for the vault
- Editable after creation (see §3.1.1)

#### 2.2.3 Receipt Token Ticker
- Format: `KV-[deposit token symbol]-[custom suffix]`
- Prefix `KV-[deposit token symbol]-` is hardcoded and auto-generated
- Only the suffix is curator-editable
- ~8 character limit on the full ticker
- Example: `KV-USDC-ALPHA`

#### 2.2.4 Receipt Token Name
- Full human-readable name for the receipt token
- Editable after creation (see §3.1.1)

#### 2.2.5 Minimum Deposit Amount
- Minimum amount of the deposit token required per deposit
- Set at creation time

### 2.3 Fee Configuration at Creation

#### 2.3.1 Performance Fee
- Percentage fee on vault profits
- Default: 0%
- Editable after creation (see §3.1.3)

#### 2.3.2 AUM Fee (Assets Under Management)
- Percentage fee on total assets under management
- Default: 0%
- Editable after creation (see §3.1.3)

### 2.4 Advanced Settings
- Section with additional parameters that have reasonable defaults
- Collapsed/hidden by default — curators can expand to customize
- Parameters TBD — document each advanced setting with its default value and implications

### 2.5 First Loss Capital

#### 2.5.1 What is First Loss Capital?
First Loss Capital is a trust mechanism that allows vault managers to put their own capital at risk before depositors bear any losses. The manager deposits assets into a dedicated farm buffer — if the vault incurs bad debt (e.g., from a borrower default or liquidation shortfall in an underlying reserve), the shortfall is first absorbed by the First Loss Capital buffer. Depositors only begin incurring losses if and when the shortfall exceeds the entire First Loss Capital buffer.

This is one of the highest-trust features a vault manager can offer, signaling direct skin-in-the-game alignment with depositors.

#### 2.5.2 TradFi Equivalents
First Loss Capital maps directly to well-established mechanisms in traditional finance:

- **Equity/First Loss Tranche (Structured Finance)**: In CLOs and CDOs, the equity tranche (also called the "first loss piece") absorbs losses before any senior tranche is impacted. The vault manager's First Loss Capital functions identically — they hold the junior position.
- **GP Commitment (Private Equity / Hedge Funds)**: General Partners typically commit 1–5% of fund capital alongside LPs. This co-investment ensures the GP's incentives are aligned with investors. First Loss Capital serves the same alignment purpose.
- **Risk Retention Rules (Dodd-Frank §941)**: Post-2008 regulations require securitization sponsors to retain at least 5% of credit risk, often in a first-loss position. This regulatory principle — that originators should have skin in the game — is the same principle First Loss Capital implements on-chain.
- **Subordinated Debt**: In banking, subordinated debt holders absorb losses before senior creditors. The First Loss Capital buffer is subordinated to all depositor claims.

#### 2.5.3 How It Works — Overview
1. **Farm Setup**: The vault must have a farm created (see §3.1.4)
2. **Configure Parameters**: Set the First Loss Capital parameters (token, lockup period)
3. **Deposit**: Manager deposits the chosen asset into the First Loss Capital farm
4. **Protection Active**: The buffer is now live — any bad debt the vault incurs is absorbed by this buffer first
5. **Loss Waterfall**: Shortfall → First Loss Capital buffer absorbs → only if buffer is fully depleted do depositors incur loss

#### 2.5.4 Parameters

| Parameter | Description |
|-----------|-------------|
| **Token** | The asset deposited as First Loss Capital. Selected by the vault manager. |
| **Lockup Period** | Duration for which the First Loss Capital is locked and cannot be withdrawn. Provides depositors with certainty that the buffer will remain in place for at least this period. |

#### 2.5.5 Trust Signal & Depositor Impact
- Vaults with First Loss Capital provide a stronger safety guarantee to depositors
- The lockup period is critical — a longer lockup gives depositors more confidence that the buffer won't be pulled at the first sign of trouble
- Documentation should clearly communicate to curators how this feature is surfaced to depositors (badge, indicator, or detail on the vault page)
- Curators should understand the trade-off: locking capital reduces their liquidity but increases vault attractiveness and depositor trust

---

## 3. Managing a Vault

> The vault management interface is organized into three tabs. This section documents every setting, action, and flow available within each tab.

---

### 3.1 Vault Settings Tab

#### 3.1.1 Vault Info
Settings in this section are editable post-creation.

| Field | Description | Editable | Notes |
|-------|-------------|----------|-------|
| **Vault Name** | Human-readable vault name | Yes | - |
| **Receipt Token Name** | Full name of the receipt token | Yes | - |
| **Description** | Vault description text | Yes | - |
| **Receipt Token Ticker** | Display of the receipt token ticker | Display only | Set at creation, format: `KV-[symbol]-[suffix]` |
| **Deposit Token** | The token the vault accepts | Display only | Set at creation, immutable |

- How to edit vault info fields
- Transaction flow for saving changes (simulate → sign/execute)

#### 3.1.2 Admin Management

##### Current Admin Display
- Shows the current admin wallet address
- Indicates whether admin is a hot wallet or multisig

##### Transfer Admin
Two-step process to transfer vault admin ownership:

**Step 1 — Initiate Transfer:**
- Current admin initiates transfer to a new wallet address
- Vault enters "pending transfer" state
- Pending admin address is displayed

**Step 2 — Claim Admin:**
- New admin must claim ownership from the pending state
- Claim button appears when the pending admin's wallet is connected
- Once claimed, the transfer is complete and the new admin has full control

**Cancel Transfer:**
- Current admin can cancel a pending transfer before it is claimed
- Vault reverts to original admin

**Multisig Considerations:**
- Transfer initiation produces a base58 transaction for Squads execution
- Claiming from a multisig also requires Squads execution
- Typical use case: transfer from hot wallet → multisig for security

#### 3.1.3 Fee Management

##### Manager Fees
Fees that go to the vault manager/curator:

| Fee Type | Description | Default | Editable |
|----------|-------------|---------|----------|
| **Performance Fee** | % fee on vault profits | 0% | Yes |
| **AUM Fee** | % fee on assets under management | 0% | Yes |

- How to edit fees (same simulate → sign flow)
- Fee implications and how they accrue

##### Withdrawal Penalty
- **Separate from manager fees** — penalties go back into the vault, not to the manager
- Configurable penalty percentage
- Purpose: discourage short-term withdrawals / protect remaining depositors

##### Fee Collection
- Accrued fees displayed in the vault's deposit token
- UI displays pending/collectable fee amount
- "Collect Fees" action to claim accrued fees
- Fees are paid out in the deposit token

#### 3.1.4 Vault Farm

##### Farm Status Display
- Shows whether a farm is set up for the vault
- If set up: displays the farm address (public key)
- If not set up: displays "Create Farm" button

##### Create Farm Flow
- Only one farm per vault
- Click "Create Farm" → transaction is generated
- Same flow as other settings changes (simulate → sign for multisig)
- Transaction creates the farm, sets it to the vault, and transfers farm authority
- After creation: farm address is displayed, "Create Farm" button disappears
- Farm address is displayed as read-only after creation

##### First Loss Capital Configuration
Once the farm is created, the vault manager can configure and fund a First Loss Capital buffer through the farm.

**Setup Flow:**
1. Select the **token** to deposit as First Loss Capital
2. Set the **lockup period** — duration the capital is locked and cannot be withdrawn
3. Deposit the asset into the First Loss Capital farm
4. Same transaction flow as other vault settings (simulate → sign/execute)

**Parameters:**

| Parameter | Description |
|-----------|-------------|
| **Token** | The asset to deposit as the first loss buffer |
| **Lockup Period** | How long the capital is locked — cannot be withdrawn during this period |

**Post-Setup Display:**
- First Loss Capital status and amount visible on the vault settings page
- Lockup period and remaining lockup time displayed
- Deposited token and amount shown

**Loss Absorption Mechanism:**
- If the vault incurs bad debt (e.g., borrower default, liquidation shortfall in an underlying reserve), the First Loss Capital buffer absorbs the loss first
- Depositors only incur loss if the shortfall exceeds the entire First Loss Capital buffer
- See §2.5 for full conceptual explanation and TradFi parallels

---

### 3.2 Allocation Settings Tab

#### 3.2.1 Allocation Overview
- Visual overview of how the vault's funds are distributed
- Shows all allocated reserves with their weights, percentages, and APYs
- Overall vault APY display

#### 3.2.2 Reserve Allocations List

Each allocation entry displays:

| Field | Description |
|-------|-------------|
| **Reserve / Market** | Which reserve in which market this allocation targets |
| **Weight** | Raw weight number (relative, not absolute) |
| **Percentage** | Derived from weight — always shown in brackets next to weight, e.g., `50 (33.3%)` |
| **Allocation Target** | The target allocation set by the manager |
| **Actual Allocation** | The current on-chain allocation (can drift from target) |
| **APY** | Current annual percentage yield for this reserve |
| **Allocation Type** | Type of allocation (e.g., standard, conditional) |

##### Important: Weight vs Percentage
- Weights are relative numbers — they only have meaning relative to each other
- Percentages are derived: `reserve weight / total weight across all allocations (including unallocated) × 100`
- Documentation must always show weight WITH its corresponding percentage in brackets
- Example: if Reserve A has weight 50 and Reserve B has weight 100, with unallocated weight 50, then: A = 50 (25%), B = 100 (50%), Unallocated = 50 (25%)

#### 3.2.3 Unallocated Weight & Cap (Liquidity Buffer)

The liquidity buffer mechanism ensures the vault maintains available liquidity for withdrawals.

| Parameter | Description |
|-----------|-------------|
| **Unallocated Weight** | Relative weight for the unallocated (idle) portion of the vault. Works just like reserve weights — sets a target percentage of the vault to keep as liquid buffer. |
| **Unallocated Cap** | Maximum token amount that can remain unallocated. Even if the unallocated weight would imply a larger amount, the cap limits the absolute amount of idle tokens. |

- How weight and cap interact
- Examples showing the interplay between weight-based percentage and absolute cap
- Impact on depositor experience (withdrawal availability)

#### 3.2.4 Weight Management

##### Edit Individual Weights
- Click on a reserve's weight to edit it
- Real-time APY impact simulation as you change the weight
- Shows how the change affects overall vault APY and per-reserve allocation percentages

##### Batch Weight Editing
- Modal/overlay to adjust multiple reserve weights simultaneously
- Useful for rebalancing across many reserves at once
- Real-time APY simulation for the entire batch of changes
- All changes submitted as a single transaction

##### APY Simulation
- When editing weights (individual or batch), the UI simulates the impact on:
  - Per-reserve APY
  - Overall vault APY
  - Allocation percentages
- Simulation runs in real-time as weights are adjusted

#### 3.2.5 Add Reserve (New Allocation)

##### Flow
- High-priority feature for the allocation settings page
- Add a new reserve to the vault's allocation list
- Select from available reserves across lending markets
- Set initial weight for the new reserve

##### Reserve Selection
- Reserves are inside markets (not at the market level)
- A single market can contain multiple reserves of the same token
  - Example: USDC floating rate reserve + USDC fixed rate reserve (5% for 3 months) in the same market
- Curators allocate to specific reserves, not to markets

##### Reserve Verification & Whitelisting
- **Verified vs Unverified Reserves**: reserves can be individually verified (not markets)
- Setting to control whether allocations are restricted to verified reserves only

#### 3.2.6 Remove Reserve
- Remove a reserve from the vault's allocation list
- Its weight is redistributed or removed from the total

#### 3.2.7 Allocation Types

##### Standard Allocation (Variable Rate Reserves)
- Default allocation type for variable/floating rate reserves
- Capital is physically deployed into the reserve and earns the current variable rate
- Allocation is committed — capital moves on-chain into the reserve
- Yield fluctuates based on reserve utilisation and market conditions

##### Conditional Allocation (Fixed Rate Reserves) — Conditional Liquidity

Conditional Liquidity is a core mechanism that allows vaults to participate in fixed-rate lending without sacrificing yield on idle capital. This section is critical for vault managers to understand thoroughly.

###### The Problem Without Conditional Liquidity

If vaults allocated capital directly to fixed-rate reserves, they would face two problems:

1. **Opportunity cost**: Capital sitting in a fixed-rate reserve with no borrowers earns nothing. A vault allocating 20% to a 5.5% 3-month reserve would have that capital completely idle until someone borrows against it.

2. **Liquidity fragmentation**: Capital split across many fixed-rate reserves (different rates, different durations, different markets) means small amounts in each, making it difficult for large borrowers to find sufficient liquidity at any single rate-duration pair.

###### How Conditional Liquidity Works

Vaults specify a percentage of their total capital as *conditionally available* to specific fixed-rate reserves. This capital **remains physically deployed in variable-rate reserves**, earning whatever those reserves currently yield.

When a Borrow Order matches the conditional terms, the system **atomically**:
1. Withdraws the required amount from variable-rate reserves
2. Deposits it into the matched fixed-rate reserve
3. Executes the loan to the borrower

The vault's actual allocation only changes at the moment of match. Until then, the capital is productive in variable reserves.

###### Multi-Reserve Placement

A vault can place Conditional Liquidity on multiple fixed-rate reserves simultaneously **using the same underlying capital**. The capital is not reserved or partitioned — it remains fully deployed in variable reserves.

**Example**: A vault with $100M deployed in variable reserves could signal:
- $50M conditionally available at 5.0% for 3 months
- $50M conditionally available at 5.5% for 3 months
- $30M conditionally available at 6.0% for 6 months

These overlap intentionally. Whichever Borrow Order arrives first and matches any of these conditions triggers the atomic transfer. Once $50M moves to fill a 5.0% 3-month order, the remaining $50M in variable reserves can still fill other conditional placements up to that remaining amount.

###### Why Vaults Make Fixed Rates Viable

- **Maturity mismatch management**: Fixed-rate loans lock capital for 3–6 months. Individual lenders typically want instant liquidity. A vault abstracts this away — only a portion of total vault capital is allocated to fixed rates, while the rest remains in variable reserves providing a liquidity buffer for depositors who want to exit. Pooling liquidity enables better maturity management.
- **Complexity abstraction**: Allocating across fixed-rate terms (different rates, durations, markets) is a complex decision requiring active monitoring. Most lenders are not equipped for this. Vault managers absorb this complexity on behalf of depositors.

###### Why Fixed Rates Enable Higher Vault Yields

Fixed-rate reserves tend toward **100% utilisation** because Conditional Liquidity only commits capital when a borrower actually matches. Unlike variable reserves where idle liquidity dilutes returns, fixed-rate reserves have capital deployed only when borrowed. A 6% fixed-rate reserve at 100% utilisation pays lenders the full 6% — not the diluted rate that variable reserves with idle liquidity would produce.

Additionally, longer lock-up periods command higher rates. The term structure creates yield premium opportunities that vault managers can capture through strategic allocation.

###### Fill Priority

When multiple vaults have Conditional Liquidity on the same reserve and a Borrow Order arrives, there is **no priority ordering**. The first vault whose `invest_to_fill_borrow_order()` instruction executes successfully fills the order. This is determined by transaction ordering on-chain, not by any queue or preference system.

###### Modifying Conditional Liquidity

Conditional Liquidity is **not a discrete order** that gets placed and cancelled. It is a configuration parameter on the vault — specifically, the allocation percentage set for each conditional (fixed-rate) reserve. Vault managers adjust Conditional Liquidity by changing these allocation percentages. Setting a conditional allocation to 0% removes the signal entirely.

###### Worked Example: Conditional Liquidity in Action

**Step 1 — Initial State:**
| Allocation | Type | Amount |
|-----------|------|--------|
| Main Market USDC (Variable) | Standard | $80M |
| JLP Market USDC (Variable) | Standard | $20M |
| Main Market USDC 5%, 3 months (Fixed) | Conditional | $10M signaled |

Capital status: $100M physically deployed in variable reserves. $10M conditionally available for fixed rate.

**Step 2 — Borrow Order Matched (atomic):**
A borrower places a Borrow Order for $10M at 5%, 3 months. The system atomically withdraws $10M from a variable reserve and deposits it into the fixed-rate reserve.

| Allocation | Type | Amount |
|-----------|------|--------|
| Main Market USDC (Variable) | Standard | $70M |
| JLP Market USDC (Variable) | Standard | $20M |
| Main Market USDC 5%, 3 months (Fixed) | Committed | $10M |

**Step 3 — Rebalancing (to restore target proportions):**
The vault manager (or sync) rebalances the remaining variable allocations to maintain the intended 80/20 split.

| Allocation | Type | Amount |
|-----------|------|--------|
| Main Market USDC (Variable) | Standard | $72M |
| JLP Market USDC (Variable) | Standard | $18M |
| Main Market USDC 5%, 3 months (Fixed) | Committed | $10M |

#### 3.2.8 Sync Allocations

- **What it does**: Brings actual on-chain allocations in line with the target allocations set by the manager
- **Who can trigger it**: Anyone — this is a **permissionless** action, not restricted to the vault admin
- **When to use it**: When actual allocations have drifted from target (due to deposits, withdrawals, interest accrual, etc.)
- **How it works**: Single button/action that rebalances the vault to match target weights
- Available at any time

#### 3.2.9 Whitelisting Settings

| Setting | Description | Scope |
|---------|-------------|-------|
| **Allow allocation only in whitelisted reserves** | Restricts which reserves the manager can allocate to | Allocation page setting |
| **Allow invest only in whitelisted reserves** | Restricts which reserves depositors' funds can flow into | Allocation page setting |

- These are separate, independent settings
- How to manage the whitelist (add/remove reserves)
- Implications for vault security and risk management

---

### 3.3 Vault Stats Tab

#### 3.3.1 Vault Performance Metrics
- Historical vault performance data
- APY tracking over time
- (Specific metrics TBD — less discussed in product meetings, to be expanded)

#### 3.3.2 Deposit/Withdrawal Activity
- (To be expanded based on further product definition)

---

## 4. Cross-cutting Concepts

### 4.1 Transaction Flow (All Settings Changes)

Every vault management action follows a consistent pattern:

1. **Edit** — Curator modifies a setting in the UI
2. **Simulate** — Transaction is simulated to verify it will succeed
3. **Sign / Execute**:
   - **Hot wallet**: Sign directly from the connected wallet
   - **Multisig (Squads)**: Copy base58-encoded transaction → execute in Squads UI

- Simulation is available for all settings changes
- Error handling and what to do if simulation fails

### 4.2 Multisig (Squads) Integration
- How vault management works with a multisig admin
- Base58 transaction encoding for Squads
- Step-by-step: simulate in Kamino UI → copy transaction → execute in Squads
- Which actions require admin signature vs which are permissionless

### 4.3 Hot Wallet vs Multisig Admin
- Differences in UX between hot wallet and multisig administration
- Recommended setup: create with hot wallet → transfer admin to multisig
- Security considerations

### 4.4 Reserve Types

#### Variable Rate Reserves
- Interest rate floats dynamically based on supply and demand (utilisation curve)
- Vaults allocate to these via **Standard Allocation** — capital is physically deployed
- Capital can be withdrawn at any time (subject to utilisation — if reserve is fully borrowed, withdrawals queue)
- Yield fluctuates continuously
- This is where most vault capital lives day-to-day

#### Fixed Rate Reserves
- Offer a fixed interest rate for a defined duration (e.g., 5% for 3 months, 6% for 6 months)
- Vaults allocate to these via **Conditional Liquidity** (see §3.2.7) — capital is signaled but not committed until a Borrow Order matches
- Once matched, capital is locked for the duration of the fixed-rate term
- Tend toward 100% utilisation (capital only enters when borrowed), producing higher effective yields than variable reserves with idle liquidity
- Longer durations command higher rates (term premium)
- A single market can contain both variable and fixed rate reserves for the same token

#### How Reserve Type Affects Vault Management
| Aspect | Variable Rate | Fixed Rate |
|--------|--------------|------------|
| Allocation type | Standard (committed) | Conditional (signaled until matched) |
| Capital deployment | Immediate, physical | Atomic at match time |
| Yield behavior | Floating, continuous | Fixed for loan duration |
| Liquidity | Withdrawable (subject to utilisation) | Locked for term duration |
| Utilisation | Varies (idle capital dilutes yield) | Tends to 100% (capital only when borrowed) |
| Manager action | Set weight, rebalance | Set conditional %, adjust as orders fill |

### 4.5 Vault Lifecycle
- Creation → initial allocation setup → ongoing management → (future: deprecation/closure)
- Post-creation checklist for curators

---

## Appendix

### A. Glossary
| Term | Definition |
|------|-----------|
| Vault | Smart contract pooling depositor funds across lending reserves |
| Deposit Token | The single token a vault accepts (e.g., USDC) |
| Receipt Token (kToken) | Token representing a depositor's share of the vault |
| Reserve | A specific lending pool inside a market |
| Market | A lending market containing one or more reserves |
| Weight | Relative number controlling allocation proportion |
| Curator/Admin | Wallet controlling vault settings and allocations |
| Unallocated Weight | Weight reserved for the vault's liquidity buffer |
| Unallocated Cap | Maximum idle token amount in the vault |
| Sync Allocations | Permissionless action to rebalance actual allocations to match targets |
| Performance Fee | Fee on vault profits, paid to the manager |
| AUM Fee | Fee on total assets under management, paid to the manager |
| Withdrawal Penalty | Fee on withdrawals, returned to the vault (not the manager) |
| Farm | Rewards distribution mechanism attached to a vault |
| First Loss Capital | Manager-deposited buffer that absorbs bad debt before depositors incur any loss |
| Lockup Period | Duration for which First Loss Capital is locked and cannot be withdrawn |
| Bad Debt | Shortfall from borrower defaults or liquidation failures in underlying reserves |
| Conditional Liquidity | Capital signaled as available to fixed-rate reserves while remaining deployed in variable-rate reserves; commits atomically when a Borrow Order matches |
| Borrow Order | A borrower's request to borrow at a specific fixed rate and duration; triggers Conditional Liquidity when matched |
| Variable Rate Reserve | A reserve where the interest rate floats based on utilisation |
| Fixed Rate Reserve | A reserve offering a fixed interest rate for a set duration |
| Term Premium | Higher rates commanded by longer lock-up durations in fixed-rate reserves |
| Utilisation | The percentage of a reserve's deposited capital that is currently borrowed |
| Squads | Multisig solution for Solana; used for multisig vault administration |

### B. Settings Quick Reference

#### Creation-time Settings (Immutable)
| Setting | Notes |
|---------|-------|
| Deposit Token | Cannot be changed after vault creation |

#### Creation-time Settings (Editable Post-creation)
| Setting | Default | Where to Edit |
|---------|---------|---------------|
| Vault Name | Set at creation | Vault Settings → Vault Info |
| Receipt Token Name | Set at creation | Vault Settings → Vault Info |
| Performance Fee | 0% | Vault Settings → Fee Management |
| AUM Fee | 0% | Vault Settings → Fee Management |

#### Management-only Settings
| Setting | Tab | Section |
|---------|-----|---------|
| Description | Vault Settings | Vault Info |
| Admin Transfer | Vault Settings | Admin Management |
| Withdrawal Penalty | Vault Settings | Fee Management |
| Vault Farm | Vault Settings | Farm |
| First Loss Capital Token | Vault Settings | Farm → First Loss Capital |
| First Loss Capital Lockup Period | Vault Settings | Farm → First Loss Capital |
| Reserve Weights | Allocation Settings | Weight Management |
| Unallocated Weight | Allocation Settings | Liquidity Buffer |
| Unallocated Cap | Allocation Settings | Liquidity Buffer |
| Allocation Whitelist | Allocation Settings | Whitelisting |
| Invest Whitelist | Allocation Settings | Whitelisting |
| Conditional Liquidity % | Allocation Settings | Allocation Types → Conditional |
| Reserve Verification | Allocation Settings | Add Reserve |

### C. Open Items / Deferred
- Advanced settings complete parameter list and defaults
- Vault Stats tab — full metrics definition
- Managed farms integration (separate from vault farm)

---

*Document generated from analysis of product meeting transcripts #1 and #2.*
*This is the documentation STRUCTURE — content will be populated in a subsequent pass.*
