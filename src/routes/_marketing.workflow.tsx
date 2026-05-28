import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { CheckCircle2, Truck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_marketing/workflow")({
  head: () => ({
    meta: [
      { title: "Digital Workflow — Prime Smile Dental Laboratory" },
      { name: "description", content: "Submit cases digitally with full tracking from prescription to dispatch. Seamless case management for UK & Cyprus dentists." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Digital Workflow — Prime Smile Dental Laboratory" },
      { property: "og:description", content: "Submit cases digitally with full tracking from prescription to dispatch." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://primesmilelab.com/workflow" },
    ],
    links: [
      { rel: "canonical", href: "https://primesmilelab.com/workflow" },
    ],
  }),
  component: WorkflowPage,
});

const STEPS = ["Submitted","File Review","Awaiting Information","Design Stage","Dentist Approval","In Production","Finishing","Quality Control","Ready for Dispatch","Dispatched","Completed"];

function WorkflowPage() {
  return (
    <div>
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <Reveal>
            <span className="eyebrow">Modern Approach</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold">Our Digital Workflow</h1>
            <p className="mt-6 text-muted-grey max-w-3xl text-lg">
              From the moment you log in to the moment your case is delivered, every step is digital, traceable and tracked in real time.
            </p>
          </Reveal>

          <Stagger className="mt-16 grid md:grid-cols-5 gap-6 relative">
            {["Register / Login","Fill Digital Prescription","Upload Scans & Files","Track Your Case Live","Receive Finished Work"].map((s,i) => (
              <StaggerItem key={s} className="text-center">
                <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center font-bold mx-auto shadow-[0_4px_18px_rgba(10,171,189,.4)]">{i+1}</div>
                <div className="mt-3 font-semibold text-sm">{s}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-bg-soft py-20">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="eyebrow">Digital Prescription</span>
            <h2 className="mt-3 text-3xl font-semibold">A complete prescription, every time.</h2>
            <p className="mt-5 text-muted-grey leading-relaxed">
              Our 10-step digital prescription captures everything we need: clinic info, patient ref, service, tooth chart, materials, shade,
              implant details, scan files and shipping. No more paper, no more missing info.
            </p>
            <h3 className="mt-8 font-semibold text-sm uppercase tracking-wider text-text-slate">Accepted file types</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {["STL","PLY","OBJ","DICOM","ZIP","JPG","PDF"].map((f) => (
                <span key={f} className="px-3 py-1.5 rounded bg-teal text-white text-xs font-bold">{f}</span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-2xl overflow-hidden shadow-[0_4px_32px_rgba(0,0,0,0.1)] aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=80&auto=format&fit=crop"
                alt="Digital CAD workflow"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <Reveal>
            <span className="eyebrow">Case Status Timeline</span>
            <h2 className="mt-3 text-3xl font-semibold">Live status, every step of the way</h2>
          </Reveal>
          <ol className="mt-12 space-y-3 relative">
            <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border-silver"/>
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-4 relative">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${i < 5 ? "bg-teal text-white" : "bg-white border-2 border-border-silver text-muted-grey"}`}>
                  {i + 1}
                </span>
                <span className={i < 5 ? "font-semibold text-text-slate" : "text-muted-grey"}>{s}</span>
                {i === 4 && <span className="ml-auto text-xs font-medium text-teal bg-teal/10 px-2 py-1 rounded">Active</span>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-bg-soft py-16">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-teal text-white flex items-center justify-center shrink-0"><Truck/></div>
          <div>
            <h3 className="font-semibold text-lg">Logistics & Tracking</h3>
            <p className="text-muted-grey mt-2 leading-relaxed">
              Cases are dispatched via DHL or UPS with full digital tracking. You will receive notifications at dispatch and delivery,
              with tracking numbers visible directly in your dentist portal.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-center">
        <Link to="/portal" className="btn-teal">Login to Portal <ArrowRight size={16}/></Link>
      </section>
    </div>
  );
}
