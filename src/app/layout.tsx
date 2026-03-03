import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryProvider } from "@/contexts/QueryProvider";
import { TopLoader } from "@/components/TopLoader";
import { Suspense } from "react";
import "react-day-picker/dist/style.css";
import "@/index.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
    display: "swap",
});

export const metadata: Metadata = {
    title: "SM Calendar — Social Media Pro",
    description: "Calendário de gestão de conteúdo para agências de social media",
};

export default function RootLayout({
    children,
    modal,
}: {
    children: React.ReactNode;
    modal: React.ReactNode;
}) {
    return (
        <html lang="pt-BR" suppressHydrationWarning className="antialiased">
            <body className={`${inter.variable} ${outfit.variable}`}>
                <QueryProvider>
                    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
                        <TooltipProvider>
                            <Suspense fallback={null}>
                                <TopLoader />
                            </Suspense>
                            <Toaster richColors position="top-right" />
                            {children}
                            {modal}
                        </TooltipProvider>
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
