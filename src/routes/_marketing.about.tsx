import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { Placeholder } from "@/components/site/Placeholder";

export const Route = createFileRoute("/_marketing/about")({
  head: () => ({
    meta: [
      { title: "About Us — Prime Smile Dental Laboratory" },
      { name: "description", content: "Our facility, our story, and our commitment to digital dentistry in the UK and Cyprus." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "About Us — Prime Smile Dental Laboratory" },
      { property: "og:description", content: "Learn about our state-of-the-art digital dental laboratory serving UK & Cyprus dentists." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://primesmilelab.com/about" },
    ],
    links: [
      { rel: "canonical", href: "https://primesmilelab.com/about" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <Reveal>
          <span className="eyebrow">Facility</span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold inline-block border-b-4 border-teal pb-2">About Prime Smile</h1>
          <p className="mt-6 text-lg text-muted-grey leading-relaxed">
            Prime Smile is a fully digital dental laboratory operating across the UK and Cyprus. We partner with dental clinics
            who demand precision, accountability and consistent results.
          </p>
        </Reveal>
        <Placeholder label="Facility Photo" className="mt-12 aspect-16/8" />
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {[
            { t: "Our Story", d: "Founded by a team of master technicians who saw the future was digital. We invested early in CAD/CAM, SLM printing and validated workflows." },
            { t: "Our Mission", d: "To make precision dental restoration accessible to every dentist through fully traceable, digitally-managed lab work." },
            { t: "Our Standards", d: "ISO 9001 and ISO 13485 certified. CE-certified materials only. Six checkpoints per case. Zero compromises." },
          ].map((b) => (
            <div key={b.t}>
              <h3 className="font-semibold text-lg text-teal">{b.t}</h3>
              <p className="text-sm text-muted-grey mt-2 leading-relaxed">{b.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
