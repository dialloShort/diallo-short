import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Diallo Short",
    description: "Générateur de shorts vidéo IA",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr">
            <body className="min-h-screen bg-[#0c0c0e] text-[#f0eee8]">
                {children}
            </body>
        </html>
    );
}
