import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { Database, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_marketing/data-notice")({
  head: () => ({
    meta: [
      { title: "Data Notice — Prime Smile Dental Laboratory" },
      { name: "description", content: "How Prime Smile handles patient data, scan files and digital case records." },
    ],
    links: [{ rel: "canonical", href: "https://primesmiles.eu/data-notice" }],
  }),
  component: DataNoticePage,
});

function DataNoticePage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="bg-navy text-white py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <Reveal>
            <Link to="/" className="text-teal text-sm inline-flex items-center gap-1 hover:gap-2 transition-all mb-4"><ArrowLeft size={14} /> Back to Home</Link>
            <h1 className="text-3xl md:text-4xl font-bold">Data Notice</h1>
            <p className="text-white/70 mt-3">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 space-y-10">
          <Reveal>
            <div className="flex items-start gap-3 mb-3">
              <Database size={20} className="text-teal mt-1 shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-text-slate">1. Purpose of this Notice</h2>
                <p className="text-muted-grey mt-2 leading-relaxed">This Data Notice explains how Prime Smile Dental Laboratory processes, stores and protects patient-related data submitted through our digital platform. It applies to all dentists, clinics and patients whose data is handled by our laboratory.</p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">2. Data We Process</h2>
            <ul className="space-y-2 text-muted-grey leading-relaxed list-disc pl-5">
              <li><strong>Patient identifiers:</strong> Name, date of birth, patient reference number (as provided by the dentist).</li>
              <li><strong>Clinical data:</strong> Tooth charts, prescription details, shade information, material selections and implant specifications.</li>
              <li><strong>Digital scans:</strong> STL, PLY, OBJ and DICOM files representing oral anatomy and implant positions.</li>
              <li><strong>Photographs:</strong> Intraoral photos, smile photos and shade reference images submitted for aesthetic matching.</li>
              <li><strong>Communication records:</strong> Messages, case notes and approval records between dentist and laboratory.</li>
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">3. Lawful Basis for Processing</h2>
            <p className="text-muted-grey leading-relaxed">We process personal data on the basis of legitimate interest for the performance of our dental laboratory contract with the submitting dentist, and with the dentist&rsquo;s responsibility as a healthcare provider to arrange patient care. We act as a data processor under the dentist&rsquo;s instructions.</p>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">4. Data Storage & Retention</h2>
            <ul className="space-y-2 text-muted-grey leading-relaxed list-disc pl-5">
              <li>All data is stored on encrypted servers within the United Kingdom.</li>
              <li>Digital case files are retained for 10 years in accordance with dental record-keeping requirements.</li>
              <li>Deleted cases are placed in a 90-day recovery window before permanent deletion.</li>
              <li>Backup copies are encrypted and stored in a separate secure location.</li>
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">5. Data Sharing & Transfers</h2>
            <p className="text-muted-grey leading-relaxed">We do not share patient data with third parties except:</p>
            <ul className="space-y-2 text-muted-grey leading-relaxed list-disc pl-5 mt-2">
              <li>As required by law or regulatory authority.</li>
              <li>With courier partners (DHL, FedEx, UPS) solely for delivery purposes — patient names are minimised on shipping labels.</li>
              <li>With material suppliers for warranty claims, using only anonymised data.</li>
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">6. Your Rights</h2>
            <p className="text-muted-grey leading-relaxed">As a data subject or as a dentist acting on behalf of a patient, you have the right to:</p>
            <ul className="space-y-2 text-muted-grey leading-relaxed list-disc pl-5 mt-2">
              <li>Access your personal data held by us.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of data where legally permissible.</li>
              <li>Restrict processing in certain circumstances.</li>
              <li>Receive data in a portable format.</li>
              <li>Lodge a complaint with the Information Commissioner&rsquo;s Office (ICO).</li>
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">7. Security Measures</h2>
            <ul className="space-y-2 text-muted-grey leading-relaxed list-disc pl-5">
              <li>End-to-end encryption for all data in transit (TLS 1.3).</li>
              <li>AES-256 encryption for data at rest.</li>
              <li>Role-based access control with multi-factor authentication.</li>
              <li>Regular security audits and penetration testing.</li>
              <li>Staff training on data protection and confidentiality.</li>
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">8. Breach Notification</h2>
            <p className="text-muted-grey leading-relaxed">In the unlikely event of a data breach, we will notify affected dentists within 72 hours and will take immediate steps to contain and remediate the incident. We will also report serious breaches to the ICO where required.</p>
          </Reveal>

          <Reveal>
            <h2 className="text-xl font-semibold text-text-slate mb-3">9. Contact</h2>
            <p className="text-muted-grey leading-relaxed">For any questions about this Data Notice or to exercise your data rights, please contact our Data Protection Officer at <a href="mailto:dpo@primesmilelab.com" className="text-teal hover:underline">dpo@primesmilelab.com</a> or through the <Link to="/contact" className="text-teal hover:underline">Contact</Link> page.</p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
