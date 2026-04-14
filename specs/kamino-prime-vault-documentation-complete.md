# Kamino Prime — Vault Documentation

## 1. Creating a Vault

### 1.1 Creation Flow

1. Configure required parameters (name, token, receipt token)
2. Set fee structure (optional, defaults to 0%)
3. Configure advanced settings (optional)
4. Submit transaction
5. Configure allocations (required before vault is functional)

### 1.2 Required Parameters

| Parameter | Type | Editable | Description |
|-----------|------|----------|-------------|
| **Vault Name** | String | Yes | Human-readable vault identifier |
| **Token (Deposit Token)** | Token | No (immutable) | Token the vault accepts for deposits; determines available reserves for allocation |
| **Vault Description** | Text | Yes | Optional description of vault strategy |
| **Receipt Token Name** | String | Yes | Full name for receipt token issued to depositors |
| **Receipt Token Ticker** | String | Suffix only | Format: `kv[DEPOSIT_SYMBOL]-[CUSTOM_SUFFIX]`; 8 character maximum; example: `kvUSDC-ALPHA` |

### 1.3 Fee Configuration

Configure at creation time; all fees editable post-creation.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **Performance Fee (PerformanceFeeBps)** | Basis points (BPS) | 0 | Fee on vault profits, paid to vault admin |
| **AUM Fee (ManagementFeeBps)** | Basis points (BPS) | 0 | Annual fee on total assets under management, paid to vault admin |

Both fees accrue in the deposit token and are collected manually via the Vault Settings interface.

### 1.4 Advanced Settings

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| **Minimum Deposit Amount (MinDepositAmount)** | Token amount (lamports) | 10 lamports | Minimum deposit size; prevents dust deposits and exploit vectors |
| **Minimum Withdraw Amount (MinWithdrawAmount)** | Token amount (lamports) | 10 lamports | Minimum withdrawal size; prevents dust withdrawals |
| **Minimum Invest Amount (MinInvestAmount)** | Token amount | 0 | Minimum size for investment instructions; prevents dust operations |
| **Minimum Invest Delay (MinInvestDelaySlots)** | Slots | 0 | Delay in slots before investment executes; security parameter |
| **Withdrawal Penalty (Basis Points) (WithdrawalPenaltyBps)** | Basis points | 1-2 BPS (suggested) | Percentage-based withdrawal fee; prevents exploit where users deposit before autocompound, withdraw, and repeat |
| **Withdrawal Penalty (Lamports) (WithdrawalPenaltyLamports)** | Lamports | Non-zero (suggested) | Absolute withdrawal fee; system takes MAX of BPS and lamports; security mechanism, not manager revenue |

### 1.5 Post-Creation Setup

After vault creation:

1. **Configure Allocations**: Add reserves in Allocation Settings
2. **Create Farm**: Create and attach vault farm if distributing rewards (see §4.1)
3. **Transfer Admin to Multisig**: Transfer vault admin to multisig for security (see §2.2)

---

## 2. Vault Settings

### 2.1 Vault Info

| Field | Editable | Description |
|-------|----------|-------------|
| **Name** | Yes | Vault display name |
| **Description** | Yes | Text description of vault strategy |
| **Receipt Token Name** | Yes | Full name of receipt token |
| **Receipt Token Ticker** | No | Ticker set at creation; format: `kv[symbol]-[suffix]` |
| **Deposit Token** | No | Vault's deposit token (immutable) |

### 2.2 Admin Management

#### 2.2.1 Admin Display

Each admin type shows wallet address and transfer status (active or pending).

#### 2.2.2 Vault Admin

Full control over vault settings, allocations, fees, and parameters.

**Transfer Process** (two-step):

1. **Initiate**: Current admin submits transfer to new admin address. Vault enters pending state (`PendingVaultAdmin` set).
2. **Claim**: New admin submits claim transaction to complete transfer.
3. **Cancel**: Current admin can cancel pending transfer before claim.

**Multisig**: Both initiate and claim transactions can be executed via Squads for multisig admins.

#### 2.2.3 Allocation Admin

Limited admin role that can only update allocation weights for existing reserves. Cannot add/remove reserves or change vault settings.

**Parameter**: `AllocationAdmin` (wallet address)

