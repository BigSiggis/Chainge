import { useEffect, useRef, useCallback, useState } from "react";
import { calculateRoundUp } from "../utils/roundup";

/**
 * useTransactionMonitor
 *
 * Monitors a Solana wallet for outgoing transactions using Helius webhooks
 * or polling, and calculates round-ups for each transaction.
 *
 * In production, this would use Helius Enhanced Websockets:
 *   wss://mainnet.helius-rpc.com/?api-key=<KEY>
 *
 * For now, we support two modes:
 *   1. "webhook" — Listens for POST requests from a Helius webhook endpoint
 *   2. "poll" — Polls getSignaturesForAddress on an interval
 *
 * @param {string|null} walletAddress - The wallet public key to monitor
 * @param {number} roundUpAmount - The round-up increment
 * @param {function} onRoundUp - Callback when a round-up is detected
 */
export function useTransactionMonitor(walletAddress, roundUpAmount, onRoundUp) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastSignature, setLastSignature] = useState(null);
  const intervalRef = useRef(null);

  const processTransaction = useCallback(
    (tx) => {
      // Extract the SOL amount from the transaction
      // In production, parse tx.meta.preBalances/postBalances to get actual SOL spent
      const solAmount = tx.amount || 0;

      if (solAmount <= 0) return null;

      const roundUp = calculateRoundUp(solAmount, roundUpAmount);

      if (roundUp <= 0) return null;

      const roundUpEvent = {
        id: tx.signature || Date.now().toString(),
        signature: tx.signature,
        type: tx.type || "Swap",
        detail: tx.description || "Transaction",
        amount: solAmount,
        roundUp,
        time: "just now",
        timestamp: Date.now(),
      };

      onRoundUp?.(roundUpEvent);
      return roundUpEvent;
    },
    [roundUpAmount, onRoundUp]
  );

  const startPolling = useCallback(
    async (connection, publicKey) => {
      if (!connection || !publicKey) return;

      setIsMonitoring(true);

      // Poll every 10 seconds for new transactions
      intervalRef.current = setInterval(async () => {
        try {
          const signatures = await connection.getSignaturesForAddress(
            publicKey,
            {
              limit: 5,
              ...(lastSignature ? { until: lastSignature } : {}),
            }
          );

          if (signatures.length > 0) {
            setLastSignature(signatures[0].signature);

            for (const sig of signatures) {
              const txDetail = await connection.getParsedTransaction(
                sig.signature,
                { maxSupportedTransactionVersion: 0 }
              );

              if (txDetail) {
                // Calculate SOL change for the monitored wallet
                const accountIndex = txDetail.transaction.message.accountKeys.findIndex(
                  (key) => key.pubkey.toString() === publicKey.toString()
                );

                if (accountIndex >= 0) {
                  const preBal = txDetail.meta.preBalances[accountIndex];
                  const postBal = txDetail.meta.postBalances[accountIndex];
                  const solSpent = (preBal - postBal) / 1_000_000_000;

                  if (solSpent > 0.001) {
                    // Ignore dust/fees only
                    processTransaction({
                      signature: sig.signature,
                      amount: solSpent,
                      type: "Swap",
                      description: `${solSpent.toFixed(3)} SOL out`,
                    });
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("[Chainge] Polling error:", err);
        }
      }, 10_000);
    },
    [lastSignature, processTransaction]
  );

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return {
    isMonitoring,
    startPolling,
    stopPolling,
    processTransaction,
  };
}

/**
 * Helius Webhook Setup Helper
 *
 * To set up real-time monitoring via Helius webhooks:
 *
 * 1. Get a Helius API key at https://helius.dev
 * 2. Create a webhook:
 *
 *    POST https://api.helius.xyz/v0/webhooks?api-key=<KEY>
 *    {
 *      "webhookURL": "https://your-server.com/api/chainge/webhook",
 *      "transactionTypes": ["SWAP", "TRANSFER"],
 *      "accountAddresses": ["<WALLET_ADDRESS>"],
 *      "webhookType": "enhanced"
 *    }
 *
 * 3. Your server receives POST with transaction data
 * 4. Parse, calculate round-up, execute sweep
 *
 * Enhanced websockets (real-time, no server needed):
 *
 *    const ws = new WebSocket('wss://mainnet.helius-rpc.com/?api-key=<KEY>');
 *    ws.send(JSON.stringify({
 *      jsonrpc: '2.0',
 *      id: 1,
 *      method: 'accountSubscribe',
 *      params: ['<WALLET_ADDRESS>', { encoding: 'jsonParsed' }]
 *    }));
 */
