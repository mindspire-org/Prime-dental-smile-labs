const IMAGE_MAP: Record<string, string> = {
  // Hero — dental lab milling machine / CAD-CAM environment
  "hero":              "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1600&q=80&auto=format&fit=crop",
  "hero — lab facility photo": "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1600&q=80&auto=format&fit=crop",
  "lab facility":      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1600&q=80&auto=format&fit=crop",
  // Zirconia — ceramic dental prosthetics / disc
  "zircon":            "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80&auto=format&fit=crop",
  "zirconia":          "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80&auto=format&fit=crop",
  "crown":             "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80&auto=format&fit=crop",
  // Porcelain — ceramic lab finishing / layering
  "porcelain":         "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80&auto=format&fit=crop",
  "bridge":            "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80&auto=format&fit=crop",
  // Implants — titanium implant components
  "implants":          "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80&auto=format&fit=crop",
  "implant":           "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80&auto=format&fit=crop",
  // Inlays — precision lab work under magnification
  "inlays":            "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=80&auto=format&fit=crop",
  "inlays / onlays":   "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=80&auto=format&fit=crop",
  // Equipment / technology — CAD/CAM scanner, milling
  "materials & equipment": "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80&auto=format&fit=crop",
  "technology":        "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&q=80&auto=format&fit=crop",
  // Production / workflow — lab technician at bench
  "production timeline":   "https://images.unsplash.com/photo-1581093806997-124204d9fa9d?w=800&q=80&auto=format&fit=crop",
  "production management": "https://images.unsplash.com/photo-1581093806997-124204d9fa9d?w=800&q=80&auto=format&fit=crop",
  "workflow":          "https://images.unsplash.com/photo-1581093806997-124204d9fa9d?w=1200&q=80&auto=format&fit=crop",
  // About / facility — modern dental lab interior
  "about":             "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80&auto=format&fit=crop",
  // Team — lab technicians working
  "team":              "https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?w=800&q=80&auto=format&fit=crop",
  // Quality — precision measurement / inspection
  "quality":           "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&q=80&auto=format&fit=crop",
  // Contact — lab reception / modern facility
  "contact":           "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80&auto=format&fit=crop",
  // News / service — lab environment
  "news image":        "https://images.unsplash.com/photo-1581093806997-124204d9fa9d?w=800&q=80&auto=format&fit=crop",
  "service":           "https://images.unsplash.com/photo-1581093806997-124204d9fa9d?w=800&q=80&auto=format&fit=crop",
  // Default — dental lab CAD/CAM
  "default":           "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80&auto=format&fit=crop",
};

function resolveImage(label: string): string {
  const key = label.toLowerCase();
  for (const [k, v] of Object.entries(IMAGE_MAP)) {
    if (key.includes(k)) return v;
  }
  return IMAGE_MAP["default"];
}

export function Placeholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <img
      src={resolveImage(label)}
      alt={label}
      className={`object-cover w-full h-full ${className}`}
      loading="lazy"
    />
  );
}
