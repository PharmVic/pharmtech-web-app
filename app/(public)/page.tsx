import HomepageHero from "@/components/HomepageHero";
import HomepageActionIcons from "@/components/HomepageActionIcons";
import ServicesSection from "@/components/ServicesSection";
import PastInstallationsSection from "@/components/PastInstallationsSection";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Fetch reviews for testimonials
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  // Fetch all products for the homepage showcase
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("is_available", { ascending: false, nullsFirst: true })
    .order("is_featured", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const dynamicReviews = (reviews || []).map(r => ({
    name: r.name,
    role: r.role,
    img: r.image_url,
    text: r.text
  }));

  return (
    <main className="min-h-screen bg-white">
      <HomepageHero />

      {/* Products Section */}
      <ServicesSection
        initialServices={[
          ...(products || []).map(p => ({
            title: p.name,
            img: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : (p.image_url || 'https://images.unsplash.com/photo-1509391366360-1e96f5b16e51'),
            link: p.id,
            desc: p.description || p.name,
            isProduct: true,
            price: p.price,
            is_promo_active: p.is_promo_active,
            promo_price: p.promo_price,
            is_available: p.is_available,
            is_featured: p.is_featured
          }))
        ]}
      />

      {/* Past Installations Section */}
      <PastInstallationsSection />

      <div className="container-fluid testimonial pb-5">
        <div className="container pb-5">
          <div className="text-center mx-auto pb-5" style={{ maxWidth: "800px" }}>
            <h4 className="text-primary font-bold uppercase mb-2">Testimonial</h4>
            <h1 className="display-5 mb-4 font-bold">Our Clients Reviews</h1>
            <p className="mb-0 text-gray-600">See what our satisfied customers have to say about our solar and security solutions.
            </p>
          </div>
          <div className="row g-4">
            {[
              ...dynamicReviews,
              // Fallback if the database has nothing yet (prevents empty layout)
              ...(dynamicReviews.length === 0 ? [
                { name: 'John Doe', role: 'Business Owner', img: '/img/testimonial-1.jpg', text: 'Pharmtech transformed our energy systems. Highly recommended!' },
                { name: 'Jane Smith', role: 'Homeowner', img: '/img/testimonial-2.jpg', text: 'Excellent service and professional installation of our CCTV system.' },
                { name: 'Robert Brown', role: 'Project Manager', img: '/img/testimonial-3.jpg', text: 'Top-notch networking solutions that boosted our office productivity.' }
              ] : [])
            ].map((review, i) => (
              <div key={i} className="col-md-4">
                <div className="testimonial-item bg-light rounded p-4 position-relative">
                  {/* Quote Icon Left */}
                  <div className="testimonial-quote-left d-flex align-items-center justify-content-center text-primary bg-white rounded-circle position-absolute" style={{ width: "60px", height: "60px", top: "-30px", left: "30px" }}>
                    <i className="fas fa-quote-left fa-2x"></i>
                  </div>
                  <div className="testimonial-img d-flex justify-content-center my-4">
                    <div className="overflow-hidden rounded-circle shadow-sm position-relative" style={{ width: "100px", height: "100px", border: "5px solid white" }}>
                      {review.img ? (
                        <Image src={review.img} fill sizes="100px" className="object-cover hover:scale-110 transition-transform duration-500" alt={review.name} />
                      ) : (
                        <div className="bg-white w-100 h-100 d-flex align-items-center justify-content-center">
                          <i className="fas fa-user fa-3x text-gray-300"></i>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="testimonial-text text-center pb-4">
                    <p className="mb-0 text-gray-600">{review.text}</p>
                  </div>
                  <div className="testimonial-title text-center">
                    <h4 className="mb-0 font-bold">{review.name}</h4>
                    <p className="mb-0 text-primary">{review.role}</p>
                    <div className="d-flex justify-content-center text-primary mt-2">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                  </div>
                  {/* Quote Icon Right */}
                  <div className="testimonial-quote-right d-flex align-items-center justify-content-center text-primary bg-white rounded-circle position-absolute" style={{ width: "60px", height: "60px", bottom: "-30px", right: "30px" }}>
                    <i className="fas fa-quote-right fa-2x"></i>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <HomepageActionIcons />
    </main>
  );
}
