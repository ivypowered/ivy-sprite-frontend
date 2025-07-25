// app/withdraw-complete/page.tsx
"use client";

import { PaymentComplete } from "@/components/PaymentComplete";
import { useSearchParams } from "next/navigation";

export default function WithdrawCompletePage() {
    const searchParams = useSearchParams();

    const status = searchParams.get("status") || "error";
    const signature = searchParams.get("signature") || "";
    const withdrawId = searchParams.get("withdraw_id") || "";
    const userName = searchParams.get("name") || "";
    const userId = searchParams.get("user_id") || "";
    const error = searchParams.get("error") || "";

    return (
        <PaymentComplete
            type="withdraw"
            status={status}
            signature={signature}
            paymentId={withdrawId}
            userName={userName}
            userId={userId}
            error={error}
        />
    );
}
