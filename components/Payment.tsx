// components/Payment.tsx
"use client";

import { Api } from "@/lib/api";
import { Vault } from "ivy-sdk";
import {
    useUnifiedWallet,
    useUnifiedWalletContext,
} from "@jup-ag/wallet-adapter";
import { ComputeBudgetProgram, Transaction } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { SPRITE_VAULT } from "@/lib/constants";
import { idExtractAmount } from "@/lib/util";

type PaymentType = "deposit" | "withdraw";

interface PaymentProps {
    type: PaymentType;
    name: string;
    userId: string;
    paymentId: string;
    signature?: string; // Only for withdrawals
}

export function Payment({
    type,
    name,
    userId,
    paymentId,
    signature,
}: PaymentProps) {
    const { publicKey, signTransaction } = useUnifiedWallet();
    const { setShowModal } = useUnifiedWalletContext();
    const router = useRouter();

    const [state, setState] = useState<
        "idle" | "retrieving" | "signing" | "sending" | "confirming"
    >("idle");

    const isDeposit = type === "deposit";
    const titleText = isDeposit ? "Confirm Deposit" : "Confirm Withdrawal";
    const amountLabel = isDeposit ? "Deposit Amount" : "Withdrawal Amount";
    const idLabel = isDeposit ? "Deposit ID" : "Withdrawal ID";
    const idFieldName = isDeposit ? "deposit_id" : "withdraw_id";

    const buttonText = useMemo(() => {
        switch (state) {
            case "idle":
                return !publicKey
                    ? "Connect Wallet"
                    : isDeposit
                      ? "Submit Deposit"
                      : "Confirm Withdrawal";
            case "retrieving":
                return "Retrieving...";
            case "signing":
                return "Signing...";
            case "sending":
                return "Sending...";
            case "confirming":
                return "Confirming...";
            default:
                return "Unknown";
        }
    }, [publicKey, state, isDeposit]);

    const buttonDisabled = state !== "idle";

    const onButtonClick = useCallback(async () => {
        if (!publicKey) {
            setShowModal(true);
            return;
        }

        try {
            setState("retrieving");

            if (!isDeposit && !signature) {
                throw new Error("signature required for withdrawal");
            }

            // Get the appropriate instruction based on type
            const ins = isDeposit
                ? await Vault.deposit(SPRITE_VAULT, publicKey, paymentId)
                : await Vault.withdraw(
                      SPRITE_VAULT,
                      publicKey,
                      paymentId,
                      signature || "",
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
            setState("signing");
            if (!signTransaction) {
                throw new Error("can't find signTransaction");
            }
            const txSigned = await signTransaction(tx);
            setState("sending");
            const txSignature = await Api.sendTransaction(txSigned);
            setState("confirming");
            await Api.confirmTransaction(txSignature, ctx.lastValidBlockHeight);

            // Redirect to success page
            const params = new URLSearchParams({
                status: "success",
                signature: txSignature,
                [idFieldName]: paymentId,
                user_id: userId,
                name: name,
            });
            router.push(`/${type}-complete?${params.toString()}`);
        } catch (error) {
            // Redirect to error page
            const params = new URLSearchParams({
                status: "error",
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
                [idFieldName]: paymentId,
                user_id: userId,
                name: name,
            });
            router.push(`/${type}-complete?${params.toString()}`);
        }
    }, [
        publicKey,
        setShowModal,
        signTransaction,
        paymentId,
        signature,
        userId,
        name,
        router,
        isDeposit,
        type,
        idFieldName,
    ]);

    // Parse amount from payment_id (last 8 bytes as u64le)
    const amount = idExtractAmount(paymentId);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-mono">
            <main className="container mx-auto px-4 py-16 max-w-2xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h1 className="text-4xl font-bold text-sky-400">
                            ivy-sprite
                        </h1>
                    </div>
                    <p className="text-slate-400">The Discord bot for Ivy</p>
                </div>

                {/* Main Card */}
                <div className="border-2 border-sky-500 bg-slate-900">
                    {/* Title Bar */}
                    <div className="border-b-2 border-sky-500 bg-sky-500/10 px-6 py-4 flex items-center gap-2">
                        <h2 className="text-xl font-bold text-sky-400">
                            {titleText}
                        </h2>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Discord User Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1">
                                    <span className="text-sky-400">▸</span>{" "}
                                    Discord User
                                </label>
                                <div className="mt-1 bg-slate-950 border border-slate-800 px-4 py-3">
                                    <span className="text-sky-400">
                                        {name || "Unknown User"}
                                    </span>
                                    <span className="text-slate-500 text-sm ml-2">
                                        ({userId || "000000000000000000"})
                                    </span>
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1">
                                    <span className="text-sky-400">▸</span>{" "}
                                    {amountLabel}
                                </label>
                                <div className="mt-1 bg-slate-950 border border-slate-800 px-4 py-3  flex items-baseline justify-between">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl font-bold text-sky-400">
                                            {amount.toFixed(2)}
                                        </span>
                                        <span className="text-2xl text-slate-400">
                                            IVY
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment ID */}
                            <div>
                                <label className="text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1">
                                    <span className="text-sky-400">▸</span>{" "}
                                    {idLabel}
                                </label>
                                <div className="mt-1 bg-slate-950 border border-slate-800 px-4 py-3  break-all text-sm text-slate-400 font-mono">
                                    {paymentId || `No ${type} ID provided`}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <button
                            onClick={onButtonClick}
                            disabled={buttonDisabled}
                            className="cursor-pointer disabled:cursor-default w-full bg-sky-500 disabled:bg-sky-700 text-slate-950 py-3 px-6 font-bold uppercase tracking-wider  shadow-md"
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center text-sm text-slate-500">
                    Need help? Ping us on{" "}
                    <a
                        href="https://discord.gg/mrVwB4wHmw"
                        className="text-sky-400/70"
                    >
                        the Ivy discord
                    </a>
                </div>
            </main>
        </div>
    );
}
