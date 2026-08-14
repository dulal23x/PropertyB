import { MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#f8f6f0] pb-8 pt-12 text-black md:pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:grid-cols-6 lg:gap-8">
          <div className="order-last flex flex-col items-center text-center md:order-none md:col-span-2 md:items-start md:text-left lg:col-span-1">
            <a href="/" aria-label="PropertyBikri home" className="inline-flex">
              <img
                src="/assets/propertybikri-logo.png"
                alt="PropertyBikri logo"
                className="h-auto w-[190px] object-contain"
              />
            </a>
            <a
              href="https://abcbangla24.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ABCBangla24 website"
              className="mt-5 inline-flex"
            >
              <img
                src="/assets/abcbangla24-logo.webp"
                alt="ABCBangla24 logo"
                className="h-auto w-[160px] object-contain"
              />
            </a>
          </div>
          <div className="text-left">
            <h3 className="mb-5 inline-block border-b border-gray-300 pb-2 text-[15px] font-black uppercase tracking-[0.1em]">Popular for Sale</h3>
            <ul className="space-y-3 text-sm font-medium text-gray-800">
              <li><a href="/properties?purpose=sale&area_name=Gulshan" className="transition-colors hover:text-brand-green">Apartments for sale in Gulshan</a></li>
              <li><a href="/properties?purpose=sale&area_name=Banani" className="transition-colors hover:text-brand-green">Apartments for sale in Banani</a></li>
              <li><a href="/properties?purpose=sale&area_name=Dhanmondi" className="transition-colors hover:text-brand-green">Apartments for sale in Dhanmondi</a></li>
              <li><a href="/properties?purpose=sale&area_name=Uttara" className="transition-colors hover:text-brand-green">Apartments for sale in Uttara</a></li>
              <li><a href="/properties?purpose=sale&area_name=Bashundhara" className="transition-colors hover:text-brand-green">Apartments for sale in Bashundhara</a></li>
            </ul>
          </div>
          <div className="text-left">
            <h3 className="mb-5 inline-block border-b border-gray-300 pb-2 text-[15px] font-black uppercase tracking-[0.1em]">Land for Sale</h3>
            <ul className="space-y-3 text-sm font-medium text-gray-800">
              <li><a href="/properties?purpose=sale&property_type=land&area_name=Purbachal" className="transition-colors hover:text-brand-green">Land for sale in Purbachal</a></li>
              <li><a href="/properties?purpose=sale&property_type=land&area_name=Bashundhara" className="transition-colors hover:text-brand-green">Land for sale in Bashundhara</a></li>
              <li><a href="/properties?purpose=sale&property_type=land&area_name=Uttara" className="transition-colors hover:text-brand-green">Land for sale in Uttara</a></li>
              <li><a href="/properties?purpose=sale&property_type=land&area_name=Baridhara" className="transition-colors hover:text-brand-green">Land for sale in Baridhara</a></li>
            </ul>
          </div>
          <div className="text-left">
            <h3 className="mb-5 inline-block border-b border-gray-300 pb-2 text-[15px] font-black uppercase tracking-[0.1em]">House for Sale</h3>
            <ul className="space-y-3 text-sm font-medium text-gray-800">
              <li><a href="/properties?purpose=sale&property_type=house&area_name=Gulshan" className="transition-colors hover:text-brand-green">House for sale in Gulshan</a></li>
              <li><a href="/properties?purpose=sale&property_type=house&area_name=Banani" className="transition-colors hover:text-brand-green">House for sale in Banani</a></li>
              <li><a href="/properties?purpose=sale&property_type=house&area_name=Dhanmondi" className="transition-colors hover:text-brand-green">House for sale in Dhanmondi</a></li>
              <li><a href="/properties?purpose=sale&property_type=house&area_name=Uttara" className="transition-colors hover:text-brand-green">House for sale in Uttara</a></li>
            </ul>
          </div>
          <div className="text-left">
            <h3 className="mb-5 inline-block border-b border-gray-300 pb-2 text-[15px] font-black uppercase tracking-[0.1em]">Corporate</h3>
            <ul className="space-y-3 text-sm font-medium text-gray-800">
              <li><a href="/about" className="transition-colors hover:text-brand-green">About Us</a></li>
              <li><a href="/contact" className="transition-colors hover:text-brand-green">Contact Us</a></li>
              <li><a href="/careers" className="transition-colors hover:text-brand-green">Careers</a></li>
              <li><a href="/terms" className="transition-colors hover:text-brand-green">Terms & Conditions</a></li>
              <li><a href="/privacy" className="transition-colors hover:text-brand-green">Privacy Policy</a></li>
              <li><a href="/advertise" className="transition-colors hover:text-brand-green">Advertise with Us</a></li>
            </ul>
          </div>
          <div className="text-left">
            <h3 className="mb-5 inline-block border-b border-gray-300 pb-2 text-[15px] font-black uppercase tracking-[0.1em]">Connect With Us</h3>
            <div className="mb-6 flex flex-wrap justify-start gap-4">
              <a
                href="https://www.facebook.com/propertybikri/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PropertyBikri Facebook page"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-all hover:-translate-y-1 hover:bg-brand-green"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                <span className="sr-only">PropertyBikri</span>
              </a>
            </div>
            <div className="space-y-4 text-sm font-semibold leading-6 text-black">
              <a href="https://wa.me/8801717849009" target="_blank" rel="noopener noreferrer" className="flex items-start justify-start gap-3 transition-colors hover:text-brand-green">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.52 3.48A11.84 11.84 0 0 0 12.09 0C5.48 0 .09 5.38.09 12c0 2.11.55 4.18 1.61 6L0 24l6.16-1.62A11.91 11.91 0 0 0 12.09 24C18.7 24 24 18.62 24 12c0-3.2-1.24-6.21-3.48-8.52ZM12.09 21.96c-1.82 0-3.61-.49-5.16-1.42l-.37-.22-3.65.96.98-3.56-.24-.38A9.86 9.86 0 0 1 2.13 12c0-5.5 4.47-9.96 9.96-9.96 2.66 0 5.16 1.04 7.04 2.92A9.88 9.88 0 0 1 21.96 12c0 5.5-4.38 9.96-9.87 9.96Zm5.46-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35Z" /></svg>
                <span className="text-[18px] md:text-sm">+8801717-849009</span>
              </a>
              <p className="flex items-start justify-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                <span>Level 5, Navana HR Tower-1, Gulshan Link Road, 1208, Dhaka, Bangladesh</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-300 pt-8 text-center text-xs font-bold uppercase tracking-widest text-gray-700 md:flex-row md:text-left">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <a href="/" className="hover:text-brand-green">PropertyBikri</a>, a concern of{" "}
            <a href="https://abcbangla24.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand-green">
              ABCBangla24 Group
            </a>. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:justify-start md:gap-6">
            <a href="/sitemap" className="hover:text-brand-green">Sitemap</a>
            <a href="/cookies" className="hover:text-brand-green">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
