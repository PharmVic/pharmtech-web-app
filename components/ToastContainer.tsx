"use client";

import { useToastStore } from "@/lib/store/toastStore";
import { CheckCircle2, AlertCircle, Info, X, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto bg-white/95 backdrop-blur-md text-gray-900 shadow-2xl rounded-2xl p-4 border border-gray-100/80 flex items-start gap-3 transition-all duration-300 transform translate-y-0 animate-slide-up"
                    style={{
                        boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 20px 0 rgba(59, 130, 246, 0.1)"
                    }}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {toast.type === "success" && (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-green-500/20">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        )}
                        {toast.type === "error" && (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-500 to-rose-400 text-white flex items-center justify-center shadow-md shadow-red-500/20">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                        )}
                        {toast.type === "info" && (
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 pr-2">
                        <h4 className="text-sm font-bold text-gray-900 leading-snug">{toast.title}</h4>
                        {toast.description && (
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{toast.description}</p>
                        )}
                        {toast.type === "success" && (
                            <div className="mt-2">
                                <Link
                                    href="/cart"
                                    className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline gap-1"
                                >
                                    View Cart & Checkout &rarr;
                                </Link>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
