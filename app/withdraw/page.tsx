// app/withdraw/page.tsx
"use client";

import { WalletProvider } from "@/components/WalletProvider";
import { Payment } from "@/components/Payment";
import { useSearchParams } from "next/navigation";

function WithdrawPage() {
    const searchParams = useSearchParams();

    const name = searchParams.get("name") || "";
    const userId = searchParams.get("user_id") || "";
    const withdrawId = searchParams.get("withdraw_id") || "";
    const signature = searchParams.get("signature") || "";

    return (
        <Payment
            type="withdraw"
            name={name}
            userId={userId}
            paymentId={withdrawId}
            signature={signature}
        />
    );
}

export default function Page() {
    return (
        <WalletProvider>
            <WithdrawPage />
        </WalletProvider>
    );
}
