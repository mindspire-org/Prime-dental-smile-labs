const IMAGE_MAP: Record<string, string> = {
  "hero":              "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=1600&q=80&auto=format&fit=crop",
  "hero — lab facility photo": "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=1600&q=80&auto=format&fit=crop",
  "lab facility":      "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=1600&q=80&auto=format&fit=crop",
  "zircon":            "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&q=80&auto=format&fit=crop",
  "zirconia":          "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&q=80&auto=format&fit=crop",
  "porcelain":         "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80&auto=format&fit=crop",
  "implants":          "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80&auto=format&fit=crop",
  "implant":           "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80&auto=format&fit=crop",
  "inlays":            "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&auto=format&fit=crop",
  "inlays / onlays":   "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&auto=format&fit=crop",
  "crown":             "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&q=80&auto=format&fit=crop",
  "bridge":            "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80&auto=format&fit=crop",
  "materials & equipment": "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=800&q=80&auto=format&fit=crop",
  "production timeline":   "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop",
  "production management": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop",
  "news image":        "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80&auto=format&fit=crop",
  "about":             "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=1200&q=80&auto=format&fit=crop",
  "team":              "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=800&q=80&auto=format&fit=crop",
  "technology":        "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=1200&q=80&auto=format&fit=crop",
  "workflow":          "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80&auto=format&fit=crop",
  "quality":           "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=1200&q=80&auto=format&fit=crop",
  "contact":           "https://images.unsplash.com/photo-1565843708714-52ecf69ab81f?w=1200&q=80&auto=format&fit=crop",
  "service":           "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80&auto=format&fit=crop",
  "default":           "https://images.unsplash.com/photo-1588776814546-daab30f310ce?w=800&q=80&auto=format&fit=crop",
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
