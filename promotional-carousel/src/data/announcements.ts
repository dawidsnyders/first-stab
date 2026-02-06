import { Announcement } from '@/types';

export const announcements: Announcement[] = [
  {
    id: 'sp500-exposure',
    logo: '/logos/sp500.svg',
    headline: 'Get 2x S&P500 Exposure',
    subtitle: 'Leveraged index vaults now live',
    stat: { label: 'Leverage', value: '2x' },
    accentColor: '#3b82f6',
    cta: {
      label: 'Explore Vault',
      action: { type: 'modal', target: 'sp500-exposure' },
    },
    detail: {
      description:
        'Access leveraged exposure to the S&P 500 index through our new vault strategy. Built on battle-tested infrastructure with automated rebalancing and risk management, this vault lets you amplify your index returns without managing leverage manually.',
      stats: [
        { label: 'Leverage', value: '2x' },
        { label: 'TVL', value: '$4.2M' },
        { label: 'Management Fee', value: '0.5%' },
        { label: 'Strategy', value: 'Auto-Rebalance' },
      ],
      ctaLabel: 'Enter Vault',
      ctaLink: '/vaults/sp500-2x',
    },
  },
  {
    id: 'prime-boost',
    logo: '/logos/prime.svg',
    headline: 'Multiply PRIME for Boosted RWA Yield',
    subtitle: 'Stake and earn boosted rewards',
    stat: { label: 'APY', value: '12.5%' },
    accentColor: '#10b981',
    cta: {
      label: 'Stake Now',
      action: { type: 'modal', target: 'prime-boost' },
    },
    detail: {
      description:
        'Multiply your PRIME tokens to earn boosted yield on real-world asset positions. The longer you lock, the higher your multiplier. Rewards are distributed weekly and auto-compound into your position for maximum capital efficiency.',
      stats: [
        { label: 'Base APY', value: '8.2%' },
        { label: 'Boosted APY', value: '12.5%' },
        { label: 'Lock Period', value: '90 Days' },
        { label: 'Total Staked', value: '$18.7M' },
      ],
      ctaLabel: 'Start Staking',
      ctaLink: '/stake/prime',
    },
  },
  {
    id: 'collateral-swap',
    logo: '/logos/swap.svg',
    headline: 'Collateral Swap Now Live',
    subtitle: 'Swap collateral without closing positions',
    stat: { label: 'Downtime', value: '0' },
    accentColor: '#8b5cf6',
    cta: {
      label: 'Try It',
      action: { type: 'modal', target: 'collateral-swap' },
    },
    detail: {
      description:
        'Seamlessly swap your collateral assets without unwinding existing positions. Whether you\'re rotating from ETH to stETH or diversifying across stablecoins, collateral swap handles the migration atomically in a single transaction with zero position downtime.',
      stats: [
        { label: 'Downtime', value: '0' },
        { label: 'Supported Assets', value: '12' },
        { label: 'Swap Fee', value: '0.1%' },
        { label: 'Transactions', value: '1' },
      ],
      ctaLabel: 'Swap Collateral',
      ctaLink: '/collateral-swap',
    },
  },
  {
    id: 'gauntlet-vault',
    logo: '/logos/gauntlet.svg',
    headline: 'Gauntlet RWA Lending Vault Live',
    subtitle: 'Institutional-grade lending',
    stat: { label: 'TVL', value: '$2.4M' },
    accentColor: '#f59e0b',
    cta: {
      label: 'View Vault',
      action: { type: 'modal', target: 'gauntlet-vault' },
    },
    detail: {
      description:
        'The Gauntlet RWA Lending Vault brings institutional-grade risk management to DeFi lending. Powered by Gauntlet\'s quantitative models, this vault dynamically adjusts lending parameters to optimize yield while maintaining strict risk thresholds across real-world asset collateral.',
      stats: [
        { label: 'TVL', value: '$2.4M' },
        { label: 'Net APY', value: '6.8%' },
        { label: 'Risk Rating', value: 'A+' },
        { label: 'Utilization', value: '78%' },
      ],
      ctaLabel: 'Deposit Now',
      ctaLink: '/vaults/gauntlet-rwa',
    },
  },
  {
    id: 'kamino-credit',
    logo: '/logos/kamino.svg',
    headline: 'Kamino Private Credit',
    subtitle: 'BTC-Backed Institutional Yield',
    stat: { label: 'Yield', value: '7%' },
    accentColor: '#06b6d4',
    cta: {
      label: 'Learn More',
      action: { type: 'modal', target: 'kamino-credit' },
    },
    detail: {
      description:
        'Access institutional-grade private credit yield backed by Bitcoin collateral. Kamino\'s private credit facility connects DeFi liquidity with vetted institutional borrowers, offering stable 7% returns with BTC over-collateralization providing robust downside protection.',
      stats: [
        { label: 'Fixed Yield', value: '7%' },
        { label: 'Collateral', value: 'BTC' },
        { label: 'LTV Ratio', value: '50%' },
        { label: 'Min. Deposit', value: '$1,000' },
      ],
      ctaLabel: 'Access Credit',
      ctaLink: '/credit/kamino',
    },
  },
];
