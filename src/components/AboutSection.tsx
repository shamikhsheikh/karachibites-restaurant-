import React from 'react';
import { MapPin, Clock, Phone, ShieldCheck, Flame, UtensilsCrossed } from 'lucide-react';
import chickenBiryani from '../assets/images/dish_chicken_biryani_1791648623964.jpg';

export const AboutSection: React.FC = () => {
  const branches = [
    {
      name: 'Clifton Branch',
      location: 'Block 4, Near Boat Basin, Clifton, Karachi',
      phone: '021-35870001',
      timings: '12:00 PM – 1:00 AM Daily',
    },
    {
      name: 'Gulshan-e-Iqbal Branch',
      location: 'Block 6, University Road, Gulshan-e-Iqbal, Karachi',
      phone: '021-34980002',
      timings: '12:00 PM – 1:00 AM Daily',
    },
    {
      name: 'North Nazimabad Branch',
      location: 'Block D, Near Hydri Market, North Nazimabad, Karachi',
      phone: '021-36640003',
      timings: '12:00 PM – 1:00 AM Daily',
    },
  ];

  return (
    <section id="about" className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Heritage Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
        <div className="lg:col-span-6 space-y-5">
          <span className="text-xs font-sans font-semibold tracking-[0.25em] text-[#D7AE55] uppercase block">
            OUR STORY & HERITAGE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#201D22] tracking-tight">
            Rooted in Karachi's Great Culinary Tradition
          </h2>
          <p className="text-sm sm:text-base text-[#6E675F] leading-relaxed font-light">
            Karachi is a city defined by nocturnal food streets, searing coals, and an uncompromising obsession with flavour. Karachi Bites was established to preserve that dining heritage with modern culinary elegance.
          </p>
          <p className="text-sm sm:text-base text-[#6E675F] leading-relaxed font-light">
            From our velvety Chicken Malai Boti basted over slow embers, to sizzling Shinwari woks seasoned with wild mountain coriander and ripe plum tomatoes, every dish is prepared to exact standards.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-[#201D22]">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFF9EF] border border-[#201D22]/10">
              <Flame className="w-4 h-4 text-[#D7AE55]" />
              <span>Smoky Babul Charcoal Grilling</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFF9EF] border border-[#201D22]/10">
              <UtensilsCrossed className="w-4 h-4 text-[#D7AE55]" />
              <span>Aged Long-Grain Basmati Rice</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFF9EF] border border-[#201D22]/10">
              <ShieldCheck className="w-4 h-4 text-[#D7AE55]" />
              <span>Certified Halal Ingredients</span>
            </div>
          </div>
        </div>

        {/* Highlight Image or Visual Grid */}
        <div className="lg:col-span-6">
          <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#201D22]/10 bg-[#1B1924]">
            <img
              src={chickenBiryani || '/images/dish_chicken_biryani_1791648623964.jpg'}
              alt="Artisanal Karachi Dum Biryani with saffron rice, roasted spices, and slow simmered chicken"
              className="w-full h-auto aspect-[4/3] object-cover"
              loading="lazy"
              width={700}
              height={525}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                if (!img.src.includes('/images/dish_chicken_biryani_1791648623964.jpg')) {
                  img.src = '/images/dish_chicken_biryani_1791648623964.jpg';
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B1924]/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 text-xs text-[#F7EBD2] flex items-center justify-between">
              <span className="font-serif text-sm font-semibold text-[#E8C878]">Karachi Dum Biryani</span>
              <span className="text-[11px] font-mono text-[#D7AE55]">Pure Saffron & Fried Onions</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Authentic Branches */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#201D22]">
            Our Karachi Locations
          </h3>
          <p className="text-xs sm:text-sm text-[#6E675F]">
            Serving Clifton, Gulshan-e-Iqbal, and North Nazimabad with fast hot delivery and takeaway.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map((b) => (
            <div
              key={b.name}
              className="rounded-2xl bg-[#FFF9EF] border border-[#201D22]/10 p-6 flex flex-col justify-between space-y-4 hover:border-[#D7AE55]/60 transition-all shadow-xs"
            >
              <div>
                <span className="text-[11px] font-semibold text-[#D7AE55] tracking-widest uppercase block mb-1">
                  OFFICIAL BRANCH
                </span>
                <h4 className="font-serif text-xl font-bold text-[#201D22]">
                  {b.name}
                </h4>
                <div className="mt-3 space-y-2 text-xs text-[#6E675F]">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#8C6D27] shrink-0 mt-0.5" />
                    <span>{b.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#8C6D27] shrink-0" />
                    <span>{b.timings}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#8C6D27] shrink-0" />
                    <span className="font-mono text-[#201D22]">{b.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#201D22]/10 flex items-center justify-between text-[11px]">
                <span className="text-[#8C6D27] font-medium">Delivery: Rs. 150 Flat</span>
                <span className="text-[#201D22] font-semibold">Active Kitchen</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
