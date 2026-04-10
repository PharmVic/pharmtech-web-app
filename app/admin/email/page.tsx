"use client";

import { useState } from "react";
import { Send, Loader2, Mail } from "lucide-react";

export default function AdminEmailPage() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [singleEmail, setSingleEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [errorText, setErrorText] = useState("");

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatusText("");
        setErrorText("");

        try {
            const res = await fetch("/api/send-bulk-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject,
                    message,
                    singleEmail: singleEmail.trim() || undefined,
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send email");
            }

            setStatusText(data.message || "Emails sent successfully!");
            if (!singleEmail) {
                setSubject("");
                setMessage("");
            }
        } catch (err: any) {
            setErrorText(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <Mail className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Email Broadcast</h1>
                    <p className="text-gray-600">Send bulk emails to all registered users or a single user for testing.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={handleSend} className="p-6 space-y-6">
                    {statusText && (
                        <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                            {statusText}
                        </div>
                    )}
                    
                    {errorText && (
                        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
                            {errorText}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Single Email (Optional)
                        </label>
                        <input
                            type="email"
                            value={singleEmail}
                            onChange={(e) => setSingleEmail(e.target.value)}
                            placeholder="leave blank to send to ALL users..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">If provided, the email will ONLY be sent to this address.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject *
                        </label>
                        <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Email Subject"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message (HTML Allowed) *
                        </label>
                        <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={8}
                            placeholder="<p>Write your message here... you can use HTML tags!</p>"
                            className="w-full px-4 py-2 flex-grow border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            The message will be automatically wrapped in a template with the Pharmtech Solar logo.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    {singleEmail ? "Send Test Email" : "Send to ALL Users"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
