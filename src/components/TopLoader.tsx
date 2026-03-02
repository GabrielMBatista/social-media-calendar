"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopLoader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Disparado no início da montagem global, mas as transições da página ditarão
        setProgress(30);

        const timer1 = setTimeout(() => setProgress(70), 300);
        const timer2 = setTimeout(() => setProgress(100), 600);
        const timer3 = setTimeout(() => setProgress(0), 1000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [pathname, searchParams]);

    if (progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[9999] pointer-events-none">
            <div
                className="h-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
