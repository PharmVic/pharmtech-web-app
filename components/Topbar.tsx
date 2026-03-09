"use client";

import Link from "next/link";
import { Home, MapPin, Phone, Mail, User, LogIn, LayoutDashboard, Calculator } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Topbar() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user || null);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <div className="container-fluid topbar bg-light px-2 px-lg-5">
            <div className="row gx-0 align-items-center">
                <div className="col-lg-8 text-center text-lg-start mb-2 mb-lg-0">
                    <div className="d-flex flex-wrap justify-content-center justify-content-lg-start">
                        <Link href="/" className="text-primary small me-4 flex items-center gap-2 font-bold hover:text-blue-800 transition-colors">
                            <Home className="w-4 h-4" /> Home
                        </Link>
                    </div>
                </div>
                <div className="col-lg-4 text-center text-lg-end">
                    <div className="d-inline-flex align-items-center" style={{ height: "45px" }}>
                        {user ? (
                            <Link href="/dashboard" className="me-3 text-dark flex items-center gap-2">
                                <LayoutDashboard className="w-4 h-4 text-primary" /> <small>Dashboard</small>
                            </Link>
                        ) : (
                            <>
                                <Link href="/auth/sign-up" className="me-3 text-dark flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" /> <small>Register</small>
                                </Link>
                                <Link href="/auth/sign-in" className="me-3 text-dark flex items-center gap-2">
                                    <LogIn className="w-4 h-4 text-primary" /> <small>Login</small>
                                </Link>
                            </>
                        )}
                        <Link href="/calculator" className="text-dark flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-primary" /> <small>Solar Calculator</small>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
