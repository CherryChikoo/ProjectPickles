import { ArrowRight } from 'lucide-react';
import React from 'react';
import { ShimmerButton } from "@/components/magicui/shimmer-button";

const Logo = () => (
  <svg viewBox="0 0 256 256" fill="currentColor" className="w-6 h-6 text-black">
    <path d="M 144 256 L 27.598 256 L 144 139.598 Z" />
    <path d="M 256 207.5 L 200 256 L 200 56 L 0 56 L 48 0 L 256 0 Z" />
    <path d="M 0 204.402 L 0 112 L 92.402 112 Z" />
  </svg>
);

const pickles = [
  { id: 1, name: 'Mango Pickle', desc: 'Traditional recipe', weight: '500g', price: '₹250', img: 'https://images.unsplash.com/photo-1589333555231-15eb270a68d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 2, name: 'Garlic Pickle', desc: 'Bold & spicy', weight: '500g', price: '₹280', img: 'https://images.unsplash.com/photo-1627443834676-e17537b9dc07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 3, name: 'Mixed Veg', desc: 'Farm fresh', weight: '500g', price: '₹240', img: 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 4, name: 'Chili Pickle', desc: 'Extra hot', weight: '500g', price: '₹220', img: 'https://images.unsplash.com/photo-1506163352729-21b5e3240eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden selection:bg-black selection:text-white">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 md:px-14 py-4 sm:py-5 flex items-center justify-between bg-white border-b border-black">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="font-semibold text-lg tracking-tight text-black uppercase">IndianPickles</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-medium">
          <a href="#" className="text-sm text-black hover:underline underline-offset-4">Home</a>
          <a href="#pickles" className="text-sm text-black hover:underline underline-offset-4">Pickles</a>
          <a href="#story" className="text-sm text-black hover:underline underline-offset-4">Our Story</a>
          <a href="#why-us" className="text-sm text-black hover:underline underline-offset-4">Why Us</a>
          <a href="#contact" className="text-sm text-black hover:underline underline-offset-4">Contact</a>
        </div>
        
        <ShimmerButton className="shadow-2xl">
          <span className="text-center text-sm font-bold tracking-tight text-white uppercase">
            ORDER NOW
          </span>
        </ShimmerButton>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-28 md:pt-36 lg:pt-40 px-6 sm:px-10 md:px-14 pb-16 md:pb-24 max-w-[1600px] mx-auto min-h-[90vh] flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        <div className="w-full lg:w-5/12 flex flex-col items-start text-left lg:pl-12 xl:pl-20">
          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.5rem] leading-[1.1] tracking-tight text-black font-normal">
            A Taste of Tradition, <br/> Made to Stay.
          </h1>
          <p className="max-w-md mt-6 md:mt-8 text-base md:text-lg text-black font-medium leading-relaxed">
            Authentic, handmade pickles crafted with recipes passed down through generations. No preservatives, just pure nostalgia.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ShimmerButton className="shadow-2xl px-8 py-4">
              <span className="text-center text-sm font-bold tracking-tight text-white uppercase">
                SHOP COLLECTION
              </span>
            </ShimmerButton>
            <button className="px-8 py-4 bg-white text-black text-sm font-bold border border-black hover:bg-black hover:text-white transition-colors duration-200 rounded-full">
              DISCOVER OUR STORY
            </button>
          </div>
        </div>
        
        <div className="w-full lg:w-7/12 relative flex justify-center items-center">
          <img 
            src="/HeroSection.png" 
            alt="Traditional Pickle Jar" 
            className="w-full h-auto object-contain max-h-[80vh]"
          />
        </div>
      </section>

      {/* BRAND STORY */}
      <section id="story" className="border-t border-black px-6 sm:px-10 md:px-14 py-20 md:py-32 flex flex-col items-center text-center bg-white">
        <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight max-w-4xl font-normal text-black">
          Some recipes aren't written down.<br/> They're passed down.
        </h2>
        <div className="mt-16 md:mt-24 w-full max-w-5xl">
          <img 
            src="/BrandSecNew.png" 
            alt="Making pickles" 
            className="w-full h-auto object-contain"
          />
        </div>
      </section>

      {/* FEATURED PICKLES */}
      <section id="pickles" className="border-t border-black bg-white">
        <div className="px-6 sm:px-10 md:px-14 py-16 md:py-24">
          <h2 className="text-sm font-bold uppercase tracking-widest text-black mb-12">OUR PICKLES</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {pickles.map(pickle => (
              <div key={pickle.id} className="group border border-black flex flex-col bg-white">
                <div className="w-full aspect-square border-b border-black overflow-hidden bg-white p-4">
                  <img src={pickle.img} alt={pickle.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" />
                </div>
                <div className="p-6 flex flex-col flex-1 bg-white group-hover:bg-black group-hover:text-white transition-colors duration-200">
                  <h3 className="text-2xl font-sans">{pickle.name}</h3>
                  <p className="text-sm font-medium mt-1 uppercase tracking-wider">{pickle.desc}</p>
                  
                  <div className="mt-8 flex items-center justify-between font-bold text-lg">
                    <span>{pickle.weight}</span>
                    <span>{pickle.price}</span>
                  </div>
                  
                  <button className="mt-8 w-full py-3 border border-black group-hover:border-white text-sm font-bold uppercase tracking-wider bg-white group-hover:bg-black text-black group-hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 rounded-full">
                    View Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why-us" className="border-t border-black bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-black">
          {[
            { num: '01', title: 'Traditional Recipes' },
            { num: '02', title: 'Quality Ingredients' },
            { num: '03', title: 'Homemade Taste' },
            { num: '04', title: 'Made With Care' }
          ].map((item, i) => (
            <div key={i} className="p-8 md:p-12 lg:p-16 flex flex-col items-start bg-white">
              <span className="text-5xl md:text-6xl font-bold text-black mb-12">{item.num}</span>
              <h3 className="text-xl md:text-2xl font-sans text-black">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="border-t border-black grid grid-cols-1 lg:grid-cols-2 bg-white">
        <div className="w-full h-[50vh] lg:h-auto border-b lg:border-b-0 lg:border-r border-black p-4">
          <img 
            src="https://images.unsplash.com/photo-1596797882870-8c33deeac224?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="From our kitchen" 
            className="w-full h-full object-cover grayscale"
          />
        </div>
        <div className="p-10 sm:p-16 md:p-24 flex flex-col justify-center">
          <h4 className="text-sm font-bold uppercase tracking-widest text-black mb-12">FROM OUR KITCHEN</h4>
          <p className="font-sans text-3xl sm:text-4xl md:text-5xl leading-tight text-black">
            Not factory-made.<br/>
            Not mass-produced.<br/>
            <br/>
            Just honest pickle,<br/>
            made the way it should be.
          </p>
          <a href="#" className="mt-16 inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest border-b-2 border-black pb-1 hover:pr-4 transition-all duration-300 self-start">
            DISCOVER OUR STORY <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ORDERING PROCESS */}
      <section className="border-t border-black bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black">
          {[
            { num: '01', title: 'Choose Your Pickle' },
            { num: '02', title: 'Place Your Order' },
            { num: '03', title: 'We Confirm' }
          ].map((item, i) => (
            <div key={i} className="p-10 md:p-14 text-center flex flex-col items-center bg-white">
              <span className="text-4xl md:text-5xl font-sans text-black mb-6">{item.num}</span>
              <h3 className="text-lg font-bold uppercase tracking-widest text-black">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-b border-black py-24 md:py-36 text-center px-6 bg-white">
        <h2 className="font-sans text-5xl sm:text-6xl md:text-8xl text-black">
          Ready for a taste of home?
        </h2>
        <div className="mt-16 max-w-md mx-auto">
          {/* Mock Input Field */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input 
              type="email" 
              placeholder="Enter your email to get started" 
              className="w-full sm:w-auto flex-1 px-6 py-4 bg-white text-black border border-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black placeholder-black/50 font-medium rounded-full"
            />
            <ShimmerButton className="shadow-2xl px-8 py-4">
              <span className="text-center text-sm font-bold tracking-tight text-white uppercase">
                ORDER NOW
              </span>
            </ShimmerButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-black px-6 sm:px-10 md:px-14 py-16">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <span className="font-semibold text-2xl tracking-tight text-black uppercase block mb-6">IndianPickles</span>
            <p className="font-sans text-2xl leading-tight max-w-sm">
              Authentic homemade pickles,<br/>
              made with tradition.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 font-bold text-sm uppercase tracking-widest">
            <a href="#" className="hover:underline underline-offset-4">Home</a>
            <a href="#pickles" className="hover:underline underline-offset-4">Pickles</a>
            <a href="#story" className="hover:underline underline-offset-4">Our Story</a>
            <a href="#contact" className="hover:underline underline-offset-4">Contact</a>
          </div>
          
          <div className="flex flex-col gap-4 font-bold text-sm uppercase tracking-widest">
            <a href="#" className="hover:underline underline-offset-4">WhatsApp</a>
            <a href="#" className="hover:underline underline-offset-4">Phone</a>
            <a href="#" className="hover:underline underline-offset-4">Instagram</a>
          </div>
        </div>
        
        <div className="max-w-[1600px] mx-auto mt-24 pt-8 border-t border-black flex flex-col sm:flex-row items-center justify-between text-sm font-medium">
          <p>© 2026 IndianPickles</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:underline underline-offset-4">Privacy</a>
            <a href="#" className="hover:underline underline-offset-4">Terms</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
