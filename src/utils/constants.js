export var SOL_PRICE_USD = 138;
export var ROUND_OPTIONS = [
  { label: "0.01", value: 0.01 },
  { label: "0.05", value: 0.05 },
  { label: "0.1", value: 0.1 },
  { label: "0.5", value: 0.5 },
];
export var LST_OPTIONS = [
  { id: "jito", name: "JitoSOL", desc: "Validator rewards + MEV tips. Largest LST on Solana.", apy: "~7.5%" },
  { id: "helius", name: "hSOL (Helius)", desc: "0% commission, 100% MEV rewards. Largest validator.", apy: "~7.5%" },
  { id: "phantom", name: "PSOL (Phantom)", desc: "MEV tips + priority fees. Native Phantom staking.", apy: "~7%" },
  { id: "marinade", name: "mSOL (Marinade)", desc: "100+ validators. Most decentralized LST.", apy: "~6.1%" },
  { id: "sanctum", name: "INF (Sanctum)", desc: "Multi-LST pool. Staking + trading fee yield.", apy: "~8%+" },
];
export var STRATEGIES = [
  { id: "stake", name: "Liquid Stake", desc: "Stake spare change into a liquid staking token and earn yield.", icon: "\u26A1", apy: "6-8%", risk: null, hasLstPicker: true },
  { id: "lp", name: "LP Yield", desc: "Concentrated SOL-USDC on Orca. Higher yield, higher risk.", icon: "\uD83D\uDCA7", apy: "12-18%", risk: "Impermanent loss risk. Your deposit value can fluctuate with price changes.", hasLstPicker: false },
  { id: "dca", name: "DCA", desc: "Jupiter DCA auto-buys your chosen token. Spreads entries over time.", icon: "\uD83D\uDCCA", apy: "\u2014", risk: null, hasLstPicker: false },
  { id: "save", name: "Vault", desc: "Non-custodial on-chain holding. 0% yield but withdraw anytime.", icon: "\uD83D\uDD12", apy: "0%", risk: null, hasLstPicker: false },
];
export var TOKENS = ["POPCAT","JUP","MEW","TNSR","PYTH","RAY","HNT","RENDER","DRIFT","W"];
