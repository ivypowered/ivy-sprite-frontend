// app/deposit/page.tsx
"use client";

import { Payment } from "@/components/Payment";
import { useSearchParams } from "next/navigation";

export default function Page() {
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
