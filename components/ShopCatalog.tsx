"use client";

import { useState, useMemo } from "react";
import { ProductType, default as QuickViewModal } from "./QuickViewModal";
import ProductCard from "./ProductCard";
import { 
    Search, Filter, Grid3X3, Grid2X2, List, Sparkles, 
    ShieldCheck, Truck, Zap, X, Check, ArrowUpDown 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export interface CategoryType {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
}

interface ShopCatalogProps {
    initialProducts: ProductType[];
    categories: CategoryType[];
}

export default function ShopCatalog({ initialProducts, categories }: ShopCatalogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("all");
    const [onlyInStock, setOnlyInStock] = useState(false);
    const [onlyPromo, setOnlyPromo] = useState(false);
    const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "discount" | "newest">("featured");
    const [gridCols, setGridCols] = useState<4 | 3 | 1>(4);
    const [quickViewProduct, setQuickViewProduct] = useState<ProductType | null>(null);

    // Compute category counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: initialProducts.length };
        categories.forEach((cat) => {
            counts[cat.slug] = initialProducts.filter((p) => p.product_categories?.slug === cat.slug || p.category_id === cat.id).length;
        });
        return counts;
    }, [initialProducts, categories]);

    // Filter & Sort Logic
    const filteredProducts = useMemo(() => {
        return initialProducts.filter((product) => {
            // Category filter
            if (selectedCategorySlug !== "all") {
                const matchCategory = product.product_categories?.slug === selectedCategorySlug || 
                    categories.find(c => c.slug === selectedCategorySlug)?.id === product.category_id;
                if (!matchCategory) return false;
            }

            // Search filter
            if (searchQuery.trim() !== "") {
                const query = searchQuery.toLowerCase();
                const matchName = product.name.toLowerCase().includes(query);
                const matchDesc = product.description?.toLowerCase().includes(query) || false;
                const matchCat = product.product_categories?.name.toLowerCase().includes(query) || false;
                if (!matchName && !matchDesc && !matchCat) return false;
            }

            // In Stock filter
            if (onlyInStock && product.is_available === false) {
                return false;
            }

            // Promo filter
            if (onlyPromo && (!product.is_promo_active || !product.promo_price)) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            const getActivePrice = (p: ProductType) => (p.is_promo_active && p.promo_price) ? p.promo_price : p.price || 0;
            
            if (sortBy === "price-asc") {
                return getActivePrice(a) - getActivePrice(b);
            }
            if (sortBy === "price-desc") {
                return getActivePrice(b) - getActivePrice(a);
            }
            if (sortBy === "discount") {
                const discountA = (a.is_promo_active && a.promo_price && a.price) ? ((a.price - a.promo_price) / a.price) : 0;
                const discountB = (b.is_promo_active && b.promo_price && b.price) ? ((b.price - b.promo_price) / b.price) : 0;
                return discountB - discountA;
            }
            if (sortBy === "newest") {
                return b.id.localeCompare(a.id);
            }
            // Featured sort (default)
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            return 0;
        });
    }, [initialProducts, selectedCategorySlug, searchQuery, onlyInStock, onlyPromo, sortBy, categories]);

    const activeFilterCount = (selectedCategorySlug !== "all" ? 1 : 0) + (onlyInStock ? 1 : 0) + (onlyPromo ? 1 : 0) + (searchQuery ? 1 : 0);

    const resetFilters = () => {
        setSelectedCategorySlug("all");
        setSearchQuery("");
        setOnlyInStock(false);
        setOnlyPromo(false);
        setSortBy("featured");
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Store Hero Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden py-16 px-4 mb-10">
                {/* Visual Glow Highlights */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Premium Solar & Security Store
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
                        Discover Quality Products
                    </h1>

                    <p className="text-gray-300 text-base md:text-xl max-w-3xl mx-auto leading-relaxed mb-8">
                        Explore our extensive catalog of high-efficiency solar panels, hybrid inverters, 
                        24/7 CCTV surveillance, enterprise networking, and smart automation technology.
                    </p>

                    {/* Value Props Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm text-gray-300">
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                            <ShieldCheck className="w-4 h-4 text-green-400" />
                            <span>100% Genuine Guaranteed</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span>Expert Installation Support</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                            <Truck className="w-4 h-4 text-blue-400" />
                            <span>Fast Nationwide Delivery</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Category Navigation Pills */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Categories</h2>
                        <span className="text-xs text-gray-400 font-medium">{categories.length} Categories Available</span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
                        <button
                            onClick={() => setSelectedCategorySlug("all")}
                            className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 shadow-sm ${
                                selectedCategorySlug === "all"
                                    ? "bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-600/30"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80"
                            }`}
                        >
                            All Products
                            <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                                selectedCategorySlug === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                            }`}>
                                {categoryCounts["all"] || 0}
                            </span>
                        </button>

                        {categories.map((category) => {
                            const count = categoryCounts[category.slug] || 0;
                            const isSelected = selectedCategorySlug === category.slug;

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategorySlug(category.slug)}
                                    className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 shadow-sm ${
                                        isSelected
                                            ? "bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-600/30"
                                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200/80"
                                    }`}
                                >
                                    {category.name}
                                    <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                                        isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                                    }`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filter Controls Bar */}
                <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100/90 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                        
                        {/* Search Bar */}
                        <div className="relative flex-1 min-w-[280px]">
                            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products by name, specs, or keyword..."
                                className="w-full pl-12 pr-10 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Filters & Toggles */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Stock Toggle */}
                            <button
                                onClick={() => setOnlyInStock(!onlyInStock)}
                                className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
                                    onlyInStock
                                        ? "bg-green-50 border-green-300 text-green-700 shadow-sm"
                                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${onlyInStock ? "bg-green-500" : "bg-gray-300"}`} />
                                In Stock Only
                            </button>

                            {/* Promo Deals Toggle */}
                            <button
                                onClick={() => setOnlyPromo(!onlyPromo)}
                                className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
                                    onlyPromo
                                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                On Sale / Deals
                            </button>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-xs font-bold py-3 pl-4 pr-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                                >
                                    <option value="featured">Sort: Featured First</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="discount">Highest Discount</option>
                                    <option value="newest">Newest Arrivals</option>
                                </select>
                                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>

                            {/* Grid View Switcher */}
                            <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
                                <button
                                    onClick={() => setGridCols(4)}
                                    className={`p-2 rounded-xl transition-all ${
                                        gridCols === 4 ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                    }`}
                                    title="4 Columns Grid"
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setGridCols(3)}
                                    className={`p-2 rounded-xl transition-all ${
                                        gridCols === 3 ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                    }`}
                                    title="3 Columns Grid"
                                >
                                    <Grid2X2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setGridCols(1)}
                                    className={`p-2 rounded-xl transition-all ${
                                        gridCols === 1 ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                                    }`}
                                    title="List View"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filter Chips */}
                    {activeFilterCount > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-gray-400 font-medium">Active Filters:</span>
                                {selectedCategorySlug !== "all" && (
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full flex items-center gap-1">
                                        Category: {categories.find(c => c.slug === selectedCategorySlug)?.name || selectedCategorySlug}
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategorySlug("all")} />
                                    </span>
                                )}
                                {searchQuery && (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 font-semibold rounded-full flex items-center gap-1">
                                        Search: "{searchQuery}"
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                                    </span>
                                )}
                                {onlyInStock && (
                                    <span className="px-3 py-1 bg-green-50 text-green-700 font-semibold rounded-full flex items-center gap-1">
                                        In Stock
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => setOnlyInStock(false)} />
                                    </span>
                                )}
                                {onlyPromo && (
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full flex items-center gap-1">
                                        On Sale Deals
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => setOnlyPromo(false)} />
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={resetFilters}
                                className="text-xs text-red-600 hover:text-red-700 font-bold underline ml-auto"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm font-semibold text-gray-600">
                        Showing <span className="text-gray-900 font-extrabold">{filteredProducts.length}</span> of {initialProducts.length} products
                    </p>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className={`grid gap-6 ${
                        gridCols === 4 
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                            : gridCols === 3 
                                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                                : "grid-cols-1"
                    }`}>
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onQuickView={(p) => setQuickViewProduct(p)}
                            />
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Match Your Filters</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            Try adjusting your search query, switching categories, or clearing active filters to view available items.
                        </p>
                        <button
                            onClick={resetFilters}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}

            </div>

            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </div>
    );
}
