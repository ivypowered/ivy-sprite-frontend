// app/deposit-complete/page.tsx
"use client";

import { PaymentComplete } from "@/components/PaymentComplete";
import { useSearchParams } from "next/navigation";

export default function DepositCompletePage() {
    const searchParams = useSearchParams();

    const status = searchParams.get("status") || "error";
    const signature = searchParams.get("signature") || "";
    const depositId = searchParams.get("deposit_id") || "";
    const userName = searchParams.get("name") || "";
    const userId = searchParams.get("user_id") || "";
    const error = searchParams.get("error") || "";

    return (
        <PaymentComplete
            type="deposit"
            status={status}
            signature={signature}
            paymentId={depositId}
            userName={userName}
            userId={userId}
            error={error}
        />
    );
}
