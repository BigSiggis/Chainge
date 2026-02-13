// ── Network & RPC ──
export const NETWORK = "mainnet-beta";
export const HELIUS_API_KEY = import.meta.env.VITE_HELIUS_API_KEY || "";

// ── Round-up Options ──
export const ROUND_OPTIONS = [
  { value: 0.01, label: "0.01 SOL" },
  { value: 0.05, label: "0.05 SOL" },
  { value: 0.1, label: "0.1 SOL" },
  { value: 0.5, label: "0.5 SOL" },
];

// ── Yield Strategies ──
export const STRATEGIES = [
  {
    id: "stake",
    name: "Liquid Stake",
    desc: "Staked into JitoSOL — you earn validator rewards + MEV tips. Redeemable anytime.",
    apy: "7.2%",
    icon: "◈",
    risk: null,
  },
  {
    id: "lp",
    name: "LP Yield",
    desc: "Deposited into concentrated SOL-USDC liquidity on Orca. You earn swap fees from every trade.",
    apy: "12-18%",
    icon: "◇",
    risk: "Impermanent loss risk — if SOL price moves significantly, your position may underperform just holding.",
  },
  {
    id: "dca",
    name: "DCA into Token",
    desc: "Auto-buys your chosen token via Jupiter DCA. Spreads entries over time to reduce risk.",
    apy: "—",
    icon: "↻",
    risk: null,
  },
  {
    id: "save",
    name: "Vault",
    desc: "SOL held in a non-custodial on-chain vault. No yield, just stacking. Withdraw anytime.",
    apy: "0%",
    icon: "◉",
    risk: null,
  },
];

// ── Token list for simulated data ──
export const TOKEN_LIST = [
  "POPCAT", "JUP", "MEW", "TNSR", "PYTH",
  "RAY", "HNT", "RENDER", "DRIFT", "W",
  "JTO", "ORCA", "MNDE", "BONK", "WIF",
];

// ── Misc ──
export const SOL_PRICE_USD = 138; // placeholder, replace with live price fetch