**Transfer**: Same two-step process as Vault Admin (initiate → claim).

#### 2.2.4 Farm Admin

Controls the vault's rewards distribution farm. After farm creation, authority is transferred to the protocol (see §4.1).

**Parameter**: `Farm` (farm public key)

**Transfer Flow**: Farm authority handled by protocol; not directly manageable by curator.

### 2.3 Fee Management

#### 2.3.1 Manager Fees

Fees paid to vault admin.

| Fee Type | Parameter | Type | Description |
|----------|-----------|------|-------------|
| **AUM Fee** | `ManagementFeeBps` | Basis points | Annual fee on assets under management |
| **Performance Fee** | `PerformanceFeeBps` | Basis points | Fee on vault profits |

Fees accrue continuously in the deposit token and are collected manually by vault admin.

#### 2.3.2 Withdrawal Penalties

| Parameter | Type | Editable | Description |
|-----------|------|----------|-------------|
| **WithdrawalPenaltyBps** | Basis points | Yes | Percentage-based withdrawal fee |
| **WithdrawalPenaltyLamports** | Lamports | Yes | Absolute withdrawal fee |

**Fee Calculation**: System takes **MAX** of BPS-based fee and lamports-based fee.

**Purpose**: Security mechanism to prevent exploit where users deposit immediately before autocompound, claim rewards, withdraw, and repeat. Penalties are returned to the vault, not paid to vault admin.

### 2.4 Lookup Table

**Parameter**: `LookupTable` (address lookup table)

**Description**: Address lookup table for transaction optimization. Managed by the protocol; not recommended for curator modification.

---

## 3. Allocation Management

### 3.1 Allocation Overview

Vault allocation distribution showing:
- Total allocation weight
- Vault APY (weighted average across reserves)
- Per-reserve: market, reserve, weight, percentage, APY, actual vs target allocation

### 3.2 Weight System

Allocations use **relative integer weights**, not absolute percentages.

**Calculation**:
```
Reserve Allocation % = (Reserve Weight / Total Weight) × 100

Total Weight = Sum of all reserve weights + Unallocated Weight
```

**Example**:
- Reserve A weight: 100
- Reserve B weight: 400
- Reserve C weight: 500
- Unallocated weight: 0
- **Total weight**: 1,000

**Resulting allocations**:
- Reserve A: 10%
- Reserve B: 40%
- Reserve C: 50%

**Display Convention**: Weights shown with calculated percentage, e.g., `500 (50%)`

### 3.3 Adding Reserves

To add a reserve allocation:
1. Select Market
2. Select Reserve within market
3. Set Allocation Weight
4. Set Allocation Cap (optional)
5. Configure Reserve Type (standard or conditional)
6. Submit transaction

#### Reserve Selection

- Reserves are within markets (not at market level)
- A single market can contain multiple reserves of the same token
  - Example: Main Market contains USDC Floating Rate + USDC Fixed 3M + USDC Fixed 6M
- Curators allocate to specific reserves

#### Reserve Information

Each available reserve displays:
- Market name and TVL
- Reserve type (floating/fixed rate)
- Supply APY
- Reserve TVL and utilization

### 3.4 Per-Reserve Allocation Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| **target_allocation_weight** | Integer | Relative weight for this reserve in allocation distribution |
| **allocation_cap** | Token amount | Maximum token amount allocated to this reserve regardless of weight |
| **reserve_type** | Enum: `standard` or `conditional` | Allocation behavior (see §3.6) |
| **priority** | Integer | Priority ordering for allocation execution |

### 3.5 Allocation Cap

**Purpose**: Hard limit on allocation to a single reserve, independent of weight.

**Behavior**:
- Vault allocates up to the cap amount
- If weight implies more than cap, allocation stops at cap
- Excess funds distributed to other allocations per their weights

**Example**:
- Reserve weight: 500 (50% of total)
- Vault size: 1M USDC
- Allocation cap: 200K USDC
- **Result**: Only 200K allocated to this reserve (not 500K), even though weight suggests 50%

**Use Case**: Risk management — limit exposure to any single reserve/market.

### 3.6 Reserve Types

#### Standard Allocation
- **Behavior**: Always allocated according to weight
- **Use Case**: Floating rate reserves; continuous liquidity provision
- **Parameter**: `reserve_type: standard`

