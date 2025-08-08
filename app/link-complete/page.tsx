// app/link-complete/page.tsx
"use client";

import { PageLayout } from "@/components/PageLayout";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export default function LinkCompletePage() {
    const searchParams = useSearchParams();
    const [copied, setCopied] = useState(false);

    // Get params
    const walletParam = searchParams.get("wallet") || "";
    const signatureParam = searchParams.get("signature") || "";
    const timestampParam = searchParams.get("timestamp") || "";
    const accountId = searchParams.get("discord_id") || ""; // keeping param name for compatibility

    // Determine if this is Telegram or Discord
    const isTelegram = accountId.startsWith("tg:");
    const platform = isTelegram ? "Telegram" : "Discord";
    const commandPrefix = isTelegram ? "/" : "$";

    // Generate the base64 response
    const linkCommand = useMemo(() => {
        try {
            // Validate inputs
            const walletPubkey = new PublicKey(walletParam);
            const signatureBytes = bs58.decode(signatureParam);
            const timestampNum = BigInt(timestampParam);

            if (signatureBytes.length !== 64) {
                throw new Error("Invalid signature length");
            }

            // Create 104-byte array
            const response = new Uint8Array(104);

            // Copy wallet public key (32 bytes)
            response.set(walletPubkey.toBytes(), 0);

            // Copy signature (64 bytes)
            response.set(signatureBytes, 32);

            // Copy timestamp as little-endian uint64 (8 bytes)
            const timestampBytes = new ArrayBuffer(8);
            const view = new DataView(timestampBytes);
            view.setBigUint64(0, timestampNum, true); // true for little-endian
            response.set(new Uint8Array(timestampBytes), 96);

            // Encode to base64
            const base64Response = btoa(String.fromCharCode(...response));

            return `${commandPrefix}link complete ${base64Response}`;
        } catch (err) {
            console.error("Error generating link command:", err);
            return null;
        }
    }, [walletParam, signatureParam, timestampParam, commandPrefix]);

    const handleCopy = async () => {
        if (!linkCommand) return;

        try {
            await navigator.clipboard.writeText(linkCommand);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    if (!linkCommand) {
        return (
            <PageLayout>
                <div className="border-2 border-red-500 bg-slate-900">
                    <div className="border-b-2 border-red-500 bg-red-500/10 px-6 py-4">
                        <h2 className="text-xl font-bold text-red-400">
                            Error
                        </h2>
                    </div>
                    <div className="p-6">
                        <p className="text-slate-300">
                            Failed to generate linking command. Please try the
                            process again.
                        </p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            {/* Success Icon */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-sky-500/20 mb-4">
                    <svg
                        className="w-12 h-12 text-sky-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold mb-2 text-slate-100">
                    Signature Verified!
                </h2>
                <p className="text-xl text-slate-400">
                    Now complete the linking in {platform}
                </p>
            </div>

            {/* Main Card */}
            <div className="border-2 border-sky-500 bg-slate-900 mb-8">
                <div className="border-b-2 border-sky-500 bg-sky-500/10 px-6 py-4">
                    <h3 className="text-xl font-bold text-sky-400">
                        Final Step
                    </h3>
                </div>

                <div className="p-6 space-y-6">
                    {/* Details */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <span className="text-slate-400 text-sm uppercase tracking-wider">
                                {platform} User:
                            </span>
                            <span className="font-mono text-sm text-sky-400">
                                {accountId}
                            </span>
                        </div>
                        <div className="border-b border-slate-800 pb-3">
                            <span className="text-slate-400 text-sm uppercase tracking-wider">
                                Wallet:
                            </span>
                            <div className="mt-1 font-mono text-xs text-slate-300 break-all">
                                {walletParam}
                            </div>
                        </div>
                    </div>

                    {/* Command to Copy */}
                    <div>
                        <label className="text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1 mb-2">
                            <span className="text-sky-400">▸</span> Run this
                            command:
                        </label>
                        <div className="bg-slate-950 border border-slate-800 p-4 break-all">
                            <code className="text-sm text-sky-400 font-mono">
                                {linkCommand}
                            </code>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="mt-3 w-full bg-sky-500 text-slate-950 py-2 px-4 font-bold uppercase tracking-wider hover:bg-sky-400 transition-colors text-sm cursor-pointer"
                        >
                            {copied ? "Copied!" : "Copy"}
                        </button>
                    </div>

                    {/* Instructions */}
                    <div className="bg-slate-950 border border-slate-800 p-4">
                        <h3 className="text-sm font-bold text-sky-400 mb-2">
                            Next Steps:
                        </h3>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                            <li>Copy the command above</li>
                            <li>
                                Go back to your {platform}{" "}
                                {isTelegram ? "chat" : "DM"} with ivy-sprite
                            </li>
                            <li>Paste and send the command</li>
                            <li>Your wallet will be linked!</li>
                        </ol>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
