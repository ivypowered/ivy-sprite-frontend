// app/deposit/page.tsx
"use client";

import { WalletProvider } from "@/components/WalletProvider";
import { Payment } from "@/components/Payment";
import { useSearchParams } from "next/navigation";

function DepositPage() {
    const searchParams = useSearchParams();

    const name = searchParams.get("name") || "";
    const userId = searchParams.get("user_id") || "";
    const depositId = searchParams.get("deposit_id") || "";

    return (
        <Payment
            type="deposit"
            name={name}
            userId={userId}
            paymentId={depositId}
        />
    );
}

export default function Page() {
    return (
        <WalletProvider>
            <DepositPage />
        </WalletProvider>
    );
}
