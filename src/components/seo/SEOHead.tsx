import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any>;
  alternateUrls?: { lang: string; url: string }[];
}

export function SEOHead({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  canonicalUrl,
  noIndex = false,
  structuredData,
  alternateUrls = [],
}: SEOHeadProps) {
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // Update document title
    if (title) {
      document.title = title.includes("Prime Smile") 
        ? title 
        : `${title} | Prime Smile Dental Laboratory`;
    }

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: string) => {
      const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", property);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute("content", content);
    };

    // Basic SEO meta tags
    if (description) updateMetaTag("description", description);
    if (keywords && keywords.length > 0) updateMetaTag("keywords", keywords.join(", "));
    if (noIndex) updateMetaTag("robots", "noindex, nofollow");

    // Open Graph meta tags
    if (ogTitle || title) updateMetaTag("og:title", ogTitle || title!, "property");
    if (ogDescription || description) updateMetaTag("og:description", ogDescription || description!, "property");
    if (ogImage) updateMetaTag("og:image", ogImage, "property");
    updateMetaTag("og:type", "website", "property");
    updateMetaTag("og:site_name", "Prime Smile Dental Laboratory", "property");

    // Twitter Card meta tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:site", "@PrimeSmileLab");
    if (ogTitle || title) updateMetaTag("twitter:title", ogTitle || title!);
    if (ogDescription || description) updateMetaTag("twitter:description", ogDescription || description!);
    if (ogImage) updateMetaTag("twitter:image", ogImage);

    // Canonical URL
    if (canonicalUrl) {
      let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonicalUrl);
    }

    // Alternate language URLs
    alternateUrls.forEach(({ lang, url }) => {
      let link = document.querySelector(`link[rel='alternate'][hreflang='${lang}']`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "alternate");
        link.setAttribute("hreflang", lang);
        document.head.appendChild(link);
      }
      link.setAttribute("href", url);
    });

    // Structured data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector("script[type='application/ld+json']") as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    return () => {
      // Cleanup would be complex, so we'll leave meta tags in place
      // They'll be updated on the next page navigation
    };
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl, noIndex, structuredData, alternateUrls]);

  return null;
}

// Helper functions for common structured data types
export const structuredData = {
  // Organization schema
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Prime Smile Dental Laboratory",
    "url": "https://primesmilelab.com",
    "logo": "https://primesmilelab.com/logo.png",
    "description": "Advanced digital dental laboratory serving UK and Cyprus dentists with precision restorations and prosthetics.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": ["GB", "CY"],
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+44 20 1234 5678",
      "contactType": "customer service",
      "availableLanguage": ["English"],
    },
    "sameAs": [
      "https://www.linkedin.com/company/prime-smile-dental-laboratory",
      "https://www.facebook.com/PrimeSmileLab",
      "https://www.instagram.com/primesmilelab",
    ],
  },

  // Local business schema
  localBusiness: (location: "UK" | "Cyprus") => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Prime Smile Dental Laboratory",
    "description": "Advanced digital dental laboratory",
    "address": location === "UK" ? {
      "@type": "PostalAddress",
      "addressCountry": "GB",
    } : {
      "@type": "PostalAddress",
      "addressCountry": "CY",
    },
    "telephone": location === "UK" ? "+44 20 1234 5678" : "+357 99 123456",
    "openingHours": "Mo-Fr 09:00-17:00",
  }),

  // Service schema
  service: (name: string, description: string) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": name,
    "description": description,
    "provider": {
      "@type": "Organization",
      "name": "Prime Smile Dental Laboratory",
    },
  }),

  // Article schema (for blog posts)
  article: (title: string, description: string, datePublished: string, author: string, image?: string) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "datePublished": datePublished,
    "author": {
      "@type": "Person",
      "name": author,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Prime Smile Dental Laboratory",
    },
    ...(image && { image: image }),
  }),

  // Breadcrumb schema
  breadcrumbs: (breadcrumbs: { name: string; url: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url,
    })),
  }),

  // FAQ schema
  faq: (faqs: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  }),
};

// SEO utility functions
export const seoUtils = {
  // Generate page-specific SEO data
  getPageSEO: (page: string, customData?: Partial<SEOHeadProps>): SEOHeadProps => {
    const baseSEO: Record<string, SEOHeadProps> = {
      home: {
        title: "Prime Smile Dental Laboratory | Advanced Digital Restorations",
        description: "Leading digital dental laboratory in the UK and Cyprus. Specializing in crowns, bridges, implants, and prosthetics with precision and quality.",
        keywords: ["dental laboratory", "digital dentistry", "crowns", "bridges", "implants", "UK", "Cyprus"],
        structuredData: structuredData.organization,
      },
      services: {
        title: "Our Dental Lab Services | Prime Smile",
        description: "Comprehensive dental laboratory services including crowns, bridges, implants, dentures, and more. Digital precision for optimal results.",
        keywords: ["dental services", "crowns", "bridges", "implants", "dentures", "prosthetics"],
      },
      contact: {
        title: "Contact Prime Smile Dental Laboratory",
        description: "Get in touch with our dental laboratory team in the UK and Cyprus. Expert support for all your dental restoration needs.",
        keywords: ["contact", "dental lab", "support", "UK", "Cyprus"],
      },
      submit: {
        title: "Submit a Case | Prime Smile Dental Laboratory",
        description: "Submit your dental cases online through our secure portal. Fast turnaround and expert craftsmanship guaranteed.",
        keywords: ["submit case", "dental prescription", "online submission", "dental lab"],
      },
    };

    return { ...baseSEO[page], ...customData };
  },

  // Generate service-specific SEO
  getServiceSEO: (serviceName: string, description: string): SEOHeadProps => ({
    title: `${serviceName} | Prime Smile Dental Laboratory`,
    description: description,
    keywords: [serviceName.toLowerCase(), "dental laboratory", "digital dentistry"],
    structuredData: structuredData.service(serviceName, description),
  }),

  // Generate case study SEO
  getCaseStudySEO: (title: string, description: string, images: string[]): SEOHeadProps => ({
    title: `${title} | Case Study | Prime Smile`,
    description: description,
    keywords: ["case study", "dental restoration", "before after", "dental lab"],
    ogImage: images[0],
  }),
};
