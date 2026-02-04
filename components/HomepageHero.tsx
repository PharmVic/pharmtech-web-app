"use client";

export default function HomepageHero() {
    return (
        <div className="header-carousel overflow-hidden">
            <div className="header-carousel-item relative">
                <img
                    src="/homepage/hero-1.jpg"
                    alt="Hero Image"
                    className="w-full object-cover"
                    // Fallback to placeholder if image missing
                    onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1509391366360-1e96f5b16e51?q=80&w=1000&auto=format&fit=crop"}
                />
                <div className="carousel-caption">
                    <div className="container">
                        <div className="row justify-content-start">
                            <div className="col-lg-7 text-left max-w-3xl px-4">
                                <h4 className="text-white text-uppercase font-bold mb-4 animate-bounce">Advanced Solutions</h4>
                                <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                                    Solar Energy & Automation Systems
                                </h1>
                                <div className="flex gap-4">
                                    <a href="/products" className="btn btn-primary rounded-pill py-3 px-5">Explore Products</a>
                                    <a href="/quote" className="btn btn-light rounded-pill py-3 px-5">Get a Quote</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
