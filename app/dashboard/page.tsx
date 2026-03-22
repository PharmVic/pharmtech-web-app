"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { User, FileText, LogOut, Award, Link as LinkIcon, Copy, ShoppingCart, CreditCard } from "lucide-react";
import dynamic from 'next/dynamic';

const PaystackCheckout = dynamic(() => import("@/components/PaystackCheckout"), { ssr: false });

type Quote = {
    id: string;
    quote_number: string;
    estimated_price: number;
    created_at: string;
    recommended_kva: number;
};

type Payment = {
    id: string;
    reference: string;
    amount: number;
    status: string;
    created_at: string;
    items: any[];
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
    const [payments, setPayments] = useState<Payment[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
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
        fetchDashboardData(session.user.id);
    }

    async function fetchDashboardData(userId: string) {
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

        // Fetch user's actual quotes
        const { data: quotesData } = await supabase
            .from("quotes")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
        if (quotesData) setQuotes(quotesData);

        // Fetch user's actual confirmed orders
        const { data: paymentsData } = await supabase
            .from("payments")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
        if (paymentsData) setPayments(paymentsData);

        // Fetch user's instalment schedules
        const { data: schedulesData } = await supabase
            .from("instalment_schedules")
            .select(`
                *,
                instalment_applications (
                    id,
                    product_id,
                    products (
                        name
                    )
                )
            `)
            .eq("user_id", userId)
            .order("due_date", { ascending: true });
        if (schedulesData) setSchedules(schedulesData);

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

    if (loading) return <div className="p-8 text-center text-gray-600">Loading dashboard...</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 py-8 md:py-12 overflow-x-hidden w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b pb-4 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
                    <p className="text-gray-600">Welcome back, {user?.user_metadata?.full_name || user?.email}</p>
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
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-4 md:p-6 rounded-xl border shadow-md text-white md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden min-w-0">
                    <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden min-w-0">
                        <div className="p-4 bg-white/20 rounded-full shrink-0">
                            <Award className="w-8 h-8 text-yellow-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-bold text-xl text-blue-50 truncate">Points Balance</h2>
                            <div className="text-4xl font-extrabold mt-1">
                                {profile?.points_balance || 0} <span className="text-lg font-medium text-blue-200">pts</span>
                            </div>
                            <p className="text-blue-200 text-sm mt-1">1 point = ₦1</p>
                        </div>
                    </div>

                    <div className="bg-white/10 p-4 rounded-lg border border-white/20 w-full md:w-auto overflow-hidden min-w-0 flex-1 md:flex-none">
                        <h3 className="font-semibold text-sm text-blue-100 mb-2 flex items-center gap-2 truncate">
                            <LinkIcon className="w-4 h-4" /> Your Referral Link
                        </h3>
                        <p className="text-xs text-blue-200 mb-3">Earn 1% of the purchase value when someone signs up with your link and buys our products!</p>
                        <div className="flex items-center gap-2 bg-black/20 p-2 rounded w-full overflow-hidden">
                            <code className="text-sm flex-1 truncate select-all text-yellow-100 min-w-0">
                                {profile?.referral_code ? `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/sign-up?ref=${profile.referral_code}` : 'Generating...'}
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
                <div className="bg-white p-4 md:p-6 rounded-xl border shadow-sm overflow-hidden min-w-0">
                    <div className="flex items-center gap-3 mb-4 text-blue-600">
                        <User className="w-6 h-6" />
                        <h2 className="font-semibold text-lg">Profile Details</h2>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-2 gap-4">
                            <span className="text-gray-600 shrink-0">Email</span>
                            <span className="font-medium text-gray-900 truncate text-right min-w-0">{user?.email}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 gap-4">
                            <span className="text-gray-600 shrink-0">Phone</span>
                            <span className="font-medium text-gray-900 truncate text-right min-w-0">{user?.user_metadata?.phone || "N/A"}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2 gap-4">
                            <span className="text-gray-600 shrink-0">Address</span>
                            <span className="font-medium text-gray-900 text-right truncate min-w-0">{user?.user_metadata?.address || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* Active Instalments Card */}
                <div className="bg-white p-4 md:p-6 rounded-xl border border-blue-100 shadow-sm overflow-hidden min-w-0 md:col-span-2">
                    <div className="flex items-center gap-3 mb-4 text-blue-700">
                        <CreditCard className="w-6 h-6" />
                        <h2 className="font-semibold text-lg">Active Instalments & Upcoming Bills</h2>
                    </div>
                    {schedules.filter(s => s.status === 'pending').length === 0 ? (
                        <div className="text-center py-6 bg-blue-50/50 rounded-lg border border-dashed border-blue-200 text-blue-600 text-sm">
                            You have no pending instalment payments.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {schedules.filter(s => s.status === 'pending').map((schedule) => {
                                const dueDate = new Date(schedule.due_date);
                                const now = new Date();
                                const gracePeriodEnd = new Date(dueDate);
                                gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
                                
                                const isLate = now > dueDate;
                                const isPenaltyApplied = now > gracePeriodEnd;
                                
                                const baseAmount = Number(schedule.amount_due);
                                const finalAmount = isPenaltyApplied ? baseAmount * 1.05 : baseAmount;

                                return (
                                    <div key={schedule.id} className={`border p-5 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isLate ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-900 text-lg mb-1">
                                                {schedule.instalment_applications?.products?.name || "Product Instalment"}
                                            </div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-xs font-bold px-2 py-1 rounded border ${isLate ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                                    {isPenaltyApplied ? 'OVERDUE (+5% PENALTY)' : isLate ? 'OVERDUE (GRACE PERIOD)' : 'UPCOMING'}
                                                </span>
                                                <span className="text-sm font-medium text-gray-600">
                                                    Due Date: {dueDate.toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="text-2xl font-extrabold text-blue-800 flex items-center flex-wrap gap-2">
                                                ₦{finalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                {isPenaltyApplied && <span className="text-sm font-semibold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">+5% Late Fee</span>}
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto shrink-0 min-w-[200px]">
                                            <PaystackCheckout 
                                                amount={finalAmount}
                                                email={user?.email || ""}
                                                phone={user?.user_metadata?.phone || "0000000000"}
                                                location={user?.user_metadata?.address || "N/A"}
                                                deliveryDate="Instalment Payment"
                                                items={[{ name: `Monthly Instalment - ${schedule.instalment_applications?.products?.name}`, quantity: 1, price: schedule.amount_due }]}
                                                userId={user?.id || ""}
                                                onSuccess={async (ref) => {
                                                    await supabase.from('instalment_schedules').update({
                                                        status: 'paid',
                                                        paystack_reference: ref,
                                                        paid_at: new Date().toISOString()
                                                    }).eq('id', schedule.id);
                                                    alert("Payment successful! Your instalment schedule has been updated.");
                                                    fetchDashboardData(user.id);
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Orders Card */}
                <div className="bg-white p-4 md:p-6 rounded-xl border shadow-sm overflow-hidden min-w-0">
                    <div className="flex items-center gap-3 mb-4 text-green-600">
                        <ShoppingCart className="w-6 h-6" />
                        <h2 className="font-semibold text-lg">Recent Orders</h2>
                    </div>
                    {payments.length === 0 ? (
                        <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed text-gray-600 text-sm">
                            You have no recent orders.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {payments.map((payment) => (
                                <div key={payment.id} className="border p-4 rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center border-b pb-2 mb-2 gap-2">
                                        <span className="text-xs text-gray-500 truncate flex-1 min-w-0" title={payment.reference}>Order ID: {payment.reference}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${payment.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {payment.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        {payment.items && payment.items.map((item, i) => (
                                            <div key={i} className="flex justify-between text-sm flex-nowrap w-full overflow-hidden">
                                                <span className="text-gray-700 truncate pr-2 flex-1 min-w-0">{item.quantity}x {item.name}</span>
                                                <span className="font-medium text-gray-900 shrink-0">₦{(item.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-2 border-t text-gray-600">
                                        <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                                        <span className="font-bold text-gray-900 text-base">Total: ₦{Number(payment.amount).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Solar Quotes Card */}
                <div className="bg-white p-4 md:p-6 rounded-xl border shadow-sm overflow-hidden min-w-0">
                    <div className="flex items-center gap-3 mb-4 text-purple-600">
                        <FileText className="w-6 h-6" />
                        <h2 className="font-semibold text-lg">Solar Quotes</h2>
                    </div>
                    {quotes.length === 0 ? (
                        <div className="text-center py-4 bg-gray-50 rounded-lg border border-dashed text-gray-600 text-sm">
                            You haven't generated any solar quotes yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quotes.map((quote) => (
                                <div key={quote.id} className="border p-4 rounded-lg shadow-sm hover:border-purple-200 transition-colors">
                                    <div className="flex justify-between items-center border-b pb-2 mb-2 gap-2">
                                        <span className="text-sm font-semibold text-gray-900 truncate flex-1 min-w-0" title={quote.quote_number}>{quote.quote_number}</span>
                                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-medium border border-purple-100 shrink-0 whitespace-nowrap">
                                            {quote.recommended_kva}kVA System
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm pt-2 text-gray-600">
                                        <span>{new Date(quote.created_at).toLocaleDateString()}</span>
                                        <span className="font-bold text-gray-900">Est. ₦{Number(quote.estimated_price).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
