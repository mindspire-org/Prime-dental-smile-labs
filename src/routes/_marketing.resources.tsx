import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { FileText, Gem, Palette, Crosshair, Upload, Clock, Package, HelpCircle, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/_marketing/resources")({
  head: () => ({
    meta: [
      { title: "Resources — Prime Smile Dental Laboratory" },
      { name: "description", content: "Prescription guides, material selection, shade taking tips, implant case requirements, file upload instructions and FAQs for dentists." },
    ],
    links: [{ rel: "canonical", href: "https://primesmilelab.com/resources" }],
  }),
  component: ResourcesPage,
});

const SECTIONS = [
  {
    id: "prescription",
    icon: FileText,
    title: "Prescription Guide",
    desc: "Help dentists complete the digital prescription correctly every time.",
    items: [
      { q: "What patient information is required?", a: "Patient name, date of birth, gender and a unique patient reference number. This ensures proper case tracking and confidentiality." },
      { q: "How do I fill the tooth chart correctly?", a: "Use the interactive tooth chart to mark each unit clearly: preparation shade, material choice, restoration type (crown/bridge/veneer) and any special margin design requirements." },
      { q: "What implant details must I provide?", a: "Implant brand, system, platform size, scanbody type, connection type (internal/external/conical) and retention preference (screw-retained or cement-retained)." },
      { q: "What shade information do you need?", a: "Shade system (VITA Classical, VITA 3D-Master), body shade, cervical shade, incisal shade, stump shade and gingiva shade. Always include photos for anterior cases." },
      { q: "Upload checklist — what files should I attach?", a: "Intraoral or impression scan (STL/PLY/OBJ), bite registration, patient photos (for anterior shade matching), CBCT/DICOM for implant cases, and any previous restoration photos." },
    ],
  },
  {
    id: "materials",
    icon: Gem,
    title: "Material Selection Guide",
    desc: "Choose the right material for every case with confidence.",
    items: [
      { q: "When should I choose zirconia?", a: "Zirconia is ideal for posterior crowns, bridges and full-arch restorations where high flexural strength (up to 1,200 MPa) is required. It offers excellent aesthetics with modern multi-layered discs." },
      { q: "What are the indications for lithium disilicate (e.max)?", a: "e.max is the material of choice for anterior crowns, veneers and inlays/onlays where translucency and natural light transmission are critical. Moderate strength (360–400 MPa) suits most anterior applications." },
      { q: "When is PFM still the right choice?", a: "PFM (porcelain-fused-to-metal) remains useful for long-span bridges, cases with limited vertical space, or when maximum mechanical retention is needed on compromised abutments." },
      { q: "Which metal do you use for frameworks?", a: "We use CE-certified cobalt-chrome (CoCr) for SLM-printed frameworks and Titanium Grade 5 for custom abutments. Both are biocompatible and validated for dental prosthetics." },
      { q: "What is PMMA used for?", a: "PMMA (polymethyl methacrylate) is used for temporary crowns, bridges and try-ins. It mills easily, provides good aesthetics and is cost-effective for provisional restorations." },
      { q: "Which resin should I specify for splints and guides?", a: "Asiga DentaGUIDE for surgical guides (rigid, sterilisable) and Asiga DentaCLEAR or polypropylene for splints and night guards (flexible, durable)." },
    ],
  },
  {
    id: "shade",
    icon: Palette,
    title: "Shade Taking Guide",
    desc: "Improve aesthetic outcomes with better shade communication.",
    items: [
      { q: "What is the best lighting for shade matching?", a: "Use natural daylight (5,500–6,500K) or a calibrated dental colour-corrected light. Avoid direct sunlight, yellow-tinted bulbs and mixed lighting conditions." },
      { q: "How should I position the shade tab?", a: "Hold the shade tab adjacent to the tooth being matched, at the same vertical level. Match the middle third of the natural tooth to the body shade of the tab." },
      { q: "What is stump shade and why does it matter?", a: "The stump shade is the colour of the prepared tooth. For all-ceramic crowns and veneers, a darker stump shade requires more opaque material to mask the underlying colour. Always provide the stump shade." },
      { q: "Should I include gingiva shade?", a: "Yes, for restorations with gingival emergence profiles or pink porcelain. Provide the VITA shade for the gingival margin using a soft-tissue shade guide." },
      { q: "What photo requirements do you have for anterior cases?", a: "Send high-resolution photos: full-face smile, retracted frontal view, lateral view, occlusal view and a close-up of the shade tab held next to the target tooth. Use a grey card for white balance reference." },
    ],
  },
  {
    id: "implant",
    icon: Crosshair,
    title: "Implant Case Requirements",
    desc: "Provide everything needed for a smooth implant restoration workflow.",
    items: [
      { q: "What implant brand and system details do you need?", a: "Brand (Straumann, Nobel, Astra, etc.), system name, platform size and connection type. This allows us to match the correct scanbody library and components." },
      { q: "Which scanbody should I send?", a: "Use the original scanbody from the implant manufacturer. Provide the scanbody type, lot number and any calibration data if available." },
      { q: "What retention type should I choose?", a: "Screw-retained is preferred for full-arch and multi-unit cases. Cement-retained offers better aesthetics for single crowns but requires careful cement management. Specify your preference clearly." },
      { q: "Do you need the screw access position?", a: "Yes. Indicate the desired screw access position (buccal, occlusal, palatal) so we can design the abutment and crown accordingly." },
      { q: "Should I include original implant components?", a: "Include healing abutments, scanbodies and any original parts needed for verification. If unsure, send a photo of the implant package showing the exact model and platform." },
    ],
  },
  {
    id: "upload",
    icon: Upload,
    title: "File Upload Instructions",
    desc: "Send files correctly to avoid technical errors and delays.",
    items: [
      { q: "What file formats do you accept?", a: "STL, PLY and OBJ for scans. DICOM for CBCT. ZIP for multiple files. JPG/PNG for photos. PDF for prescriptions and documents." },
      { q: "How do I export files from my intraoral scanner?", a: "Export as STL in millimetre units. Ensure the file is not compressed or corrupted. For TRIOS, use the export function with occlusion data included. For iTero, request STL export from your representative." },
      { q: "Can I ZIP large folders?", a: "Yes. ZIP folders containing multiple STL files, DICOM series or photo sets. Name the ZIP file clearly: [ClinicName]_[PatientRef]_[Date].zip" },
      { q: "What naming format should I use?", a: "Use a consistent format: ClinicName_PatientRef_CaseType_Date. Example: PrimeSmile_12345_CrownBridge_20250628.zip" },
      { q: "What are the upload limits?", a: "Individual files up to 500 MB. ZIP archives up to 2 GB. For larger DICOM datasets, contact us for secure transfer options." },
    ],
  },
  {
    id: "turnaround",
    icon: Clock,
    title: "Turnaround Times",
    desc: "Set expectations with clear delivery timelines.",
    items: [
      { q: "What is the standard turnaround for a zirconia crown?", a: "Standard zirconia crowns are dispatched within 3–5 working days from case receipt and digital approval." },
      { q: "Do you offer express turnaround?", a: "Yes. Express turnaround (1–2 working days) is available for select services including zirconia crowns and PMMA temporaries. Contact us to confirm availability before submission." },
      { q: "How long do try-ins take?", a: "Try-in restorations (PMMA or wax) are typically ready within 2–3 working days. Express try-ins available in 24 hours for local clinics." },
      { q: "What about complex implant or full-arch cases?", a: "Complex implant cases and full-arch restorations require 7–14 working days depending on design complexity, abutment approval cycles and material selection." },
      { q: "Does shipping time affect the total turnaround?", a: "Turnaround times refer to lab production only. Shipping via DHL Express (UK) adds 1 day, and FedEx International (Cyprus) adds 2–3 days. Factor this into your treatment planning." },
    ],
  },
  {
    id: "shipping",
    icon: Package,
    title: "Packaging & Shipping",
    desc: "Send physical cases safely and track every delivery.",
    items: [
      { q: "How should I pack impressions and models?", a: "Wrap impressions in damp paper towels and seal in a plastic bag. Place models in bubble wrap inside a rigid box. Include the printed case sheet on top of the package." },
      { q: "What is the courier address?", a: "Prime Smile Dental Laboratory, Unit 12, Technology Park, 123 Lab Lane, London, EC1A 1BB, UK. Full address is available in your portal dashboard." },
      { q: "Will I receive a tracking number?", a: "Yes. Tracking numbers are automatically added to your case record in the Dentist Portal when dispatch is confirmed. You will also receive an email notification." },
      { q: "Which courier options do you offer?", a: "DHL Express (overnight UK), FedEx International (Cyprus, 2–3 days), UPS Standard (3–5 days multi-region) and same-day local courier for nearby clinics." },
      { q: "Do you provide return packaging?", a: "For registered clinics, we can include a pre-paid return label. Contact us to arrange a regular collection schedule." },
    ],
  },
  {
    id: "faq",
    icon: HelpCircle,
    title: "Frequently Asked Questions",
    desc: "Quick answers to common dentist questions.",
    items: [
      { q: "How do I create an account?", a: "Click 'Create Dentist Account' on the portal page or contact us directly. We will verify your GDC registration and clinic details before activation." },
      { q: "How do I submit a case?", a: "Log in to the portal, click 'Submit New Case', fill the digital prescription form, upload your scan files and confirm. You will receive a case reference number immediately." },
      { q: "Can I upload TRIOS scans directly?", a: "Yes. TRIOS scans export as STL via the My3Shape portal or directly from the TRIOS software. Upload the STL file with occlusion data included." },
      { q: "What happens if a case needs a remake?", a: "Remakes within warranty are free of charge. Contact us via the portal or email with the case reference number and photos of the issue. We prioritise remake cases." },
      { q: "How do I make a payment?", a: "Invoices are sent monthly with 30-day payment terms. We accept bank transfer, direct debit and card payments through the portal." },
      { q: "How is patient data protected?", a: "All patient data is encrypted in transit and at rest. We are GDPR-compliant and never share patient information with third parties. Access logs are maintained for audit purposes." },
    ],
  },
];

