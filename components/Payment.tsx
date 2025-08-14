// components/Payment.tsx
"use client";

import { Api } from "@/lib/api";
import { Vault } from "ivy-sdk";
import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { SPRITE_VAULT } from "@/lib/constants";
import { idExtractAmount } from "@/lib/util";
import { PageLayout } from "./PageLayout";
import { useWContext } from "./WProvider";

type PaymentType = "deposit" | "withdraw";

interface PaymentProps {
    type: PaymentType;
    name: string;
    userId: string;
    paymentId: string;
    authority?: string; // Only for withdrawals
    signature?: string; // Only for withdrawals
}

function PaymentComponent({
    type,
    name,
    userId,
    paymentId,
    authority,
    signature,
}: PaymentProps) {
    const { publicKey, signTransaction, openModal } = useWContext();
    const router = useRouter();

    const [state, setState] = useState<
        "idle" | "retrieving" | "signing" | "sending" | "confirming"
    >("idle");

    const isDeposit = type === "deposit";
    const titleText = isDeposit ? "Confirm Deposit" : "Confirm Withdrawal";
    const amountLabel = isDeposit ? "Deposit Amount" : "Withdrawal Amount";
    const idLabel = isDeposit ? "Deposit ID" : "Withdrawal ID";
    const idFieldName = isDeposit ? "deposit_id" : "withdraw_id";
    const isDiscord = !userId.startsWith("tg:");

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
            openModal();
            return;
        }

        try {
            setState("retrieving");

            if (!isDeposit && !signature) {
                throw new Error("signature required for withdrawal");
            }

            if (!isDeposit && !authority) {
                throw new Error("authority required for withdrawal");
            }

            // Get the appropriate instruction based on type
            const ins = isDeposit
                ? [await Vault.deposit(SPRITE_VAULT, publicKey, paymentId)]
                : await Vault.withdraw(
                      SPRITE_VAULT,
                      publicKey,
                      paymentId,
                      new PublicKey(authority || ""),
                      signature || "",
                  );

            const ctx = await Api.getContext(
                isDeposit ? "VaultDeposit" : "VaultWithdraw",
            );
            const tx = new Transaction();
            tx.add(
                ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: ctx.reasonablePriorityFee,
                }),
                ...ins,
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
            console.error(error);
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
        openModal,
        signTransaction,
        paymentId,
        signature,
        userId,
        name,
        router,
        isDeposit,
        type,
        idFieldName,
        authority,
    ]);

    // Parse amount from payment_id (last 8 bytes as u64le)
    const amount = idExtractAmount(paymentId);

    return (
        <>
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
                    {/* User Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1">
                                <span className="text-sky-400">▸</span>{" "}
                                {isDiscord ? "Discord" : "Telegram"} User
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
                                        {amount.toString()}
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
        </>
    );
}

export function Payment(p: PaymentProps) {
    return (
        <PageLayout>
            <PaymentComponent {...p} />
        </PageLayout>
    );
}
