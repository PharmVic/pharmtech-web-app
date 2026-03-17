"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Home, LayoutDashboard, Users, Calculator } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        checkAdmin();
    }, []);

    async function checkAdmin() {
        try {
            // 1. Check Session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                console.log("No session, redirecting...");
                router.push("/auth/sign-in");
                return;
            }

            // 2. Check Role in Profiles
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single();

            if (profileError || !profile || profile.role !== "admin") {
                console.log("Not admin, redirecting...", profile?.role);
                // Maybe redirect to user dashboard or show unauthorized
                alert("Access Denied: Admins Only");
                router.push("/");
                return;
            }

            // 3. Authorized
            setAuthorized(true);
        } catch (err) {
            console.error("Admin check failed", err);
            router.push("/auth/sign-in");
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Verifying Admin Access...</p>
                </div>
            </div>
        );
    }

    if (!authorized) {
        return null; // or a forbidden page
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Optional: Admin Sidebar or Header could go here */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 mb-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1 text-sm font-medium" title="Go back to Home">
                        <Home className="w-4 h-4" />
                    </Link>
                    <span className="font-bold text-gray-700">Admin Console</span>
                    <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-md">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/admin/customers" className="text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-md">
                        <Users className="w-4 h-4" /> Customers
                    </Link>
                    <Link href="/admin/calculator-items" className="text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-md">
                        <Calculator className="w-4 h-4" /> Calculator Items
                    </Link>
                </div>
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                    Authenticated
                </div>
            </div>
            {children}
        </div>
    );
}
