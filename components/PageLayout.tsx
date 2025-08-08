"use client";

import { Header } from "./Header";
import { Footer } from "./Footer";
import { ReactNode } from "react";
import { WProvider } from "./WProvider";
import { WModal } from "./WModal";

interface PageLayoutProps {
    children: ReactNode;
    hideHeader?: boolean;
    hideFooter?: boolean;
}

export function PageLayout({
    children,
    hideHeader = false,
    hideFooter = false,
}: PageLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-mono">
            <main className="container mx-auto px-4 py-16 max-w-2xl">
                <WProvider autoConnect={true}>
                    <WModal accentColor={"sky"} logoSrc={"/ivy-sprite.svg"} />
                    {!hideHeader && <Header />}
                    {children}
                    {!hideFooter && <Footer />}
                </WProvider>
            </main>
        </div>
    );
}
