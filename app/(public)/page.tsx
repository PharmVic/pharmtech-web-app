import HomepageHero from "@/components/HomepageHero";
import HomepageActionIcons from "@/components/HomepageActionIcons";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HomepageHero />
      <HomepageActionIcons />

      {/* Solution Services Section */}
      <section className="service py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mx-auto mb-12 max-w-2xl">
            <h4 className="text-primary font-bold uppercase mb-2">Our Solutions</h4>
            <h2 className="text-4xl font-bold text-gray-900">Sustainable Energy & Security</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Solar Power', img: 'https://images.unsplash.com/photo-1509391366360-1e96f5b16e51', link: 'solar' },
              { title: 'CCTV Systems', img: 'https://images.unsplash.com/photo-1557064619-2169b476c535', link: 'cctv' },
              { title: 'Networking', img: 'https://images.unsplash.com/photo-1544197150-b99a580bbcbf', link: 'networking' },
              { title: 'Automation', img: 'https://images.unsplash.com/photo-1558002038-1091a086e98c', link: 'automation' },
              { title: 'Access Control', img: 'https://images.unsplash.com/photo-1563249151-6923838020d6', link: 'access-control' },
              { title: 'Inverters', img: 'https://images.unsplash.com/photo-1592833159057-65a284572225', link: 'inverters' }
            ].map((cat, idx) => (
              <div key={idx} className="service-item bg-white rounded-xl shadow-lg overflow-hidden group">
                <div className="service-img relative h-64 overflow-hidden">
                  <img src={`${cat.img}?w=500&auto=format`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={cat.title} />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-3">{cat.title}</h3>
                  <p className="text-gray-500 mb-4">Professional installation and maintenance tailored to your specific needs.</p>
                  <Link href={`/products/${cat.link}`} className="btn btn-primary rounded-pill py-2 px-4">
                    View Products
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products / Feature Section */}
      <section className="feature py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
            <p className="text-gray-500">Quality products trusted by hundreds of businesses.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: 'Expert Team', icon: '👷' },
              { title: 'High Quality', icon: '🏆' },
              { title: '24/7 Support', icon: '🎧' },
              { title: 'Affordable', icon: '💰' }
            ].map((feat, i) => (
              <div key={i} className="feature-item p-8 bg-white rounded-xl shadow-sm hover:shadow-md">
                <div className="feature-icon text-4xl mb-4">{feat.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                <p className="text-gray-500">We deliver excellence in every project we handle.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
