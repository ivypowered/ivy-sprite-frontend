// components/PaymentComplete.tsx
"use client";

import { idExtractAmount } from "@/lib/util";
import { useRouter } from "next/navigation";
import { PageLayout } from "./PageLayout";

type PaymentType = "deposit" | "withdraw";

interface PaymentCompleteProps {
    type: PaymentType;
    status: string;
    signature: string;
    paymentId: string;
    userName: string;
    userId: string;
    error: string;
}

export function PaymentComplete({
    type,
    status,
    signature,
    paymentId,
    userName,
    userId,
    error,
}: PaymentCompleteProps) {
    const isSuccess = status === "success";
    const isDeposit = type === "deposit";
    const router = useRouter();

    const titleSuccess = isDeposit
        ? "Deposit Successful"
        : "Withdrawal Successful";
    const titleError = isDeposit ? "Deposit Failed" : "Withdrawal Failed";
    const subtitleSuccess = isDeposit
        ? "Your deposit has been processed"
        : "Your withdrawal has been processed";
    const subtitleError = isDeposit
        ? "We couldn't complete your deposit"
        : "We couldn't complete your withdrawal";
    const idLabel = isDeposit ? "Deposit ID:" : "Withdrawal ID:";
    const errorDefault = isDeposit
        ? "Unknown error occurred during deposit processing"
        : "Unknown error occurred during withdrawal processing";
    const isDiscord = !userId.startsWith("tg:");

    // Parse amount from payment_id (last 8 bytes as u64le)
    const amount = idExtractAmount(paymentId);

    const explorerLink = signature
        ? `https://solscan.io/tx/${encodeURIComponent(signature)}`
        : null;

    return (
        <PageLayout>
            {/* Status Icon */}
            <div className="text-center mb-8">
                <div
                    className={`inline-flex items-center justify-center w-20 h-20 bg-sky-500/20 mb-4`}
                >
                    <svg
                        className={`w-12 h-12 text-sky-400`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {isSuccess ? (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        ) : (
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        )}
                    </svg>
                </div>
                <h2 className="text-3xl font-bold mb-2">
                    {isSuccess ? titleSuccess : titleError}
                </h2>
                <p className="text-xl text-slate-400">
                    {isSuccess ? subtitleSuccess : subtitleError}
                </p>
            </div>

            {/* Main Card */}
            <div className={`border-2 border-sky-500 bg-slate-900 mb-8`}>
                {/* Title Bar */}
                <div
                    className={`border-b-2 ${
                        isSuccess
                            ? "border-sky-500 bg-sky-500/10"
                            : "border-sky-800 bg-sky-900/10"
                    } px-6 py-4`}
                >
                    <h3 className={`text-xl font-bold text-sky-400`}>
                        {isSuccess ? "Transaction Details" : "Error Details"}
                    </h3>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {isSuccess ? (
                        <>
                            {/* User */}
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <span className="text-slate-400 text-sm uppercase tracking-wider">
                                    {isDiscord
                                        ? "Discord User:"
                                        : "Telegram User:"}
                                </span>
                                <div className="text-right">
                                    <span className="text-sky-400 font-bold">
                                        {userName || "Unknown User"}
                                    </span>
                                    <span className="text-slate-500 text-sm ml-2">
                                        ({userId})
                                    </span>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <span className="text-slate-400 text-sm uppercase tracking-wider">
                                    Status:
                                </span>
                                <span className="text-sky-400 font-bold">
                                    CONFIRMED
                                </span>
                            </div>

                            {/* Amount */}
                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                <span className="text-slate-400 text-sm uppercase tracking-wider">
                                    Amount:
                                </span>
                                <span className="font-bold text-sky-400">
                                    {amount.toString()} IVY
                                </span>
                            </div>

                            {/* Payment ID */}
                            <div className="border-b border-slate-800 pb-3">
                                <span className="text-slate-400 text-sm uppercase tracking-wider">
                                    {idLabel}
                                </span>
                                <div className="mt-1 font-mono text-xs text-slate-300 break-all">
                                    {paymentId}
                                </div>
                            </div>

                            {/* Signature */}
                            <span className="text-slate-400 text-sm uppercase tracking-wider">
                                Signature:
                            </span>
                            <div className="mt-1">
                                <div className="font-mono text-xs text-slate-300 break-all">
                                    {signature}
                                </div>
                                {explorerLink && (
                                    <a
                                        href={explorerLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sky-400 text-xs hover:underline inline-flex items-center gap-1 mt-1"
                                    >
                                        View on Explorer
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Error Message */}
                            <pre className="text-slate-300 whitespace-pre-wrap">
                                {error || errorDefault}
                            </pre>
                        </>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
                {!isSuccess ? (
                    <a
                        href={"#"}
                        onClick={() =>
                            router.push(
                                isDeposit
                                    ? `/deposit?deposit_id=${encodeURIComponent(paymentId)}&user_id=${encodeURIComponent(userId)}&name=${encodeURIComponent(userName)}`
                                    : `/withdraw?withdraw_id=${encodeURIComponent(paymentId)}&user_id=${encodeURIComponent(userId)}&name=${encodeURIComponent(userName)}&signature=${encodeURIComponent(signature)}`,
                            )
                        }
                        className="bg-sky-500 text-slate-950 py-3 px-6 font-bold uppercase tracking-wider shadow-md hover:bg-sky-400 transition-colors"
                    >
                        Try Again
                    </a>
                ) : (
                    <button
                        onClick={() => window.close()}
                        className="cursor-pointer border-2 border-sky-500 text-sky-400 py-3 px-6 font-bold uppercase tracking-wider hover:bg-sky-500/10 transition-colors"
                    >
                        Close Tab
                    </button>
                )}
            </div>
        </PageLayout>
    );
}
