export default function NotFound() {
    return (
        <div className="h-screen flex items-center justify-center flex-col gap-4 bg-slate-50 dark:bg-slate-950">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100" style={{ fontFamily: "Outfit, sans-serif" }}>
                404
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Página não encontrada</p>
            <a
                href="/"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
                Voltar ao início
            </a>
        </div>
    );
}
