import { useState, useRef, useCallback } from "react";
import { calculateRoundUp } from "../utils/roundup";

var POLL_INTERVAL = 10000;
var COOLDOWN_MS = 15000;
var PROGRAM_ID = "8ZwBUokcMFPVtjSXrCxhXNgqgshn4PNpE9Q3grtH61mq";

export function useTransactionMonitor(walletAddress, roundUpAmount, onRoundUp) {
  var _m = useState(false);
  var isMonitoring = _m[0], setIsMonitoring = _m[1];
  var intervalRef = useRef(null);
  var lastSigRef = useRef(null);
  var lastFireRef = useRef(0);
  var connectionRef = useRef(null);
  var publicKeyRef = useRef(null);

  var checkTransactions = useCallback(function() {
    var connection = connectionRef.current;
    var pubkey = publicKeyRef.current;
    if (!connection || !pubkey || !walletAddress) return;
    var opts = { limit: 5 };
    if (lastSigRef.current) { opts.until = lastSigRef.current; }

    connection.getSignaturesForAddress(pubkey, opts).then(function(sigs) {
      if (!sigs || sigs.length === 0) return;
      if (!lastSigRef.current) { lastSigRef.current = sigs[0].signature; return; }
      lastSigRef.current = sigs[0].signature;

      sigs.forEach(function(sigInfo) {
        if (sigInfo.err) return;
        var now = Date.now();
        if (now - lastFireRef.current < COOLDOWN_MS) return;

        connection.getParsedTransaction(sigInfo.signature, { maxSupportedTransactionVersion: 0 }).then(function(tx) {
          if (!tx || !tx.meta) return;
          var logs = tx.meta.logMessages || [];
          var isChaingeTx = logs.some(function(log) { return log.indexOf(PROGRAM_ID) !== -1; });
          if (isChaingeTx) return;

          var preBalances = tx.meta.preBalances || [];
          var postBalances = tx.meta.postBalances || [];
          var accountKeys = tx.transaction.message.accountKeys || [];
          var walletIndex = -1;
          for (var i = 0; i < accountKeys.length; i++) {
            var key = accountKeys[i].pubkey ? accountKeys[i].pubkey.toString() : accountKeys[i].toString();
            if (key === walletAddress) { walletIndex = i; break; }
          }
          if (walletIndex === -1) return;

          var preBal = preBalances[walletIndex] / 1000000000;
          var postBal = postBalances[walletIndex] / 1000000000;
          var spent = preBal - postBal;
          if (spent <= 0.000005) return;

          var roundUp = calculateRoundUp(spent, roundUpAmount);
          if (roundUp <= 0 || roundUp >= roundUpAmount) return;

          var nowCheck = Date.now();
          if (nowCheck - lastFireRef.current < COOLDOWN_MS) return;
          lastFireRef.current = nowCheck;

          onRoundUp({
            id: sigInfo.signature.slice(0, 8) + Date.now(),
            signature: sigInfo.signature,
            amount: spent,
            roundUp: roundUp,
            type: "swap",
            detail: spent.toFixed(3) + " SOL spent",
            time: "just now",
          });
        }).catch(function(err) { console.error("[Monitor] Parse error:", err); });
      });
    }).catch(function(err) { console.error("[Monitor] Fetch error:", err); });
  }, [walletAddress, roundUpAmount, onRoundUp]);

  var startPolling = useCallback(function(connection, publicKey) {
    if (intervalRef.current) return;
    connectionRef.current = connection;
    publicKeyRef.current = publicKey;
    lastSigRef.current = null;
    lastFireRef.current = 0;
    setIsMonitoring(true);
    connection.getSignaturesForAddress(publicKey, { limit: 1 }).then(function(sigs) {
      if (sigs && sigs.length > 0) { lastSigRef.current = sigs[0].signature; }
    }).then(function() {
      intervalRef.current = setInterval(checkTransactions, POLL_INTERVAL);
    });
  }, [checkTransactions]);

  var stopPolling = useCallback(function() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setIsMonitoring(false);
  }, []);

  return { isMonitoring: isMonitoring, startPolling: startPolling, stopPolling: stopPolling };
}
