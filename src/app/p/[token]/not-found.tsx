import Link from "next/link";
import { Link2Off, Home } from "lucide-react";

export default function NotFoundShareLink() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6 relative">
                    <Link2Off size={32} className="relative z-10" />
                    <div className="absolute inset-0 bg-red-400 opacity-20 blur-xl rounded-full"></div>
                </div>

                <h1 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">
                    Link Inválido ou Expirado
                </h1>

                <p className="text-slate-500 mb-8 leading-relaxed">
                    Este link de compartilhamento não existe mais no nosso sistema, ou o tempo limite para acesso espirou. Por favor, contate o responsável pelo material para gerar um novo acesso.
                </p>
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs font-medium text-slate-400">Powered by Social Media Calendar Studio</p>
            </div>
        </div>
    );
}
