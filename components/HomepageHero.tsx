"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, PlayCircle, Facebook, Instagram, Youtube, Search } from "lucide-react";

const slides = [
    {
        id: 1,
        image: "/img/carousel-1.png",
        title: "Solar Energy & Automation Systems",
        subtitle: "Welcome To Pharmtech",
        description: "Innovative solutions for a sustainable future. We provide top-tier solar and automation services tailored to your needs.",
        align: "left",
        animation: "animate-fadeInLeft"
    },
    {
        id: 2,
        image: "/img/carousel-2.png",
        title: "Solar Energy & Security Systems",
        subtitle: "Welcome To Pharmtech",
        description: "Innovative solutions for a sustainable future. We provide top-tier solar and security services tailored to your needs.",
        align: "center",
        animation: "animate-fadeInUp"
    }
];

export default function HomepageHero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(interval);
    }, []);



    return (
        <div className="header-carousel position-relative">
            <div className="header-carousel-item position-relative" style={{ height: "auto", minHeight: "500px" }}>
                <div className="position-absolute w-100 h-100 top-0 start-0">
                    <img
                        src={slides[currentSlide].image}
                        className="img-fluid w-100 h-100"
                        alt="Hero"
                        style={{ objectFit: "cover", animation: "image-zoom 10s infinite alternate" }}
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-black/30" />
                </div>

                <div className="d-flex align-items-center" style={{ position: "relative", zIndex: 1, height: "100%", minHeight: "500px", background: "rgba(0, 0, 0, 0.55)", paddingTop: "80px", paddingBottom: "80px" }}>
                    <div className="container">
                        <div className={`row gy-0 gx-5 justify-content-${slides[currentSlide].align === 'right' ? 'end' : slides[currentSlide].align === 'left' ? 'start' : 'center'}`}>
                            {/* Key property helps trigger animation re-render when slide changes */}
                            <div key={currentSlide} className={`col-lg-7 ${slides[currentSlide].animation}`}>
                                <div className={`text-${slides[currentSlide].align === 'right' ? 'end' : slides[currentSlide].align === 'left' ? 'start' : 'center'}`}>
                                    <h4 className="text-primary text-uppercase fw-bold mb-4 text-sm md:text-base">{slides[currentSlide].subtitle}</h4>
                                    <h1 className="display-4 text-uppercase text-white mb-4 fw-bold text-3xl md:text-5xl lg:text-6xl">{slides[currentSlide].title}</h1>
                                    <p className="mb-5 text-sm md:text-lg px-2 lg:px-0 mx-auto max-w-2xl text-white">{slides[currentSlide].description}</p>

                                    <div className={`d-flex justify-content-${slides[currentSlide].align === 'right' ? 'end' : slides[currentSlide].align === 'left' ? 'start' : 'center'} mb-4`}>
                                        <Link className="btn btn-light rounded-pill d-flex align-items-center text-nowrap font-bold py-3 px-4 transition-all hover:scale-105" href="#services-search">
                                            <Search className="me-2 w-6 h-6" /> Search Product
                                        </Link>
                                        <Link className="btn btn-primary rounded-pill d-flex align-items-center text-nowrap ms-2 font-bold py-3 px-4 transition-all hover:scale-105" href="/calculator">
                                            Solar Calculator <ChevronRight className="ms-2 w-6 h-6" />
                                        </Link>
                                    </div>

                                    <div className={`d-flex flex-wrap align-items-center justify-content-${slides[currentSlide].align === 'right' ? 'end' : slides[currentSlide].align === 'left' ? 'start' : 'center'} gap-3`}>
                                        <h5 className="text-white mb-0 font-bold">Follow Us:</h5>
                                        <div className="d-flex">
                                            <a className="btn btn-md-square btn-light rounded-circle me-2 hover:bg-primary hover:text-white transition-colors flex items-center justify-center" href="https://www.facebook.com/share/1AYUsoo7zz/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"><Facebook className="w-4 h-4" /></a>
                                            <a className="btn btn-md-square btn-light rounded-circle me-2 hover:bg-primary hover:text-white transition-colors flex items-center justify-center" href="https://www.instagram.com/pharmtechsolar?igsh=MnI2NHhpZHE5MzRj" target="_blank" rel="noopener noreferrer"><Instagram className="w-4 h-4" /></a>
                                            <a className="btn btn-md-square btn-light rounded-circle me-2 hover:bg-primary hover:text-white transition-colors flex items-center justify-center" href="https://youtube.com/@pharmtechsolar?si=AFklsVn-fZ3eEkx9" target="_blank" rel="noopener noreferrer"><Youtube className="w-4 h-4" /></a>
                                            <a className="btn btn-md-square btn-light rounded-circle me-0 hover:bg-primary hover:text-white transition-colors flex items-center justify-center" href="https://www.tiktok.com/@pharmtech_solar1?_r=1&_t=ZS-94PnSFavA3E" target="_blank" rel="noopener noreferrer">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}
