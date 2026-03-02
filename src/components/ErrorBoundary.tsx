import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100 max-w-md w-full">
                        <h2 className="text-red-600 font-semibold mb-2">Algo deu errado</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            {this.state.error?.message || "Ocorreu um erro inesperado."}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                            Recarregar página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
