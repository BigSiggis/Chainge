import { useState, useCallback, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTransactionMonitor } from "./useTransactionMonitor";

/**
 * useChainge
 *
 * Main application state hook. Manages:
 * - Wallet connection state
 * - User configuration (round-up amount, strategy)
 * - Transaction history and round-up tracking
 * - Savings totals and projections
 */
export function useChainge() {
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();

  // ── User Config ──
  const [roundUpAmount, setRoundUpAmount] = useState(0.1);
  const [strategy, setStrategy] = useState("stake");
  const [isActive, setIsActive] = useState(false);

  // ── Savings State ──
  const [totalSaved, setTotalSaved] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [solBalance, setSolBalance] = useState(0);

  // ── Transaction Monitor ──
  const handleRoundUp = useCallback((event) => {
    setTransactions((prev) => [event, ...prev.slice(0, 49)]);
    setTotalSaved((prev) => prev + event.roundUp);
  }, []);

  const { isMonitoring, startPolling, stopPolling } =
    useTransactionMonitor(
      publicKey?.toString() || null,
      roundUpAmount,
      handleRoundUp
    );

  // ── Fetch SOL balance on connect ──
  useEffect(() => {
    if (!connected || !publicKey || !connection) {
      setSolBalance(0);
      return;
    }

    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        setSolBalance(bal / LAMPORTS_PER_SOL);
      } catch (err) {
        console.error("[Chainge] Balance fetch error:", err);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30_000);
    return () => clearInterval(interval);
  }, [connected, publicKey, connection]);

  // ── Activate monitoring ──
  const activate = useCallback(() => {
    if (!connected || !publicKey || !connection) return;
    setIsActive(true);
    startPolling(connection, publicKey);
  }, [connected, publicKey, connection, startPolling]);

  const deactivate = useCallback(() => {
    setIsActive(false);
    stopPolling();
  }, [stopPolling]);

  // ── Computed Stats ──
  const txCount = transactions.length;
  const avgRoundUp =
    txCount > 0
      ? transactions.reduce((sum, tx) => sum + tx.roundUp, 0) / txCount
      : 0;
  const projectedMonthly = avgRoundUp * 30 * 12; // assume 12 txs/day for active trader

  // ── Wallet address formatting ──
  const walletAddress = publicKey
    ? `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-3)}`
    : "";

  return {
    // Wallet
    connected,
    publicKey,
    walletAddress,
    solBalance,
    disconnect,

    // Config
    roundUpAmount,
    setRoundUpAmount,
    strategy,
    setStrategy,

    // State
    isActive,
    isMonitoring,
    activate,
    deactivate,

    // Savings
    totalSaved,
    transactions,
    txCount,
    avgRoundUp,
    projectedMonthly,

    // Manual trigger for testing
    handleRoundUp,
  };
}
