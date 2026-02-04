"use client";

import Link from 'next/link';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light sticky-top px-4 px-lg-5 py-lg-0 bg-white shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="navbar-brand p-0">
                    <h1 className="text-xl font-bold tracking-tight text-primary m-0 flex items-center">
                        <span className="text-blue-600 mr-2">PHARM</span>TECH
                    </h1>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex navbar-nav align-items-center">
                    <Link href="/" className="nav-item nav-link active">Home</Link>
                    <Link href="/products" className="nav-item nav-link">Products</Link>
                    <Link href="/calculator" className="nav-item nav-link">Solar Calculator</Link>
                    <Link href="/quote" className="nav-item nav-link">Get Quote</Link>
                    <Link href="/contact" className="nav-item nav-link">Contact</Link>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <button className="btn btn-square btn-light rounded-circle ">
                        <Search className="h-5 w-5" />
                    </button>
                    <Link href="/auth/sign-in" className="btn btn-primary rounded-pill px-4 py-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Sign In
                    </Link>
                    <button className="text-gray-700 hover:text-black md:hidden btn btn-square btn-light rounded-circle">
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
