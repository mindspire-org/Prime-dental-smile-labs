import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { FileCheck, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_marketing/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Prime Smile Dental Laboratory" },
      { name: "description", content: "Terms and conditions for using Prime Smile Dental Laboratory services." },
    ],
    links: [{ rel: "canonical", href: "https://primesmiles.eu/terms-of-service" }],
  }),
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <Reveal>
            <Link to="/" className="text-teal text-sm inline-flex items-center gap-1 hover:gap-2 transition-all mb-4"><ArrowLeft size={14} /> Back to Home</Link>
            <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
            <p className="text-white/70 mt-3">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 space-y-10">
          <Reveal>
            <div className="flex items-start gap-3 mb-3">
              <FileCheck size={20} className="text-teal mt-1 shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-text-slate">1. Agreement to Terms</h2>
                <p className="text-muted-grey mt-2 leading-relaxed">By accessing or using the Prime Smile Dental Laboratory website, portal and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">2. Services Description</h2>
            <p className="text-muted-grey leading-relaxed">Prime Smile Dental Laboratory provides digital dental laboratory services including CAD/CAM milling, SLM metal printing, 3D printing, ceramic sintering, scanning and finishing. All services are performed for licensed dental professionals only.</p>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">3. Account Registration</h2>
            <ul className="space-y-2 text-muted-grey leading-relaxed list-disc pl-5">
              <li>You must be a licensed dental professional or registered clinic to create an account.</li>
              <li>All registration information must be accurate, complete and kept up to date.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">4. Case Submission & Prescription</h2>
            <ul className="space-y-2 text-muted-grey leading-relaxed list-disc pl-5">
              <li>All case submissions require a complete digital prescription with accurate patient information.</li>
              <li>You confirm that you have obtained all necessary patient consent for laboratory work.</li>
              <li>Scan files must be exported correctly in the accepted formats (STL, PLY, OBJ).</li>
              <li>Turnaround times are estimates and may vary based on case complexity and material availability.</li>
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">5. Quality & Remake Policy</h2>
            <ul className="space-y-2 text-muted-grey leading-relaxed list-disc pl-5">
              <li>Every restoration passes multiple quality control checkpoints.</li>
              <li>Remakes within the stated warranty period are free of charge if the issue is due to laboratory error.</li>
              <li>Remakes due to incorrect prescription data, inaccurate impressions or changed clinical conditions are chargeable.</li>
              <li>Claims must be submitted within 30 days of delivery with photographic evidence.</li>
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">6. Payment & Invoicing</h2>
            <p className="text-muted-grey leading-relaxed">Invoices are issued monthly with 30-day payment terms. We accept bank transfer, direct debit and card payments. Late payments may incur interest charges at the rate of 2% per month. Accounts with overdue balances may be suspended until payment is received.</p>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">7. Intellectual Property</h2>
            <p className="text-muted-grey leading-relaxed">All content on this website, including text, graphics, logos and software, is the property of Prime Smile Dental Laboratory. Scan files and case data submitted by you remain your property. We retain the right to use anonymised data for quality improvement and research.</p>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-grey leading-relaxed">To the maximum extent permitted by law, Prime Smile Dental Laboratory shall not be liable for any indirect, incidental or consequential damages arising from the use of our services. Our total liability is limited to the value of the specific case in question.</p>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">9. Governing Law</h2>
            <p className="text-muted-grey leading-relaxed">These Terms are governed by the laws of England and Wales. Any disputes shall be resolved through arbitration or the courts of England and Wales.</p>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">10. Changes to Terms</h2>
            <p className="text-muted-grey leading-relaxed">We may update these Terms from time to time. Continued use of our services after changes constitutes acceptance of the revised Terms. Significant changes will be communicated via email.</p>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">11. Contact</h2>
            <p className="text-muted-grey leading-relaxed">For questions about these Terms, contact us at <a href="mailto:legal@primesmiles.eu" className="text-teal hover:underline">legal@primesmiles.eu</a> or through the <Link to="/contact" className="text-teal hover:underline">Contact</Link> page.</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
