import { useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import idl from "../idl/chainge_contract.json";

const PROGRAM_ID = new PublicKey("8ZwBUokcMFPVtjSXrCxhXNgqgshn4PNpE9Q3grtH61mq");

// Strategy enum mapping
const STRATEGY_MAP = {
  stake: { liquidStake: {} },
  lp: { lpYield: {} },
  dca: { dca: {} },
  save: { vault: {} },
};

// Convert lamports to SOL
const lamportsToSol = (lamports) => lamports / 1_000_000_000;
const solToLamports = (sol) => Math.round(sol * 1_000_000_000);

export function useVaultProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet?.publicKey) return null;
    return new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(idl, provider);
  }, [provider]);

  // Derive PDA addresses for a given owner
  const getVaultPDA = (owner) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), owner.toBuffer()],
      PROGRAM_ID
    )[0];
  };

  const getVaultSolPDA = (owner) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault_sol"), owner.toBuffer()],
      PROGRAM_ID
    )[0];
  };

  // Initialize a new vault
  const initializeVault = async (roundUpSol, strategyId) => {
    if (!program || !wallet.publicKey) throw new Error("Not connected");

    const vaultPDA = getVaultPDA(wallet.publicKey);
    const vaultSolPDA = getVaultSolPDA(wallet.publicKey);
    const roundUpLamports = solToLamports(roundUpSol);
    const strategy = STRATEGY_MAP[strategyId];

    const tx = await program.methods
      .initializeVault(new BN(roundUpLamports), strategy)
      .accounts({
        vault: vaultPDA,
        vaultSol: vaultSolPDA,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  // Deposit round-up into vault
  const deposit = async (amountSol) => {
    if (!program || !wallet.publicKey) throw new Error("Not connected");

    const vaultPDA = getVaultPDA(wallet.publicKey);
    const vaultSolPDA = getVaultSolPDA(wallet.publicKey);
    const lamports = solToLamports(amountSol);

    const tx = await program.methods
      .deposit(new BN(lamports))
      .accounts({
        vault: vaultPDA,
        vaultSol: vaultSolPDA,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  // Withdraw from vault
  const withdraw = async (amountSol) => {
    if (!program || !wallet.publicKey) throw new Error("Not connected");

    const vaultPDA = getVaultPDA(wallet.publicKey);
    const vaultSolPDA = getVaultSolPDA(wallet.publicKey);
    const lamports = solToLamports(amountSol);

    const tx = await program.methods
      .withdraw(new BN(lamports))
      .accounts({
        vault: vaultPDA,
        vaultSol: vaultSolPDA,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  // Update vault settings
  const updateSettings = async (roundUpSol, strategyId, isActive) => {
    if (!program || !wallet.publicKey) throw new Error("Not connected");

    const vaultPDA = getVaultPDA(wallet.publicKey);

    const tx = await program.methods
      .updateSettings(
        roundUpSol !== null ? new BN(solToLamports(roundUpSol)) : null,
        strategyId !== null ? STRATEGY_MAP[strategyId] : null,
        isActive
      )
      .accounts({
        vault: vaultPDA,
        owner: wallet.publicKey,
      })
      .rpc();

    return tx;
  };

  // Fetch vault data
  const fetchVault = async () => {
    if (!program || !wallet.publicKey) return null;

    try {
      const vaultPDA = getVaultPDA(wallet.publicKey);
      const vaultSolPDA = getVaultSolPDA(wallet.publicKey);
      const vaultData = await program.account.vault.fetch(vaultPDA);
      const vaultSolBalance = await connection.getBalance(vaultSolPDA);

      // Map strategy back to our ID
      let strategyId = "save";
      if (vaultData.strategy.liquidStake) strategyId = "stake";
      else if (vaultData.strategy.lpYield) strategyId = "lp";
      else if (vaultData.strategy.dca) strategyId = "dca";

      return {
        owner: vaultData.owner.toString(),
        roundUpAmount: lamportsToSol(vaultData.roundUpAmount.toNumber()),
        strategy: strategyId,
        totalDeposited: lamportsToSol(vaultData.totalDeposited.toNumber()),
        totalWithdrawn: lamportsToSol(vaultData.totalWithdrawn.toNumber()),
        depositCount: vaultData.depositCount.toNumber(),
        createdAt: vaultData.createdAt.toNumber(),
        lastDepositAt: vaultData.lastDepositAt.toNumber(),
        isActive: vaultData.isActive,
        vaultBalance: lamportsToSol(vaultSolBalance),
      };
    } catch (e) {
      // Vault doesn't exist yet
      return null;
    }
  };

  return {
    program,
    initializeVault,
    deposit,
    withdraw,
    updateSettings,
    fetchVault,
    getVaultPDA,
    getVaultSolPDA,
  };
}
