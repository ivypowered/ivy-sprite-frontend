// app/withdraw/page.tsx
"use client";

import { Payment } from "@/components/Payment";
import { useSearchParams } from "next/navigation";

export default function Page() {
    const searchParams = useSearchParams();

    const name = searchParams.get("name") || "";
    const userId = searchParams.get("user_id") || "";
    const withdrawId = searchParams.get("withdraw_id") || "";
    const authority = searchParams.get("authority") || "";
    const signature = searchParams.get("signature") || "";

    return (
        <Payment
            type="withdraw"
            name={name}
            userId={userId}
            paymentId={withdrawId}
            authority={authority}
            signature={signature}
        />
    );
}
