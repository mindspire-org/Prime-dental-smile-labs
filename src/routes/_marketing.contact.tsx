import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Reveal } from "@/components/site/Reveal";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { submitContactForm, validateForm, contactFormSchema, type ContactFormData } from "@/lib/forms";
import { analytics } from "@/components/analytics/GoogleAnalytics";
import { PageBlockRenderer, type BlockItem } from "@/components/site/PageBlockRenderer";

export const Route = createFileRoute("/_marketing/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Prime Smile Dental Laboratory" },
      { name: "description", content: "Get in touch with our digital dental laboratory team in the UK and Cyprus. We respond within 24 hours." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Contact — Prime Smile Dental Laboratory" },
      { property: "og:description", content: "Reach our UK & Cyprus dental lab team. Fast response guaranteed." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://primesmilelab.com/contact" },
    ],
    links: [
      { rel: "canonical", href: "https://primesmilelab.com/contact" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", "name": "Prime Smile Dental Laboratory", "description": "Advanced digital dental laboratory serving UK and Cyprus dentists.", "url": "https://primesmilelab.com", "telephone": "+44 20 1234 5678", "email": "support@primesmilelab.com", "address": { "@type": "PostalAddress", "addressCountry": "GB" }, "openingHours": "Mo-Fr 09:00-17:00", "priceRange": "££", "currenciesAccepted": "GBP" }) },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [cmsBlocks, setCmsBlocks] = useState<BlockItem[]>([]);
  const [cmsLoading, setCmsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/pages/contact")
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => {
        const blocks = (d.page?.blocks || []).sort((a: BlockItem, b: BlockItem) => (a.order ?? 0) - (b.order ?? 0));
        setCmsBlocks(blocks);
      })
      .catch(() => {})
      .finally(() => setCmsLoading(false));
  }, []);

  const [formData, setFormData] = useState<ContactFormData>({
    clinicName: "",
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(contactFormSchema, formData);
    if (!validation.success) {
      setErrors(validation.errors);
      analytics.formSubmit("contact", false);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitContactForm(formData);
      analytics.formSubmit("contact", true);
      analytics.event("contact_form_submit", "engagement", formData.clinicName);
      setIsSubmitted(true);
      
      // Reset form
      setFormData({
        clinicName: "",
        name: "",
        email: "",
        phone: "",
        message: "",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to submit form" });
      analytics.formSubmit("contact", false);
      analytics.error("contact_form_error", "submission_failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCmsBlocks = () => {
    if (cmsLoading) {
      return (
        <div className="animate-pulse space-y-4 py-10 px-5 lg:px-8">
          <div className="h-64 bg-slate-100 rounded-2xl" />
          <div className="h-32 bg-slate-100 rounded-2xl" />
        </div>
      );
    }
    const visibleBlocks = cmsBlocks.filter(b => b.type !== "site-footer");
    if (visibleBlocks.length === 0) return null;
    return (
      <div className="cms-blocks">
        {visibleBlocks.map(block => (
          <PageBlockRenderer key={block.id} type={block.type} props={block.props} />
        ))}
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <>
        {renderCmsBlocks()}
        <section className="bg-white py-20">
          <div className="max-w-2xl mx-auto px-5 lg:px-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-teal/10 text-teal flex items-center justify-center mb-6">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-3xl font-bold mb-4">Thank You for Your Enquiry</h1>
            <p className="text-muted-grey text-lg mb-8">
              We've received your message and will get back to you within 24 hours. For urgent matters, please call us directly.
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="btn-outline-teal"
            >
              Send Another Message
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {renderCmsBlocks()}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <Reveal delay={0.1}>
          <form className="bg-bg-soft p-8 rounded-2xl space-y-5" onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold">Send an Enquiry</h2>
            
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5" />
                <span className="text-sm text-red-700">{errors.submit}</span>
              </div>
            )}

            {[
              { l: "Clinic Name", n: "clinicName", t: "text", required: true },
              { l: "Your Name", n: "name", t: "text", required: true },
              { l: "Email", n: "email", t: "email", required: true },
              { l: "Phone", n: "phone", t: "tel", required: true },
            ].map((f) => (
              <div key={f.n}>
                <label className="block text-xs font-semibold text-teal uppercase tracking-wider mb-1.5">
                  {f.l} {f.required && "*"}
                </label>
                <input 
                  type={f.t} 
                  name={f.n}
                  value={formData[f.n as keyof ContactFormData] as string}
                  onChange={handleInputChange}
                  required 
                  className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-2 focus:ring-teal/20 outline-none transition ${
                    errors[f.n] 
                      ? "border-red-300 focus:border-red-500" 
                      : "border-border-silver focus:border-teal"
                  }`}
                />
                {errors[f.n] && (
                  <p className="mt-1 text-xs text-red-600">{errors[f.n]}</p>
                )}
              </div>
            ))}
            
            <div>
              <label className="block text-xs font-semibold text-teal uppercase tracking-wider mb-1.5">
                Message *
              </label>
              <textarea 
                rows={5} 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required 
                className={`w-full px-4 py-3 rounded-lg border bg-white focus:ring-2 focus:ring-teal/20 outline-none transition resize-none ${
                  errors.message 
                    ? "border-red-300 focus:border-red-500" 
                    : "border-border-silver focus:border-teal"
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-600">{errors.message}</p>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send Enquiry"} <Send size={16}/>
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  </>
  );
}