function ResourcesPage() {
  return (
    <div>
      <section className="bg-navy text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: "linear-gradient(var(--teal) 1px, transparent 1px), linear-gradient(90deg, var(--teal) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-5 lg:px-8">
          <Reveal>
            <span className="eyebrow text-teal!">Resources</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold">Dentist Resources</h1>
            <p className="mt-6 text-lg text-white/80 max-w-3xl">
              Everything you need to submit cases correctly, choose materials wisely, and get the best results from our lab.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 space-y-16">
          {SECTIONS.map((section) => (
            <Reveal key={section.id}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-11 h-11 rounded-lg bg-teal/10 text-teal flex items-center justify-center shrink-0">
                  <section.icon size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-text-slate">{section.title}</h2>
                  <p className="text-muted-grey mt-1">{section.desc}</p>
                </div>
              </div>
              <div className="space-y-2">
                {section.items.map((item, i) => (
                  <details key={i} className="group rounded-xl border border-border-silver bg-bg-soft overflow-hidden">
                    <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer font-medium text-text-slate hover:bg-white transition">
                      <span>{item.q}</span>
                      <ChevronDown size={16} className="text-teal group-open:rotate-180 transition-transform shrink-0 ml-4" />
                    </summary>
                    <div className="px-5 pb-4 text-sm text-muted-grey leading-relaxed bg-white">{item.a}</div>
                  </details>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-bg-soft py-16">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 text-center">
          <Reveal>
            <h2 className="text-2xl font-semibold">Still have questions?</h2>
            <p className="text-muted-grey mt-3 max-w-xl mx-auto">Our technical team is available to answer any questions about case submission, material selection or complex implant workflows.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="btn-teal">Contact Technical Support</Link>
              <Link to="/portal" className="btn-outline-teal">Go to Portal</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
