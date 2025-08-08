import React from "react";
import { WProvider } from "./WProvider";
import { WModal } from "./WModal";

export function WalletProvider({ children }: { children: React.ReactNode }) {
    return (
        <WProvider autoConnect={true}>
            <WModal accentColor={"sky"} logoSrc={"/ivy-sprite.svg"} />
            {children}
        </WProvider>
    );
}
