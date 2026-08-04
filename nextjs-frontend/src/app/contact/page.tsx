import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, PhoneCall } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact PropertyBikri",
  description: "Contact PropertyBikri for property listing support, advertising questions, and real estate inquiries in Bangladesh.",
};

const contactOptions = [
  {
    icon: PhoneCall,
    title: "Call",
    value: "+880 1717-849009",
    href: "tel:+8801717849009",
  },
  {
    icon: Mail,
    title: "Email",
    value: "info@propertybikri.com",
    href: "mailto:info@propertybikri.com",
  },
  {
    icon: MapPin,
    title: "Market",
    value: "Dhaka, Bangladesh",
    href: "/properties?city=dhaka",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-brand-light text-brand-dark">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-[12px] font-black uppercase tracking-[0.28em] text-brand-green">Contact</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">Talk to PropertyBikri.</h1>
          <p className="mt-5 text-base leading-relaxed text-brand-textSecondary md:text-lg">
            Reach our team for listing support, property promotion, buyer inquiries, or account help.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {contactOptions.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm transition-all hover:border-brand-green hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
                  <Icon size={22} />
                </div>
                <h2 className="mt-5 text-xl font-black">{item.title}</h2>
                <p className="mt-2 text-sm font-bold text-brand-textSecondary">{item.value}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-brand-border bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-black">Property listing help</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-textSecondary">
            For faster support, include the property title, location, listing purpose, and the phone number connected to your submission.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/post-property" className="rounded bg-brand-green px-5 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-brand-greenHover">
              Post Property
            </Link>
            <Link href="/advertise" className="rounded border border-brand-border px-5 py-3 text-xs font-black uppercase tracking-widest text-brand-dark hover:border-brand-green">
              Advertise
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
