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
            <div className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1 text-sm font-medium pt-1" title="Go back to Home">
                        <Home className="w-4 h-4" />
                    </Link>
                    <span className="font-bold text-gray-700 pt-1">Admin Console</span>
                    <div className="flex flex-wrap items-center gap-2 w-full mt-2 md:w-auto md:mt-0">
                        <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-md bg-gray-50 md:bg-transparent border md:border-transparent">
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link href="/admin/customers" className="text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-md bg-gray-50 md:bg-transparent border md:border-transparent">
                            <Users className="w-4 h-4" /> Customers
                        </Link>
                        <Link href="/admin/calculator-items" className="text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-md bg-gray-50 md:bg-transparent border md:border-transparent">
                            <Calculator className="w-4 h-4" /> Calculator Items
                        </Link>
                        <Link href="/admin/past-installations" className="text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-md bg-gray-50 md:bg-transparent border md:border-transparent">
                            <i className="fas fa-image w-4 h-4 flex items-center justify-center text-xs"></i> Past Installations
                        </Link>
                        <Link href="/admin/instalments" className="text-sm font-medium text-gray-600 hover:text-blue-800 transition-colors flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 rounded-md bg-gray-50 md:bg-transparent border md:border-transparent">
                            <i className="fas fa-file-contract w-4 h-4 flex items-center justify-center text-xs"></i> Instalments
                        </Link>
                    </div>
                </div>
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 self-end md:self-auto -mt-10 md:mt-0">
                    Authenticated
                </div>
            </div>
            {children}
        </div>
    );
}
