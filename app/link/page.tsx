// app/link/page.tsx
"use client";

import { WalletProvider } from "@/components/WalletProvider";
import { PageLayout } from "@/components/PageLayout";
import {
    useUnifiedWallet,
    useUnifiedWalletContext,
} from "@jup-ag/wallet-adapter";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useState, useMemo, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

function LinkPage() {
    const { publicKey, signMessage } = useUnifiedWallet();
    const { setShowModal } = useUnifiedWalletContext();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [state, setState] = useState<"idle" | "signing">("idle");
    const [error, setError] = useState<string | null>(null);

    // Get params from URL
    const walletParam = searchParams.get("wallet") || "";
    const discordId = searchParams.get("id") || "";
    const timestamp = searchParams.get("timestamp") || "";

    // Validate wallet address
    const isValidWallet = useMemo(() => {
        try {
            new PublicKey(walletParam);
            return true;
        } catch {
            return false;
        }
    }, [walletParam]);

    // Check if connected wallet matches the requested wallet
    const walletMatches = publicKey?.toString() === walletParam;

    const buttonText = useMemo(() => {
        if (state === "signing") return "Signing...";
        if (!publicKey) return "Connect Wallet";
        if (!walletMatches) return "Wrong Wallet Connected";
        return "Sign Message";
    }, [publicKey, state, walletMatches]);

    const buttonDisabled =
        state === "signing" || (publicKey !== null && !walletMatches);

    // Auto-open wallet modal if params are valid but wallet not connected
    useEffect(() => {
        if (!publicKey && isValidWallet && discordId && timestamp) {
            setShowModal(true);
        }
    }, [publicKey, isValidWallet, discordId, timestamp, setShowModal]);

    const handleSign = useCallback(async () => {
        if (!publicKey) {
            setShowModal(true);
            return;
        }

        if (!walletMatches) {
            setError("Please connect the wallet: " + walletParam);
            return;
        }

        if (!signMessage) {
            setError("Wallet does not support message signing");
            return;
        }

        try {
            setState("signing");
            setError(null);

            // Construct the message
            const message = `Link wallet ${walletParam} to ivy-sprite user ${discordId} at ${timestamp}`;
            const messageBytes = new TextEncoder().encode(message);

            // Sign the message
            const signature = await signMessage(messageBytes);

            // Redirect to complete page with the signature
            const params = new URLSearchParams({
                wallet: walletParam,
                signature: bs58.encode(signature),
                timestamp: timestamp,
                discord_id: discordId,
            });
            router.push(`/link-complete?${params.toString()}`);
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error ? err.message : "Failed to sign message",
            );
            setState("idle");
        }
    }, [
        publicKey,
        walletMatches,
        walletParam,
        discordId,
        timestamp,
        signMessage,
        setShowModal,
        router,
    ]);

    // Validate params
    if (!isValidWallet || !discordId || !timestamp) {
        return (
            <PageLayout>
                <div className="border-2 border-red-500 bg-slate-900">
                    <div className="border-b-2 border-red-500 bg-red-500/10 px-6 py-4">
                        <h2 className="text-xl font-bold text-red-400">
                            Invalid Link
                        </h2>
                    </div>
                    <div className="p-6">
                        <p className="text-slate-300">
                            This link is invalid or has expired. Please generate
                            a new link using the{" "}
                            <code className="text-sky-400">$link</code> command
                            in Discord.
                        </p>
                    </div>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <div className="border-2 border-sky-500 bg-slate-900">
                <div className="border-b-2 border-sky-500 bg-sky-500/10 px-6 py-4">
                    <h2 className="text-xl font-bold text-sky-400">
                        Link Wallet to Discord
                    </h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Discord User */}
                    <div>
                        <label className="text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1">
                            <span className="text-sky-400">▸</span> Discord User
                            ID
                        </label>
                        <div className="mt-1 bg-slate-950 border border-slate-800 px-4 py-3 font-mono text-sm">
                            {discordId}
                        </div>
                    </div>

                    {/* Wallet to Link */}
                    <div>
                        <label className="text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1">
                            <span className="text-sky-400">▸</span> Wallet to
                            Link
                        </label>
                        <div className="mt-1 bg-slate-950 border border-slate-800 px-4 py-3 font-mono text-sm break-all">
                            {walletParam}
                        </div>
                    </div>

                    {/* Connected Wallet Status */}
                    {publicKey && (
                        <div>
                            <label className="text-xs uppercase text-slate-500 tracking-wider flex items-center gap-1">
                                <span className="text-sky-400">▸</span>{" "}
                                Connected Wallet
                            </label>
                            <div
                                className={`mt-1 bg-slate-950 border ${walletMatches ? "border-green-800" : "border-red-800"} px-4 py-3 font-mono text-sm break-all`}
                            >
                                <span
                                    className={
                                        walletMatches
                                            ? "text-green-400"
                                            : "text-red-400"
                                    }
                                >
                                    {publicKey.toString()}
                                </span>
                            </div>
                            {!walletMatches && (
                                <p className="mt-2 text-sm text-red-400">
                                    Wrong wallet connected. Please connect:{" "}
                                    {walletParam}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-950 border border-red-800 px-4 py-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Sign Button */}
                    <button
                        onClick={handleSign}
                        disabled={buttonDisabled}
                        className="cursor-pointer disabled:cursor-default w-full bg-sky-500 disabled:bg-sky-700 text-slate-950 py-3 px-6 font-bold uppercase tracking-wider shadow-md"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </PageLayout>
    );
}

export default function Page() {
    return (
        <WalletProvider>
            <LinkPage />
        </WalletProvider>
    );
}
