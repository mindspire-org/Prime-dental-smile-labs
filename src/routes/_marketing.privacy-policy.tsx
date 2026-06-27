import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { Shield, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_marketing/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Prime Smile Dental Laboratory" },
      { name: "description", content: "How Prime Smile Dental Laboratory collects, uses and protects your personal data." },
    ],
    links: [{ rel: "canonical", href: "https://primesmiles.eu/privacy-policy" }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <Reveal>
            <Link to="/" className="text-teal text-sm inline-flex items-center gap-1 hover:gap-2 transition-all mb-4"><ArrowLeft size={14} /> Back to Home</Link>
            <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
            <p className="text-white/70 mt-3">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 space-y-10">
          <Reveal>
            <div className="flex items-start gap-3 mb-3">
              <Shield size={20} className="text-teal mt-1 shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-text-slate">1. Introduction</h2>
                <p className="text-muted-grey mt-2 leading-relaxed">Prime Smile Dental Laboratory (&ldquo;we&rdquo;, &ldquo;our&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store and safeguard your personal information when you use our website, portal and services.</p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">2. Information We Collect</h2>
            <ul className="space-y-2 text-muted-grey leading-relaxed list-disc pl-5">
              <li><strong>Account information:</strong> Name, email address, phone number, clinic name, GDC number and password when you register.</li>
              <li><strong>Case data:</strong> Patient references, tooth charts, prescription details, scan files and materials used for dental laboratory work.</li>
              <li><strong>Technical data:</strong> IP address, browser type, device information and usage analytics to improve our platform.</li>
              <li><strong>Communication:</strong> Messages exchanged through the portal for case clarification and support.</li>
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-2 text-muted-grey leading-relaxed list-disc pl-5">
              <li>To provide and manage our dental laboratory services.</li>
              <li>To process and track your cases through our digital workflow.</li>
              <li>To communicate with you about case status, dispatch and support.</li>
              <li>To maintain the security and integrity of our platform.</li>
              <li>To comply with legal and regulatory obligations.</li>
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">4. Data Protection & Security</h2>
            <p className="text-muted-grey leading-relaxed">All data is encrypted in transit (TLS 1.3) and at rest. We use industry-standard security measures including access controls, audit logs and regular vulnerability assessments. We never sell or share your personal data with third parties for marketing purposes.</p>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">5. Patient Data & Confidentiality</h2>
            <p className="text-muted-grey leading-relaxed">We treat all patient information as strictly confidential. Case files, scan data and prescription details are accessible only to authorised lab technicians and the submitting dentist. We comply with UK GDPR and Cyprus data protection regulations.</p>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">6. Cookies & Tracking</h2>
            <p className="text-muted-grey leading-relaxed">We use essential cookies for authentication and session management. Analytics cookies help us understand platform usage. You can disable non-essential cookies in your browser settings.</p>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">7. Your Rights</h2>
            <p className="text-muted-grey leading-relaxed">You have the right to access, correct, delete or restrict processing of your personal data. To exercise these rights, contact us at <a href="mailto:privacy@primesmiles.eu" className="text-teal hover:underline">privacy@primesmiles.eu</a>.</p>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">8. Contact Us</h2>
            <p className="text-muted-grey leading-relaxed">If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@primesmiles.eu" className="text-teal hover:underline">privacy@primesmiles.eu</a> or through the <Link to="/contact" className="text-teal hover:underline">Contact</Link> page.</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