#### Conditional Allocation
- **Behavior**: Only allocates when borrowers request liquidity
- **Use Case**: Fixed rate reserves; higher priority "on-demand" liquidity
- **Parameter**: `reserve_type: conditional`
- **Weight Handling**: For conditional reserves, **weight is ignored**; only allocation cap matters
- **Priority**: Conditional reserves have higher priority than standard allocations
- **Liquidity Flow**: Funds remain in standard allocations until conditional reserve needs liquidity, then rebalance on-demand

**Note**: Conditional Allocation is recommended for fixed rate reserves.

**Example**:
- Curator sets conditional allocation with 10M cap at 5% fixed rate for 3 months
- Funds stay in floating rate reserves until a borrower requests the fixed rate
- When requested, vault rebalances to provide up to 10M to the fixed rate reserve

### 3.7 Managing Allocations

#### 3.7.1 Edit Single Allocation

Edit an individual reserve allocation:
- Modify weight, cap, or reserve type
- View current reserve metrics (APY, supply, borrow, utilization)
- Access market ID and reserve ID

#### 3.7.2 Edit Multiple Allocations (Batch)

Edit weights for multiple reserves in a single transaction:
- Modify allocation weights across all reserves
- View real-time percentage recalculation
- See projected vault APY impact
- Includes unallocated funds in calculation

#### 3.7.3 Remove Reserve

Remove a reserve by setting its weight to 0 or removing the allocation entirely. Removed reserve's allocation is redistributed to remaining reserves per their weights.

### 3.8 Unallocated Funds (Liquidity Buffer)

Portion of vault kept idle to service withdrawals without requiring reserve rebalancing.

| Parameter | Type | Description |
|-----------|------|-------------|
| **UnallocatedWeight** | Integer | Relative weight for unallocated funds (participates in total weight calculation) |
| **UnallocatedTokensCap** | Token amount | Maximum absolute amount to keep unallocated |

**Behavior**:
- Unallocated weight determines target percentage of vault to keep idle
- Cap limits absolute amount even if weight implies more

**Example**:
- Total vault: 10M USDC
- Unallocated weight: 80 (8% of total weight 1,000)
- Unallocated cap: 2M USDC
- **Result**: Target 800K unallocated (8%), but if vault grows and 8% exceeds 2M, cap at 2M


### 3.9 Syncing Allocations

Rebalances vault to match target allocations. Permissionless action (anyone can trigger).

**When needed**: Actual allocations drift from targets due to deposits, withdrawals, interest accrual, or conditional allocation activation.

### 3.10 Reserve Whitelisting

#### AllowAllocationsInWhitelistedReservesOnly
- **Type**: Boolean toggle
- **Description**: If enabled, vault admin can only allocate to protocol-verified reserves
- **Constraint**: Cannot add unverified reserves; can still remove or edit existing allocations
- **Use Case**: Risk management — restrict vault to vetted reserves only

#### AllowInvestInWhitelistedReservesOnly
- **Type**: Boolean toggle
- **Description**: If enabled, depositor funds can only flow into protocol-verified reserves
- **Constraint**: Stricter than allocation whitelist; prevents any investment in unverified reserves
- **Use Case**: Maximum security — guarantee depositors their funds only touch verified reserves

**Note**: Protocol admins manage reserve verification status. Curators cannot whitelist reserves.

---

## 5. Vault Farm & Rewards

### 5.1 Vault Farm

**Purpose**: Enable rewards distribution to vault depositors (receipt token holders).

**Requirement**: One farm per vault; must be created and attached before rewards can be distributed.

#### 5.1.1 Farm Creation

Creates farm, sets it to vault, and transfers authority to protocol in a single transaction.

**Parameter**: `Farm` (farm public key)

**Note**: Farm address is immutable after creation.

#### 5.1.2 Farm Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| **Farm** | Public key | Farm address (set at creation) |
| **Cooldown Period** | Duration | Delay before reward claims are available; prevents exploit-based farming |

**Cooldown Period**: Configured when setting up reward distribution; prevents depositors from depositing, claiming rewards, and immediately withdrawing.

### 5.2 First Loss Capital Farm

Manager-deposited capital that absorbs vault losses before depositors incur any loss.

