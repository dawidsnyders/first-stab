# Kamino Prime — Vault Documentation Outline

> **Purpose**: Map the complete documentation structure for curator-facing lending vault documentation. This outline captures every feature, flow, setting, and parameter extracted from the two product meetings. Content will be populated in a subsequent pass.

> **Audience**: Risk curators who create and manage lending vaults on Kamino.

> **Standard**: Stripe-quality documentation — clear, exhaustive, well-structured, example-driven.

---

## Table of Contents

1. [Introduction & Overview](#1-introduction--overview)
2. [Creating a Vault](#2-creating-a-vault)
3. [Managing a Vault](#3-managing-a-vault)
   - 3.1 Vault Settings Tab
   - 3.2 Allocation Settings Tab
   - 3.3 Vault Stats Tab
4. [Cross-cutting Concepts](#4-cross-cutting-concepts)

---

## 1. Introduction & Overview

### 1.1 What is Kamino Prime?
- Platform for risk curators to create and manage lending vaults
- Vaults accept a single deposit token and allocate across reserves inside lending markets
- Curators control allocation strategy, fees, and vault parameters

### 1.2 Key Concepts
- **Vault**: A smart contract that pools depositor funds and allocates them across lending reserves
- **Deposit Token**: The single token the vault accepts (e.g., USDC)
- **Receipt Token (kToken)**: Token depositors receive representing their share of the vault
- **Reserve**: A specific lending pool inside a market (e.g., USDC floating rate in Market X)
- **Market**: A lending market containing one or more reserves — allocations target reserves, NOT markets directly
- **Weight**: A relative number controlling what proportion of the vault is allocated to each reserve
- **Curator/Admin**: The wallet (hot wallet or multisig) that controls vault settings and allocations

### 1.3 Architecture at a Glance
- One vault → one deposit token → many reserve allocations across many markets
- A single market can have multiple reserves of the same token (e.g., USDC floating rate + USDC fixed rate 5% for 3 months)
- Vault management UI is organized into three tabs: Vault Settings, Allocation Settings, Vault Stats

### 1.4 Wallet & Signing Modes
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

### 2.5 First Loss Capital Vault
- Specialized vault type (parameters and flow TBD — deferred for future documentation)
- Placeholder section for when this is finalized

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
- **No further admin actions** available on the farm once created — read-only display of the farm address

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

##### Standard Allocation
- Default allocation type for variable/floating rate reserves

##### Conditional Allocation
- Available for **fixed rate reserves only**
- Conditional parameters can be set on the allocation
- Not yet available for variable rate reserves
- Document what conditions can be set and how they affect allocation behavior

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
- **Floating Rate Reserves**: Variable interest rate, standard allocation
- **Fixed Rate Reserves**: Fixed interest rate for a set duration, supports conditional allocations
- How reserve type affects allocation options and vault behavior

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
| Reserve Weights | Allocation Settings | Weight Management |
| Unallocated Weight | Allocation Settings | Liquidity Buffer |
| Unallocated Cap | Allocation Settings | Liquidity Buffer |
| Allocation Whitelist | Allocation Settings | Whitelisting |
| Invest Whitelist | Allocation Settings | Whitelisting |
| Reserve Verification | Allocation Settings | Add Reserve |

### C. Open Items / Deferred
- First Loss Capital vault parameters and flow
- Conditional allocation details for fixed rate reserves
- Advanced settings complete parameter list and defaults
- Vault Stats tab — full metrics definition
- Managed farms integration (separate from vault farm)

---

*Document generated from analysis of product meeting transcripts #1 and #2.*
*This is the documentation STRUCTURE — content will be populated in a subsequent pass.*
