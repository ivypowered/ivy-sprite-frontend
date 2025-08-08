"use client";

import { WalletProvider } from "@/components/WalletProvider";
import { PageLayout } from "@/components/PageLayout";
import { Vault } from "ivy-sdk";
import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { Api } from "@/lib/api";
import { useWContext } from "@/components/WProvider";

function SetupPage() {
    const { publicKey, signTransaction, openModal } = useWContext();

    const [vaultAddress, setVaultAddress] = useState("");
    const [editOwner, setEditOwner] = useState("");
    const [editWithdraw, setEditWithdraw] = useState("");
    const [createdVault, setCreatedVault] = useState<string | null>(null);
    const [status, setStatus] = useState<null | string>(null);
    const [error, setError] = useState<null | string>(null);
    const [loading, setLoading] = useState<"create" | "edit" | null>(null);

    const buttonDisabled = loading !== null;

    const handleCreate = useCallback(async () => {
        setError(null);
        setStatus(null);
        setCreatedVault(null);
        if (!publicKey) {
            openModal();
            return;
        }
        setLoading("create");
        try {
            setStatus("Generating vault seed...");
            const seed = Vault.generateSeed();
            setStatus("Preparing transaction...");
            const ins = await Vault.create(seed, publicKey);

            // Derive the vault address to show to the user
            const vaultPubkey = Vault.deriveVault(seed);

            const ctx = await Api.getContext();
            const tx = new Transaction();
            tx.add(
                ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: ctx.reasonablePriorityFee,
                }),
                ins,
            );
            tx.feePayer = publicKey;
            tx.recentBlockhash = ctx.blockhash;
            tx.lastValidBlockHeight = ctx.lastValidBlockHeight;
            setStatus("Signing...");
            if (!signTransaction) throw new Error("No signTransaction");
            const txSigned = await signTransaction(tx);
            setStatus("Sending...");
            const sig = await Api.sendTransaction(txSigned);
            setStatus("Confirming...");
            await Api.confirmTransaction(sig, ctx.lastValidBlockHeight);
            setCreatedVault(vaultPubkey.toString());
            setStatus(`Vault created! Address: ${vaultPubkey.toString()}`);
        } catch (e: unknown) {
            setError(String(e));
        }
        setLoading(null);
    }, [publicKey, openModal, signTransaction]);

    const handleEdit = useCallback(async () => {
        setError(null);
        setStatus(null);
        if (!publicKey) {
            openModal();
            return;
        }
        let vault: PublicKey, newOwner: PublicKey, newWithdraw: PublicKey;
        try {
            vault = new PublicKey(vaultAddress);
            newOwner = new PublicKey(editOwner);
            newWithdraw = new PublicKey(editWithdraw);
        } catch {
            setError("Invalid public key(s)");
            return;
        }
        setLoading("edit");
        try {
            setStatus("Preparing transaction...");
            const ins = await Vault.edit(
                vault,
                publicKey,
                newOwner,
                newWithdraw,
            );
            const ctx = await Api.getContext();
            const tx = new Transaction();
            tx.add(
                ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: ctx.reasonablePriorityFee,
                }),
                ins,
            );
            tx.feePayer = publicKey;
            tx.recentBlockhash = ctx.blockhash;
            tx.lastValidBlockHeight = ctx.lastValidBlockHeight;
            setStatus("Signing...");
            if (!signTransaction) throw new Error("No signTransaction");
            const txSigned = await signTransaction(tx);
            setStatus("Sending...");
            const sig = await Api.sendTransaction(txSigned);
            setStatus("Confirming...");
            await Api.confirmTransaction(sig, ctx.lastValidBlockHeight);
            setStatus("Vault edited! Signature: " + sig);
        } catch (e: unknown) {
            setError(String(e));
        }
        setLoading(null);
    }, [
        publicKey,
        openModal,
        signTransaction,
        vaultAddress,
        editOwner,
        editWithdraw,
    ]);

    return (
        <PageLayout hideFooter>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-sky-400 mb-2">
                    ivy-vault setup
                </h1>
            </div>

            <div className="border-2 border-sky-500 bg-slate-900 mb-8">
                <div className="border-b-2 border-sky-500 bg-sky-500/10 px-6 py-4">
                    <h2 className="text-xl font-bold text-sky-400">
                        Create Vault
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <button
                        onClick={handleCreate}
                        disabled={buttonDisabled}
                        className="w-full bg-sky-500 text-slate-950 py-3 px-6 font-bold uppercase tracking-wider cursor-pointer disabled:cursor-default"
                    >
                        {loading === "create"
                            ? "Processing..."
                            : "Create Vault"}
                    </button>
                    {createdVault && (
                        <div className="mt-4 p-4 bg-slate-950 border border-sky-500">
                            <p className="text-xs uppercase text-slate-500 mb-1">
                                Vault Address:
                            </p>
                            <p className="text-sky-400 break-all font-mono text-sm">
                                {createdVault}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                                Save this address to manage your vault
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-2 border-sky-500 bg-slate-900">
                <div className="border-b-2 border-sky-500 bg-sky-500/10 px-6 py-4">
                    <h2 className="text-xl font-bold text-sky-400">
                        Edit Vault
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs uppercase text-slate-500 mb-1">
                            Vault Address
                        </label>
                        <input
                            type="text"
                            className="w-full bg-slate-950 border border-slate-800 px-4 py-2 text-slate-100"
                            value={vaultAddress}
                            onChange={(e) => setVaultAddress(e.target.value)}
                            placeholder="Enter vault address to edit"
                            disabled={buttonDisabled}
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-slate-500 mb-1">
                            New Owner (Pubkey)
                        </label>
                        <input
                            type="text"
                            className="w-full bg-slate-950 border border-slate-800 px-4 py-2 text-slate-100"
                            value={editOwner}
                            onChange={(e) => setEditOwner(e.target.value)}
                            placeholder="Enter new owner public key"
                            disabled={buttonDisabled}
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase text-slate-500 mb-1">
                            New Withdraw Authority (Pubkey)
                        </label>
                        <input
                            type="text"
                            className="w-full bg-slate-950 border border-slate-800 px-4 py-2 text-slate-100"
                            value={editWithdraw}
                            onChange={(e) => setEditWithdraw(e.target.value)}
                            placeholder="Enter new withdraw authority public key"
                            disabled={buttonDisabled}
                        />
                    </div>
                    <button
                        onClick={handleEdit}
                        disabled={buttonDisabled}
                        className="w-full bg-sky-500 text-slate-950 py-3 px-6 font-bold uppercase tracking-wider cursor-pointer disabled:cursor-default"
                    >
                        {loading === "edit" ? "Processing..." : "Edit Vault"}
                    </button>
                </div>
            </div>

            {(status || error) && (
                <div className="mt-8 text-center">
                    {status && (
                        <div className="text-sky-400 font-bold mb-2">
                            {status}
                        </div>
                    )}
                    {error && (
                        <div className="text-red-400 font-bold">{error}</div>
                    )}
                </div>
            )}
        </PageLayout>
    );
}

export default function Page() {
    return (
        <WalletProvider>
            <SetupPage />
        </WalletProvider>
    );
}
