import { useState, useCallback, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useVaultProgram } from "./useVaultProgram";
import { useTransactionMonitor } from "./useTransactionMonitor";

export function useChainge() {
  var publicKey = useWallet().publicKey;
  var connected = useWallet().connected;
  var disconnect = useWallet().disconnect;
  var connection = useConnection().connection;
  var vault = useVaultProgram();

  var _roundUp = useState(0.1);
  var roundUpAmount = _roundUp[0];
  var setRoundUpAmount = _roundUp[1];

  var _strat = useState("stake");
  var strategy = _strat[0];
  var setStrategy = _strat[1];

  var _active = useState(false);
  var isActive = _active[0];
  var setIsActive = _active[1];

  var _saved = useState(0);
  var totalSaved = _saved[0];
  var setTotalSaved = _saved[1];

  var _txs = useState([]);
  var transactions = _txs[0];
  var setTransactions = _txs[1];

  var _bal = useState(0);
  var solBalance = _bal[0];
  var setSolBalance = _bal[1];

  var _vault = useState(null);
  var vaultData = _vault[0];
  var setVaultData = _vault[1];

  var _load = useState(false);
  var loading = _load[0];
  var setLoading = _load[1];

  var _err = useState(null);
  var error = _err[0];
  var setError = _err[1];

  var handleRoundUp = useCallback(function(event) {
    setTransactions(function(prev) { return [event].concat(prev.slice(0, 49)); });
    vault.deposit(event.roundUp).then(function() {
      setTotalSaved(function(prev) { return prev + event.roundUp; });
    }).catch(function(err) {
      console.error("[Chainge] Deposit failed:", err);
      setTotalSaved(function(prev) { return prev + event.roundUp; });
    });
  }, [vault]);

  var monitor = useTransactionMonitor(
    publicKey ? publicKey.toString() : null,
    roundUpAmount,
    handleRoundUp
  );

  useEffect(function() {
    if (!connected || !publicKey || !connection) { setSolBalance(0); return; }
    var fetchBalance = function() {
      connection.getBalance(publicKey).then(function(bal) {
        setSolBalance(bal / LAMPORTS_PER_SOL);
      }).catch(function(err) { console.error("[Chainge] Balance error:", err); });
    };
    fetchBalance();
    var interval = setInterval(fetchBalance, 30000);
    return function() { clearInterval(interval); };
  }, [connected, publicKey, connection]);

  useEffect(function() {
    if (!connected || !publicKey) return;
    vault.fetchVault().then(function(data) {
      if (data) {
        setVaultData(data);
        setTotalSaved(data.totalDeposited);
        setRoundUpAmount(data.roundUpAmount);
        setStrategy(data.strategy);
        setIsActive(data.isActive);
      }
    });
  }, [connected, publicKey]);

  var activate = useCallback(function() {
    if (!connected || !publicKey || !connection) return;
    setLoading(true);
    setError(null);
    vault.fetchVault().then(function(existingVault) {
      if (!existingVault) {
        return vault.initializeVault(roundUpAmount, strategy);
      } else {
        return vault.updateSettings(roundUpAmount, strategy, true);
      }
    }).then(function() {
      setIsActive(true);
      monitor.startPolling(connection, publicKey);
      return vault.fetchVault();
    }).then(function(data) {
      if (data) setVaultData(data);
    }).catch(function(err) {
      console.error("[Chainge] Activation error:", err);
      setError(err.message);
    }).finally(function() { setLoading(false); });
  }, [connected, publicKey, connection, vault, roundUpAmount, strategy, monitor]);

  var deactivate = useCallback(function() {
    vault.updateSettings(null, null, false).catch(function(err) {
      console.error("[Chainge] Deactivation error:", err);
    });
    setIsActive(false);
    monitor.stopPolling();
  }, [vault, monitor]);

  var withdrawFunds = useCallback(function(amount) {
    if (!amount || amount <= 0) return;
    setLoading(true);
    vault.withdraw(amount).then(function() {
      return vault.fetchVault();
    }).then(function(data) {
      if (data) { setVaultData(data); setTotalSaved(data.totalDeposited - data.totalWithdrawn); }
    }).catch(function(err) {
      console.error("[Chainge] Withdraw error:", err);
      setError(err.message);
    }).finally(function() { setLoading(false); });
  }, [vault]);

  var txCount = transactions.length + (vaultData ? vaultData.depositCount || 0 : 0);
  var avgRoundUp = txCount > 0 ? totalSaved / txCount : 0;
  var projectedMonthly = avgRoundUp * 30 * 12;
  var walletAddress = publicKey ? publicKey.toString().slice(0, 4) + "..." + publicKey.toString().slice(-3) : "";

  return {
    connected: connected, publicKey: publicKey, walletAddress: walletAddress, solBalance: solBalance,
    roundUpAmount: roundUpAmount, setRoundUpAmount: setRoundUpAmount, strategy: strategy, setStrategy: setStrategy,
    isActive: isActive, isMonitoring: monitor.isMonitoring, activate: activate, deactivate: deactivate, loading: loading, error: error,
    totalSaved: totalSaved, transactions: transactions, txCount: txCount, avgRoundUp: avgRoundUp, projectedMonthly: projectedMonthly, vaultData: vaultData,
    withdrawFunds: withdrawFunds, handleRoundUp: handleRoundUp
  };
}
