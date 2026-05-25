import { Link } from "@tanstack/react-router";
import { Linkedin, Facebook, Instagram, Mail } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-navy text-white/85 mt-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="font-bold text-xl mb-4">
            <span className="text-teal">Prime Smile</span> Dental Laboratory
            <span className="inline-block w-2 h-2 rounded-full bg-teal ml-1 align-middle" />
          </div>
          <p className="text-sm text-white/60 leading-relaxed max-w-sm">
            Advanced digital dental laboratory serving UK and Cyprus dentists. Focused on precision,
            quality, and long-term results. All cases handled with strict confidentiality.
          </p>
          <div className="flex gap-3 mt-5">
            {[Linkedin, Facebook, Instagram, Mail].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-teal hover:text-teal transition">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Lab Services", links: [["Fixed Restorations", "/services/fixed-restorations"], ["Implant Prosthetics", "/services/implant-prosthetics"], ["Removable Prosthetics", "/services/removable-prosthetics"], ["Metal Frameworks", "/services/metal-frameworks"], ["Splints & Guards", "/services/splints-guards"]] },
          { title: "Digital Workflow", links: [["How It Works", "/workflow"], ["Digital Prescription", "/workflow"], ["Case Tracking", "/workflow"], ["File Upload", "/workflow"]] },
          { title: "Resources", links: [["Quality & Compliance", "/quality"], ["Technology", "/technology"], ["Contact", "/contact"], ["Dentist Portal", "/portal"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
            <ul className="space-y-2.5 text-sm">
              {col.links.map(([l, t]) => (
                <li key={l}><Link to={t} className="text-white/60 hover:text-teal transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5 flex flex-col md:flex-row justify-between gap-3 text-xs text-white/45">
          <div className="flex flex-col gap-1">
            <div>© {new Date().getFullYear()} Prime Smile Dental Laboratory. All rights reserved.</div>
            <div className="text-white/25">Developed &amp; Designed by <a href="https://mindspire.org" target="_blank" rel="noopener noreferrer" className="text-teal/60 hover:text-teal transition-colors">Mindspire</a> &mdash; <a href="https://mindspire.org" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white/60 transition-colors">mindspire.org</a></div>
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-teal">Privacy Policy</a>
            <a href="#" className="hover:text-teal">Terms of Service</a>
            <a href="#" className="hover:text-teal">Data Notice</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