| Parameter | Type | Description |
|-----------|------|-------------|
| **FirstLossCapitalFarm** | Public key | Farm holding first loss capital buffer |
| **Token** | Token type | Asset deposited as first loss capital |
| **Lockup Period** | Duration | Period capital is locked and cannot be withdrawn |

**Loss Waterfall**: Vault bad debt → First Loss Capital buffer absorbs → if buffer depleted, depositors incur loss.

**Setup**: Create vault farm → configure token and lockup period → deposit assets.

### 5.3 Vault Autocompound Farm

**Parameter**: `VaultAutocompoundFarm` (farm public key)

Farm that distributes rewards in the vault's deposit token, automatically compounding into vault positions.

**Example**: USDC vault → farm distributes USDC rewards → rewards reinvested automatically.

### 5.4 Crank Fund Fee

**Parameter**: `CrankFundFeePerReserve` (fee amount per reserve)

Fee charged per reserve to fund crank operations that maintain vault state and execute rebalancing.

---

## 6. Transaction Execution

### 6.1 Hot Wallet vs Multisig

| Admin Type | Execution Method |
|------------|------------------|
| **Hot Wallet** | Direct transaction signature and submission |
| **Multisig (Squads)** | Simulate transaction → copy base58 encoded transaction → execute in Squads |

### 6.2 Transaction Flow

1. Modify vault parameters
2. Review changes
3. Simulate transaction
4. Execute:
   - **Hot wallet**: Sign and submit
   - **Multisig**: Copy base58 transaction → import to Squads → multisig approval → execute

### 6.3 Simulation Output

Transaction simulation provides:
- Encoded transaction (base58 string)
- Program execution logs
- Success/failure status

For multisig admins, copy the encoded transaction to execute in Squads.

---

## 7. Parameter Reference

### 7.1 Vault-Level Parameters

| Parameter | Type | Set At | Editable | Description |
|-----------|------|--------|----------|-------------|
| `Name` | String | Creation | Yes | Vault display name |
| `LookupTable` | Public key | Creation | Yes | Address lookup table; managed by protocol |
| `Farm` | Public key | Post-creation | No (immutable) | Vault's rewards distribution farm |
| `PerformanceFeeBps` | Basis points | Creation | Yes | Fee on vault profits |
| `ManagementFeeBps` | Basis points | Creation | Yes | Annual fee on AUM |
| `MinDepositAmount` | Lamports | Creation | Yes | Minimum deposit size |
| `MinWithdrawAmount` | Lamports | Creation | Yes | Minimum withdrawal size |
| `MinInvestAmount` | Token amount | Creation | Yes | Minimum investment instruction size |
| `MinInvestDelaySlots` | Slots | Creation | Yes | Delay before investment executes |
| `WithdrawalPenaltyBps` | Basis points | Creation | Yes | Percentage withdrawal penalty (returned to vault) |
| `WithdrawalPenaltyLamports` | Lamports | Creation | Yes | Absolute withdrawal penalty (returned to vault) |
| `PendingVaultAdmin` | Public key | Set during transfer | No (system-managed) | Pending admin during two-step transfer |
| `AllocationAdmin` | Public key | Post-creation | Yes (via transfer) | Admin that can only update weights |
| `UnallocatedWeight` | Integer | Post-creation | Yes | Relative weight for unallocated funds |
| `UnallocatedTokensCap` | Token amount | Post-creation | Yes | Maximum unallocated token amount |
| `FirstLossCapitalFarm` | Public key | Post-creation | Yes | Farm holding first loss capital |
| `VaultAutocompoundFarm` | Public key | Post-creation | Yes | Farm for autocompounding vault token rewards |
| `CrankFundFeePerReserve` | Token amount | Post-creation | Yes | Fee per reserve for crank operations |
| `AllowAllocationsInWhitelistedReservesOnly` | Boolean | Post-creation | Yes | Restrict allocations to verified reserves |
| `AllowInvestInWhitelistedReservesOnly` | Boolean | Post-creation | Yes | Restrict investments to verified reserves |

### 7.2 Per-Allocation Parameters

