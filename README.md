# Chainge

**Spare change round-up protocol for Solana.**

Every transaction you make, the spare change gets swept into yield. No bank. No KYC. Pure DeFi savings on autopilot.

---

## What is Chainge?

Chainge is like Acorns — but fully on-chain, for Solana. It monitors your wallet for outgoing transactions, calculates the round-up (spare change), and auto-deposits it into a yield strategy of your choice.

**Example:** You swap 0.341 SOL for POPCAT. Chainge rounds up to 0.5 → the 0.159 SOL difference gets swept into JitoSOL liquid staking, earning you 7.2% APY from validator rewards + MEV tips. You didn't even notice the money leaving.

## Why?

- **Degens make a lot of transactions.** Round-ups add up fast.
- **Nobody saves in DeFi.** This makes it automatic.
- **Solana fees are basically free.** This wouldn't work on ETH.
- **It's money you don't feel leaving.** Same psychology as Acorns.

## Yield Strategies

| Strategy | How it works | APY | Risk |
|----------|-------------|-----|------|
| **Liquid Stake** | SOL staked into JitoSOL. You earn validator rewards + MEV tips. Redeemable anytime. | ~7.2% | Low |
| **LP Yield** | Deposited into concentrated SOL-USDC liquidity on Orca. You earn swap fees. | 12-18% | Medium (IL risk) |
| **DCA** | Auto-buys your chosen token via Jupiter DCA. Spreads entries over time. | — | Varies |
| **Vault** | SOL held in a non-custodial on-chain vault. No yield, just stacking. | 0% | None |

## Tech Stack

- **Frontend:** React + Vite
- **Wallet:** Solana Wallet Adapter (Phantom, Solflare)
- **Monitoring:** Helius webhooks / Enhanced Websockets
- **Yield:** Jito (liquid staking), Orca (LP), Jupiter (DCA)
- **On-chain:** Anchor smart contract (vault program)

## Getting Started

```bash
# Clone
git clone https://github.com/yourusername/chainge.git
cd chainge

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your Helius API key and RPC URL

# Run
npm run dev
```

## Project Structure

```
chainge/
├── src/
│   ├── components/
│   │   ├── WalletProviders.jsx   # Solana wallet adapter setup
│   │   ├── Landing.jsx           # Landing page / hero
│   │   ├── Config.jsx            # Round-up & strategy config
│   │   └── Dashboard.jsx         # Main savings dashboard
│   ├── hooks/
│   │   ├── useChainge.js         # Core app state management
│   │   └── useTransactionMonitor.js  # Wallet tx monitoring
│   ├── utils/
│   │   ├── constants.js          # Strategies, config, tokens
│   │   └── roundup.js            # Round-up calculation logic
│   ├── styles/
│   │   └── global.css            # Global styles + wallet overrides
│   ├── App.jsx                   # Main app with routing
│   └── main.jsx                  # Entry point with providers
├── contracts/
│   └── programs/
│       └── chainge/
│           └── src/              # Anchor program (coming soon)
├── public/
│   └── favicon.svg
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

## Roadmap

- [x] UI/UX — Landing, config, dashboard
- [x] Wallet connection — Phantom, Solflare
- [x] Transaction monitoring — Helius webhook integration
- [x] Round-up calculation engine
- [ ] Anchor vault program — On-chain spare change vault
- [ ] JitoSOL integration — Auto-stake round-ups
- [ ] Orca LP integration — Auto-LP round-ups
- [ ] Jupiter DCA integration — Auto-DCA round-ups
- [ ] Auto-sweep service — Batch and execute round-ups
- [ ] Withdraw flow — Pull savings anytime
- [ ] Mobile optimization — Seeker-ready
- [ ] Contract audit

## How Transaction Monitoring Works

Chainge uses [Helius](https://helius.dev) to monitor your wallet in real-time:

1. **Enhanced Websockets** connect to your wallet address
2. Every outgoing transaction triggers a callback
3. The round-up amount is calculated based on your settings
4. Round-ups are batched and swept into your chosen strategy

No private keys are ever accessed. Chainge only reads your public transaction history — the same data anyone can see on a block explorer.

## Contributing

This is open source and we welcome contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Areas we need help:
- Anchor smart contract development
- Yield strategy integrations (Jito, Orca, Jupiter)
- Mobile / Seeker optimization
- Testing and security review

## License

MIT — do whatever you want with it.

---

**Built by degens, for degens.** No VC funding. No token. Just a useful tool.
