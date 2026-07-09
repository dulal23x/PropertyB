import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, CheckCircle2, House, MapPin, Search, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About PropertyBikri",
  description: "Learn how PropertyBikri helps buyers, renters, and property owners connect across Bangladesh.",
};

const stats = [
  { label: "Cities Covered", value: "50+" },
  { label: "Active Listings", value: "10,000+" },
  { label: "Verified Support", value: "24/7" },
  { label: "Trusted Process", value: "3-step" },
];

const principles = [
  {
    icon: Search,
    title: "Search that feels simple",
    text: "Find apartments, houses, land, and commercial properties with filters that stay fast, clear, and useful on every screen.",
  },
  {
    icon: ShieldCheck,
    title: "Trust at the center",
    text: "We prioritize verified submissions, clear contact details, and a review process that gives the marketplace more confidence.",
  },
  {
    icon: Building2,
    title: "For every property journey",
    text: "Whether you're buying, renting, or listing, PropertyBikri is designed to help people move from browsing to action with less friction.",
  },
];

const steps = [
  {
    title: "Discover",
    text: "Explore curated listings across Dhaka and beyond with rich details, photos, and practical filters.",
  },
  {
    title: "Compare",
    text: "Narrow the options by purpose, property type, budget, and space so the best matches rise to the top.",
  },
  {
    title: "Connect",
    text: "Reach owners or agents directly and move to the next step with confidence and clear information.",
  },
];

const focusAreas = [
  "Apartments for families",
  "Homes for long-term living",
  "Land for future development",
  "Commercial spaces for businesses",
  "Premium neighborhoods in Dhaka",
  "Growing markets across Bangladesh",
];

export default function AboutPage() {
  return (
    <div className="bg-brand-light text-brand-dark">
      <section className="relative overflow-hidden bg-brand-dark text-white">
        <div className="absolute inset-0">
          <Image
            src="/assets/home/hero/hero-bg.jpg"
            alt="PropertyBikri city skyline background"
            fill
            priority
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark/90 to-black/70" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/90">
                <BadgeCheck size={14} />
                About PropertyBikri
              </div>
              <h1 className="text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">
                A trusted real estate marketplace for Bangladesh.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                PropertyBikri helps people discover, compare, and connect around properties with a cleaner search experience, practical filters, and a stronger sense of trust.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/properties?purpose=buy"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-brand-green/30 transition-all hover:bg-brand-greenHover active:scale-95"
                >
                  Browse Properties
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/post-property"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 active:scale-95"
                >
                  Post Property
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 -top-8 h-28 w-28 rounded-full bg-brand-green/20 blur-3xl" />
              <div className="absolute -bottom-8 -right-8 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
                <div className="overflow-hidden rounded-[24px] bg-white p-5">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-textSecondary">Brand identity</p>
                      <h2 className="mt-2 text-2xl font-black text-brand-dark">PropertyBikri.com</h2>
                    </div>
                    <div className="rounded-full bg-brand-green/10 p-3 text-brand-green">
                      <House size={22} />
                    </div>
                  </div>
                  <div className="rounded-[22px] bg-brand-light p-4">
                    <Image
                      src="/assets/propertybikri-logo.png"
                      alt="PropertyBikri logo"
                      width={1437}
                      height={355}
                      className="h-auto w-full object-contain"
                      priority
                    />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {stats.slice(0, 2).map((item) => (
                      <div key={item.label} className="rounded-2xl border border-gray-100 bg-brand-light p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-brand-textSecondary">{item.label}</p>
                        <p className="mt-2 text-2xl font-black text-brand-dark">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-3xl border border-brand-border bg-white p-6 shadow-sm">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-brand-textSecondary">{item.label}</p>
              <p className="mt-3 text-4xl font-black text-brand-dark">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">Our story</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Built to make property search more human.</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-textSecondary md:text-lg">
              Searching for the right home or investment should feel organized, not overwhelming. PropertyBikri was created to bring structure to that experience with clearer listings, simple navigation, and a cleaner path to contact.
            </p>
            <div className="mt-8 space-y-4">
              {principles.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4 rounded-3xl border border-brand-border bg-white p-5 shadow-sm">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-brand-dark">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-brand-textSecondary">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-[30px] min-h-[320px] shadow-2xl sm:row-span-2">
              <Image
                src="/assets/home/cities/dhaka.jpg"
                alt="Dhaka skyline"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-brand-green">Coverage</p>
                <h3 className="mt-2 text-2xl font-black">Dhaka and growing across Bangladesh</h3>
              </div>
            </div>
            <div className="rounded-[30px] border border-brand-border bg-white p-6 shadow-sm">
              <MapPin className="text-brand-green" size={24} />
              <h3 className="mt-4 text-xl font-black">Local market focus</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary">
                We focus on neighborhoods people actually search for and shape the browsing experience around the way people compare areas.
              </p>
            </div>
            <div className="rounded-[30px] border border-brand-border bg-white p-6 shadow-sm">
              <Sparkles className="text-brand-green" size={24} />
              <h3 className="mt-4 text-xl font-black">Clear presentation</h3>
              <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary">
                Large images, readable prices, and direct actions help users decide faster without losing context.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-brand-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">How we help</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">A simple process from search to contact.</h2>
              <p className="mt-5 text-base leading-relaxed text-brand-textSecondary md:text-lg">
                The platform is designed to reduce friction at every step so users can move from browsing to inquiry without extra clutter.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-[28px] border border-brand-border bg-brand-light p-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green text-white font-black">
                    {index + 1}
                  </div>
                  <h3 className="mt-5 text-xl font-black">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-textSecondary">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-[28px] min-h-[240px] shadow-xl">
              <Image src="/assets/home/cities/chattogram.jpg" alt="Chattogram city" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
            <div className="relative overflow-hidden rounded-[28px] min-h-[240px] shadow-xl">
              <Image src="/assets/home/cities/sylhet.jpg" alt="Sylhet city" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
            <div className="relative overflow-hidden rounded-[28px] min-h-[240px] shadow-xl sm:col-span-2">
              <Image src="/assets/home/projects/projects-promo.jpg" alt="New projects" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-brand-green">Growth areas</p>
                <h3 className="mt-2 text-2xl font-black">Featured markets, new projects, and future possibilities</h3>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">What we cover</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">A marketplace for modern buyers and sellers.</h2>
            <p className="mt-5 text-base leading-relaxed text-brand-textSecondary md:text-lg">
              From city apartments to land opportunities, the platform is built to support the full spectrum of property search and discovery.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {focusAreas.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-brand-border bg-white p-4 shadow-sm">
                  <CheckCircle2 className="shrink-0 text-brand-green" size={20} />
                  <span className="text-sm font-medium text-brand-dark">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">Next step</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Ready to explore or list a property?</h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
                Start browsing live listings or post your own property and reach people actively looking in Bangladesh.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link
                href="/properties?purpose=buy"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-6 py-3 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-brand-green/30 transition-all hover:bg-brand-greenHover active:scale-95"
              >
                Browse Properties
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/post-property"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10 active:scale-95"
              >
                Post Your Property
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
