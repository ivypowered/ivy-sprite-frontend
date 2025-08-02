import { Metadata } from "next";

export const metadata: Metadata = {
    title: "ivy-sprite | deposit results",
    description: "View the results of your deposit to the ivy-sprite bot",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return children;
}
