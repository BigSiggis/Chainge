import { useState, useCallback, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useVaultProgram } from "./useVaultProgram";
import { useTransactionMonitor } from "./useTransactionMonitor";

export function useChainge() {
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();
  const vault = useVaultProgram();

  // Config
  const [roundUpAmount, setRoundUpAmount] = useState(0.1);
  const [strategy, setStrategy] = useState("stake");
  const [isActive, setIsActive] = useState(false);

  // State
  const [totalSaved, setTotalSaved] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [solBalance, setSolBalance] = useState(0);
  const [vaultData, setVaultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Round-up handler — deposits into real contract
  const handleRoundUp = useCallback(
    async (event) => {
      setTransactions((prev) => [event, ...prev.slice(0, 49)]);

      // Deposit the round-up into the on-chain vault
      try {
        await vault.deposit(event.roundUp);
        setTotalSaved((prev) => prev + event.roundUp);
      } catch (err) {
        console.error("[Chainge] Deposit failed:", err);
        // Still track it locally even if on-chain fails
        setTotalSaved((prev) => prev + event.roundUp);
      }
    },
    [vault]
  );

  const { isMonitoring, startPolling, stopPolling } = useTransactionMonitor(
    publicKey?.toString() || null,
    roundUpAmount,
    handleRoundUp
  );

  // Fetch SOL balance
  useEffect(() => {
    if (!connected || !publicKey || !connection) {
      setSolBalance(0);
      return;
    }
    const fetchBalance = async () => {
      try {
        const bal = await connectio
cat > src/hooks/useChainge.js << 'EOF'
import { useState, useCallback, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useVaultProgram } from "./useVaultProgram";
import { useTransactionMonitor } from "./useTransactionMonitor";

export function useChainge() {
  const { publicKey, connected, disconnect } = useWallet();
  const { connection } = useConnection();
  const vault = useVaultProgram();

  const [roundUpAmount, setRoundUpAmount] = useState(0.1);
  const [strategy, setStrategy] = useState("stake");
  const [isActive, setIsActive] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [solBalance, setSolBalance] = useState(0);
  const [vaultData, setVaultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRoundUp = useCallback(async (event) => {
    setTransactions((prev) => [event, ...prev.slice(0, 49)]);
    try {
      await vault.deposit(event.roundUp);
      setTotalSaved((prev) => prev + event.roundUp);
    } catch (err) {
      console.error("[Chainge] Deposit failed:", err);
      setTotalSaved((prev) => prev + event.roundUp);
    }
  }, [vault]);

  const { isMonitoring, startPolling, stopPolling } = useTransactionMonitor(
    publicKey?.toString() || null,
    roundUpAmount,
    handleRoundUp
  );

  useEffect(() => {
    if (!connected || !publicKey || !connection) { setSolBalance(0); return; }
    const fetchBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        setSolBalance(bal / LAMPORTS_PER_SOL);
      } catch (err) { console.error("[Chainge] Balance fetch error:", err); }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [connected, publicKey, connection]);

  useEffect(() => {
    if (!connected || !publicKey) return;
    const loadVault = async () => {
      const data = await vault.fetchVault();
      if (data) {
        setVaultData(data);
        setTotalSaved(data.totalDeposited);
        setRoundUpAmount(data.roundUpAmount);
        setStrategy(data.strategy);
        setIsActive(data.isActive);
      }
    };
    loadVault();
  }, [connected, publicKey]);

  const activate = useCallback(async () => {
    if (!connected || !publicKey || !connection) return;
    setLoading(true);
    setError(null);
    try {
      const existingVault = await vault.fetchVault();
      if (!existingVault) {
        await vault.initializeVault(roundUpAmount, strategy);
      } else {
        await vault.updateSettings(roundUpAmount, strategy, true);
      }
      setIsActive(true);
      startPolling(connection, publicKey);
      const data = await vault.fetchVault();
      if (data) setVaultData(data);
    } catch (err) {
      console.error("[Chainge] Activation error:", err);
      setError(err.message);
    } finally { setLoading(false); }
  }, [connected, publicKey, connection, vault, roundUpAmount, strategy, startPolling]);

  const deactivate = useCallback(async () => {
    try { await vault.updateSettings(null, null, false); } catch (err) { console.error("[Chainge] Deactivation error:", err); }
    setIsActive(false);
    stopPolling();
  }, [vault, stopPolling]);

  const withdrawFunds = useCallback(async (amount) => {
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      await vault.withdraw(amount);
      const data = await vault.fetchVault();
      if (data) { setVaultData(data); setTotalSaved(data.totalDeposited - data.totalWithdrawn); }
    } catch (err) { console.error("[Chainge] Withdraw error:", err); setError(err.message); }
    finally { setLoading(false); }
  }, [vault]);

  const txCount = transactions.length + (vaultData?.depositCount || 0);
  const avgRoundUp = txCount > 0 ? totalSaved / txCount : 0;
  const projectedMonthly = avgRoundUp * 30 * 12;
  const walletAddress = publicKey ? publicKey.toString().slice(0, 4) + "..." + publicKey.toString().slice(-3) : "";

  return {
    connected, publicKey, walletAddress, solBalance,
    roundUpAmount, setRoundUpAmount, strategy, setStrategy,
    isActive, isMonitoring, activate, deactivate, loading, error,
    totalSaved, transactions, txCount, avgRoundUp, projectedMonthly, vaultData,
    withdrawFunds, handleRoundUp,
  };
}
