"use client";

import React, { useMemo, ReactNode } from "react";
import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    CoinbaseWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { ConnectionProvider } from "@solana/wallet-adapter-react";

// Wallet provider props
interface WalletProviderProps {
    children: ReactNode;
    endpoint?: string;
    autoConnect?: boolean;
}

// Wallet provider component
export function WalletProvider({
    children,
    endpoint = "https://api.mainnet-beta.solana.com",
    autoConnect = true,
}: WalletProviderProps) {
    const wallets = useMemo(
        () => [
            new CoinbaseWalletAdapter(),
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        [],
    );

    return (
        <ConnectionProvider
            endpoint={endpoint}
            config={{ commitment: "confirmed" }}
        >
            <style>
                {`
                dialog {
                    margin: 0;
                    min-height: 100%;
                    min-width: 100%;
                }
                a[href="https://station.jup.ag/partners?category=Wallets"] {
                    display: none;
                }
                `}
            </style>
            <UnifiedWalletProvider
                wallets={wallets}
                config={{
                    autoConnect,
                    env: "mainnet-beta",
                    metadata: {
                        name: "",
                        description: "",
                        url: "",
                        iconUrls: [],
                    },
                    theme: "dark",
                }}
            >
                {children}
            </UnifiedWalletProvider>
        </ConnectionProvider>
    );
}