| Parameter | Type | Editable | Description |
|-----------|------|----------|-------------|
| `target_allocation_weight` | Integer | Yes | Relative weight for allocation distribution |
| `allocation_cap` | Token amount | Yes | Maximum token amount for this reserve |
| `reserve_type` | Enum: `standard` \| `conditional` | Yes | Allocation behavior (always allocated vs on-demand) |
| `priority` | Integer | Yes | Priority ordering for allocation execution |

### 7.3 Farm Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `Farm` | Public key | Vault's rewards farm address |
| `Cooldown Period` | Duration | Delay before rewards claimable |
| `FirstLossCapitalFarm` | Public key | Farm holding first loss capital buffer |
| `VaultAutocompoundFarm` | Public key | Autocompounding farm for vault token |

### 7.4 Immutable Parameters

These parameters cannot be changed after creation:

- Deposit Token (vault token)
- Receipt Token Ticker prefix (`kv[symbol]-`)
- Farm address (once set)

### 7.5 System-Managed Parameters

These parameters are set by the system, not directly by curators:

- `PendingVaultAdmin` (set during admin transfer)
- Farm authority (transferred to protocol after farm creation)

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **AUM Fee** | Assets Under Management fee; annual percentage fee on total vault value |
| **Allocation Cap** | Maximum absolute token amount for a reserve allocation |
| **Allocation Weight** | Relative integer controlling allocation percentage |
| **Conditional Allocation** | Allocation type that only activates when borrowers request liquidity |
| **Crank** | Off-chain bot that triggers on-chain state updates |
| **Curator** | Vault creator and manager; admin wallet |
| **First Loss Capital** | Manager-deposited buffer that absorbs vault losses before depositors |
| **Fixed Rate Reserve** | Reserve offering fixed interest rate for specified duration |
| **Floating Rate Reserve** | Reserve with variable interest rate |
| **Hot Wallet** | Standard wallet that signs transactions directly |
| **Lamports** | Smallest unit of SOL (1 SOL = 1 billion lamports) |
| **Liquidity Buffer** | Unallocated funds kept idle for withdrawals |
| **Multisig** | Multi-signature wallet requiring multiple approvals (e.g., Squads) |
| **Performance Fee** | Fee on vault profits |
| **Receipt Token (kToken)** | Token representing depositor's share of vault |
| **Reserve** | Specific lending pool within a market |
| **Squads** | Solana multisig solution for multi-party transaction approval |
| **Standard Allocation** | Allocation type that always maintains position per weight |
| **Sync Allocations** | Permissionless action to rebalance vault to match target allocations |
| **Unallocated Funds** | Idle vault funds not allocated to reserves |
| **Withdrawal Penalty** | Fee on withdrawals returned to vault (not to admin) |

---

## Appendix B: Reserve Type Comparison

| Aspect | Standard Allocation | Conditional Allocation |
|--------|---------------------|------------------------|
| **Behavior** | Always allocated per weight | Only allocates when liquidity needed |
| **Weight Handling** | Weight determines allocation % | Weight ignored; only cap matters |
| **Use Case** | Floating rate reserves | Fixed rate reserves |
| **Priority** | Normal | Higher priority (on-demand) |
| **Liquidity Flow** | Continuous | Allocated when borrower requests |
| **Risk Profile** | Standard | Lower utilization; higher APY when active |

---

## Appendix C: Fee Type Comparison

| Fee Type | Recipient | Basis | Calculation | Purpose |
|----------|-----------|-------|-------------|---------|
| **Performance Fee** | Vault Admin | Vault profits | % of gains | Manager compensation for performance |
| **AUM Fee** | Vault Admin | Total vault value | Annual % of AUM | Manager compensation for management |
| **Withdrawal Penalty (BPS)** | Vault (depositors) | Withdrawal amount | % of withdrawal | Discourage short-term withdrawals |
| **Withdrawal Penalty (Lamports)** | Vault (depositors) | Absolute | Fixed lamports | Prevent dust withdrawals |
| **Crank Fund Fee** | Protocol | Per reserve | Fixed per reserve | Cover computational costs |

**Key Distinction**: Manager fees go to vault admin; withdrawal penalties are returned to the vault to benefit remaining depositors.

---

*Documentation generated from product meeting transcripts, Figma UI designs, and canonical parameter specifications.*
*For questions or clarifications, contact the Kamino Prime team.*
