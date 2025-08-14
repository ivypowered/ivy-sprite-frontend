import { Transaction, VersionedTransaction } from "@solana/web3.js";

const API_BASE = "https://ivypowered.com/api";

// --- Interfaces ---

interface SendTransactionResponse {
    signature: string;
}

export interface Context {
    blockhash: string;
    lastValidBlockHeight: number;
    reasonablePriorityFee: number;
}

type ApiResponse<T> =
    | { status: "ok"; data: T }
    | { status: "err"; msg: string };

// --- API Class ---
export class Api {
    /** Generic helper to make API requests and handle standard response format */
    private static async fetchApi<T>(
        endpoint: string,
        options?: RequestInit,
    ): Promise<T> {
        const response = await fetch(API_BASE + endpoint, options);

        const r: ApiResponse<T> = await response.json();

        if (r.status === "err") {
            throw new Error(r.msg || "Unknown API error");
        }

        return r.data;
    }

    /** Sends a signed transaction */
    static async sendTransaction(
        tx: Transaction | VersionedTransaction,
    ): Promise<string> {
        let txData: Buffer;
        if (tx instanceof Transaction) {
            txData = tx.serialize();
        } else {
            txData = Buffer.from(tx.serialize());
        }
        return (
            await Api.fetchApi<SendTransactionResponse>("/tx/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tx_base64: txData.toString("base64"),
                }),
            })
        ).signature;
    }

    /** Confirms a transaction */
    static async confirmTransaction(
        signature: string,
        lastValidBlockHeight: number,
    ): Promise<void> {
        Api.fetchApi<unknown>(
            `/tx/confirm/${signature}?lastValidBlockHeight=${lastValidBlockHeight}`,
        );
    }

    /** Gets the latest blockhash and last valid block height */
    static async getContext(insName: string): Promise<Context> {
        return Api.fetchApi<Context>("/ctx/" + insName, {
            method: "GET",
        });
    }
}
