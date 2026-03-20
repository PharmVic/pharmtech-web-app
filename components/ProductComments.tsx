"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MessageCircle, Send, UserCircle } from "lucide-react";

// Native relative time formatter
function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "yesterday";
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
}

export default function ProductComments({ productId }: { productId: string }) {
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Auth State
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuthAndFetchComments = async () => {
            // Check auth state
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
            }

            // Fetch comments
            fetchComments();
            
            // Listen for auth changes
            const { data: authListener } = supabase.auth.onAuthStateChange(
                async (event, session) => {
                    setUser(session?.user || null);
                }
            );

            return () => {
                authListener.subscription.unsubscribe();
            };
        };

        checkAuthAndFetchComments();
    }, [productId]);

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from("product_comments")
                .select("*")
                .eq("product_id", productId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            if (data) setComments(data);
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) {
            alert("You must be logged in to comment.");
            return;
        }

        if (!newComment.trim()) return;

        setSubmitting(true);
        
        // Extract a display name from user metadata or email
        const displayName = user.user_metadata?.full_name || 
                            user.user_metadata?.name || 
                            user.email?.split('@')[0] || 
                            "Anonymous User";

        try {
            const { error } = await supabase.from("product_comments").insert([
                {
                    product_id: productId,
                    user_id: user.id,
                    user_name: displayName,
                    content: newComment.trim(),
                }
            ]);

            if (error) throw error;

            setNewComment("");
            fetchComments(); // Refresh list
        } catch (err: any) {
            console.error("Error submitting comment:", err);
            alert("Failed to submit comment. " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Customer Comments
            </h3>

            {/* Comment Form Section */}
            <div className="mb-8 p-6 bg-gray-50 rounded-xl">
                {user ? (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                                Leave a Comment reviewing this product
                            </label>
                            <textarea
                                id="comment"
                                rows={3}
                                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                placeholder="What do you think about this product?"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={!newComment.trim() || submitting}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {submitting ? "Posting..." : (
                                    <>
                                        Post Comment <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-6">
                        <UserCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Join the Conversation</h4>
                        <p className="text-gray-600 mb-4">You must be logged in to leave a comment on this product.</p>
                        {/* If they have a login page, link to it. Usually it's /login or similar. Since we don't know the exact route, standard /auth/login or /login. */}
                        <a href="/login" className="inline-block bg-white text-blue-600 border border-blue-600 font-semibold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                            Log In to Comment
                        </a>
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-4 text-gray-500">Loading comments...</div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white">
                            <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold uppercase">
                                {comment.user_name ? comment.user_name.charAt(0) : "U"}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h5 className="font-semibold text-gray-900">{comment.user_name || "User"}</h5>
                                    <span className="text-xs text-gray-500">
                                        {timeAgo(comment.created_at)}
                                    </span>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-white border border-dashed border-gray-200 rounded-xl">
                        No comments yet. Be the first to share your thoughts!
                    </div>
                )}
            </div>
        </div>
    );
}
