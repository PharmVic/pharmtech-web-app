"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { User, FileText, LogOut, Award, Link as LinkIcon, Copy } from "lucide-react";

type Quote = {
    id: string;
    quote_number: string;
    estimated_price: number;
    created_at: string;
    recommended_kva: number;
};

type Profile = {
    id: string;
    referral_code: string;
    points_balance: number;
};

export default function UserDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

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
        fetchProfileAndQuotes(session.user.id);
    }

    async function fetchProfileAndQuotes(userId: string) {
        // Fetch User Profile for points and referral code
        const { data: profileData } = await supabase
            .from("profiles")
            .select("id, referral_code, points_balance")
            .eq("id", userId)
            .single();

        if (profileData) {
            // BACKFILL FOR EXISTING USERS: 
            // If they don't have a referral code yet (e.g., they made their account before this feature),
            // generate one for them right now and save it.
            if (!profileData.referral_code) {
                const newReferralCode = 'PHARM-' + Math.random().toString(36).substring(2, 8).toUpperCase();

                // Update the database
                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({ referral_code: newReferralCode })
                    .eq("id", userId);

                if (!updateError) {
                    profileData.referral_code = newReferralCode;
                }
            }

            setProfile(profileData);
        }

        // Setup quotes fetch
        const { data } = await supabase
            .from("quotes")
            .select("*")
            .eq("customer_phone", ""); // Needs real linking in future

        setLoading(false);
    }

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    }

    const copyReferralLink = () => {
        if (profile?.referral_code) {
            const baseUrl = window.location.origin;
            navigator.clipboard.writeText(`${baseUrl}/auth/sign-up?ref=${profile.referral_code}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 py-12">
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

                {/* Rewards & Referrals Card */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl border shadow-md text-white md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/20 rounded-full">
                            <Award className="w-8 h-8 text-yellow-300" />
                        </div>
                        <div>
                            <h2 className="font-bold text-xl text-blue-50">Points Balance</h2>
                            <div className="text-4xl font-extrabold mt-1">
                                {profile?.points_balance || 0} <span className="text-lg font-medium text-blue-200">pts</span>
                            </div>
                            <p className="text-blue-200 text-sm mt-1">1 point = ₦1</p>
                        </div>
                    </div>

                    <div className="bg-white/10 p-4 rounded-lg border border-white/20 w-full md:w-auto">
                        <h3 className="font-semibold text-sm text-blue-100 mb-2 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" /> Your Referral Link
                        </h3>
                        <p className="text-xs text-blue-200 mb-3">Earn 1% of the purchase value when someone signs up with your link and buys our products!</p>
                        <div className="flex items-center gap-2 bg-black/20 p-2 rounded">
                            <code className="text-sm flex-1 truncate select-all text-yellow-100">
                                {profile?.referral_code ? `${window.location.origin}/auth/sign-up?ref=${profile.referral_code}` : 'Generating...'}
                            </code>
                            <button
                                onClick={copyReferralLink}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded transition-colors"
                                title="Copy Link"
                            >
                                {copied ? <span className="text-xs font-bold text-green-300">Copied!</span> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

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
