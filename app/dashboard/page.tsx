"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { User, FileText, LogOut } from "lucide-react";

type Quote = {
    id: string;
    quote_number: string;
    estimated_price: number;
    created_at: string;
    recommended_kva: number;
};

export default function UserDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push("/auth/sign-in");
            return;
        }
        setUser(session.user);
        fetchQuotes(session.user.id);
    }

    async function fetchQuotes(userId: string) {
        // Note: This requires RLS allowing users to select their own quotes
        // For now we assume the policy "Admins can view..." might need updating 
        // OR we add "Users can view own quotes"
        const { data } = await supabase
            .from("quotes")
            .select("*")
            .eq("customer_phone", "") // Ideally we link quotes to user_id, but current schema uses phone/name. 
        // ACTUALLY: The current quotes table does NOT have a user_id column.
        // So we can't easily link strict auth users to quotes yet.
        // For now, let's just show the profile info.

        setLoading(false);
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 py-12">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
                    <p className="text-gray-500">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <div className="flex items-center gap-3 mb-4 text-blue-600">
                        <User className="w-6 h-6" />
                        <h2 className="font-semibold text-lg">Profile Details</h2>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-900">{user?.email}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Phone</span>
                            <span className="font-medium text-gray-900">{user?.user_metadata?.phone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Address</span>
                            <span className="font-medium text-gray-900 text-right">{user?.user_metadata?.address || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* Placeholder for Orders/Points */}
                <div className="bg-white p-6 rounded-xl border shadow-sm opacity-60">
                    <div className="flex items-center gap-3 mb-4 text-purple-600">
                        <FileText className="w-6 h-6" />
                        <h2 className="font-semibold text-lg">Recent Quotes</h2>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">
                        Link quotes to your account to view them here.
                    </p>
                    <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed">
                        No saved quotes linked to this account.
                    </div>
                </div>
            </div>
        </div>
    );
}
