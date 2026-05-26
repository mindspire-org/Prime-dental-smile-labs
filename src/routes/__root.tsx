import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import appCss from "../styles.css?url";
import { GoogleAnalytics, analytics } from "@/components/analytics/GoogleAnalytics";
import { SEOHead, seoUtils } from "@/components/seo/SEOHead";
import { LayoutGuard } from "@/components/layout/LayoutGuard";
import { setSession, getCurrentUser } from "@/lib/api";

/* ── 3-D floating tooth illustration ───────────────────── */
function Tooth3D() {
  return (
    <svg viewBox="0 0 260 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="t1" cx="35%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="55%" stopColor="#c8eef7"/>
          <stop offset="100%" stopColor="#7dd3e8"/>
        </radialGradient>
        <radialGradient id="t2" cx="35%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#e0f7fc"/>
          <stop offset="100%" stopColor="#4ab8d4"/>
        </radialGradient>
        <linearGradient id="gum" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f9a8c0"/>
          <stop offset="100%" stopColor="#e05474"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="shadow">
          <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#0aabbd" floodOpacity="0.35"/>
        </filter>
      </defs>

      {/* Glow halo */}
      <ellipse cx="130" cy="200" rx="90" ry="30" fill="#0aabbd" opacity="0.12" filter="url(#glow)"/>

      {/* Gum base */}
      <ellipse cx="130" cy="248" rx="88" ry="26" fill="url(#gum)" filter="url(#shadow)"/>

      {/* Left molar */}
      <g filter="url(#shadow)">
        <rect x="28" y="148" width="52" height="92" rx="10" fill="url(#t2)" stroke="#7dd3e8" strokeWidth="1.5"/>
        <rect x="28" y="148" width="15" height="92" rx="10" fill="white" opacity="0.3"/>
        <rect x="35" y="162" width="38" height="6" rx="3" fill="#9ecfdb" opacity="0.5"/>
      </g>

      {/* Right molar */}
      <g filter="url(#shadow)">
        <rect x="180" y="148" width="52" height="92" rx="10" fill="url(#t2)" stroke="#7dd3e8" strokeWidth="1.5"/>
        <rect x="180" y="148" width="15" height="92" rx="10" fill="white" opacity="0.3"/>
        <rect x="187" y="162" width="38" height="6" rx="3" fill="#9ecfdb" opacity="0.5"/>
      </g>

      {/* Left lateral */}
      <g filter="url(#shadow)">
        <rect x="82" y="124" width="46" height="112" rx="11" fill="url(#t1)" stroke="#9ecfdb" strokeWidth="1.5"/>
        <rect x="82" y="124" width="14" height="112" rx="11" fill="white" opacity="0.38"/>
        <rect x="89" y="138" width="32" height="7" rx="3.5" fill="white" opacity="0.55"/>
      </g>

      {/* Right lateral */}
      <g filter="url(#shadow)">
        <rect x="132" y="124" width="46" height="112" rx="11" fill="url(#t1)" stroke="#9ecfdb" strokeWidth="1.5"/>
        <rect x="132" y="124" width="14" height="112" rx="11" fill="white" opacity="0.38"/>
        <rect x="139" y="138" width="32" height="7" rx="3.5" fill="white" opacity="0.55"/>
      </g>

      {/* Central incisors */}
      <g filter="url(#shadow)">
        <rect x="104" y="108" width="52" height="128" rx="13" fill="url(#t1)" stroke="#7dd3e8" strokeWidth="2"/>
        <rect x="104" y="108" width="16" height="128" rx="13" fill="white" opacity="0.42"/>
        <rect x="112" y="124" width="36" height="9" rx="4.5" fill="white" opacity="0.6"/>
        <rect x="112" y="140" width="24" height="6" rx="3" fill="white" opacity="0.35"/>
      </g>

      {/* Sparkles */}
      {[[90,96],[160,90],[130,82]].map(([sx,sy],i) => (
        <g key={i}>
          <line x1={sx} y1={sy-8} x2={sx} y2={sy+8} stroke="#0aabbd" strokeWidth="2.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0;1;0" dur={`${1.4+i*0.6}s`} repeatCount="indefinite" begin={`${i*0.3}s`}/>
          </line>
          <line x1={sx-8} y1={sy} x2={sx+8} y2={sy} stroke="#0aabbd" strokeWidth="2.5" strokeLinecap="round">
            <animate attributeName="opacity" values="0;1;0" dur={`${1.4+i*0.6}s`} repeatCount="indefinite" begin={`${i*0.3}s`}/>
          </line>
        </g>
      ))}
    </svg>
  );
}

/* ── Animated floating particles ───────────────────────── */
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  dur: 3 + Math.random() * 5,
  delay: Math.random() * 4,
  opacity: 0.15 + Math.random() * 0.4,
}));

function NotFoundComponent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: "linear-gradient(135deg, #060d14 0%, #0a1a26 50%, #060d14 100%)" }}>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.map(p => (
          <div key={p.id} className="absolute rounded-full bg-cyan-400"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              opacity: p.opacity,
              animation: `floatUp ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
            }}/>
        ))}
      </div>

      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "linear-gradient(rgba(10,171,189,1) 1px, transparent 1px), linear-gradient(90deg, rgba(10,171,189,1) 1px, transparent 1px)", backgroundSize: "48px 48px" }}/>

      {/* Radial glow center */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(10,171,189,0.08) 0%, transparent 70%)" }}/>

      {/* 3-D tooth + 404 side by side */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>

        {/* Floating tooth */}
        <div className="w-44 h-52 mb-2" style={{ animation: "floatBob 4s ease-in-out infinite", filter: "drop-shadow(0 0 32px rgba(10,171,189,0.4))" }}>
          <Tooth3D/>
        </div>

        {/* 404 glitch number */}
        <div className="relative select-none mb-2" style={{ animation: "glitchShift 6s ease-in-out infinite" }}>
          <span className="block text-[120px] font-black leading-none tracking-tighter"
            style={{ WebkitTextStroke: "2px rgba(10,171,189,0.6)", color: "transparent", textShadow: "0 0 40px rgba(10,171,189,0.3)" }}>
            404
          </span>
          {/* glitch layers */}
          <span className="absolute inset-0 block text-[120px] font-black leading-none tracking-tighter text-cyan-400 opacity-0"
            style={{ animation: "glitchA 6s ease-in-out infinite", clipPath: "inset(20% 0 60% 0)" }}>
            404
          </span>
          <span className="absolute inset-0 block text-[120px] font-black leading-none tracking-tighter text-pink-400 opacity-0"
            style={{ animation: "glitchB 6s ease-in-out infinite", clipPath: "inset(50% 0 20% 0)" }}>
            404
          </span>
        </div>

        {/* Divider line */}
        <div className="w-32 h-px mb-6" style={{ background: "linear-gradient(90deg, transparent, #0aabbd, transparent)" }}/>

        {/* Text */}
        <div className={`text-center transition-all duration-1000 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
            Looks like this page went missing — like a crown without a case file.
            <br/>Let's get you back on track.
          </p>
        </div>

        {/* Buttons */}
        <div className={`flex flex-wrap items-center justify-center gap-3 mt-8 transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Link to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg,#0aabbd,#007acc)", boxShadow: "0 8px 28px rgba(10,171,189,0.4)" }}>
            ← Back to Home
          </Link>
          <a href="/portal"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ border: "1px solid rgba(10,171,189,0.35)", color: "#0aabbd", background: "rgba(10,171,189,0.06)" }}>
            Go to Portal
          </a>
        </div>

        {/* Brand footer */}
        <div className={`mt-12 text-xs text-slate-600 transition-all duration-1000 delay-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
          Prime<span className="text-cyan-600">Smile</span> Labs &mdash; Digital Dental Laboratory
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px) scale(1); opacity: 0.2; }
          100% { transform: translateY(-28px) scale(1.3); opacity: 0.6; }
        }
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-18px) rotate(2deg); }
        }
        @keyframes glitchShift {
          0%, 92%, 100% { transform: translate(0); }
          93%           { transform: translate(-3px, 1px); }
          95%           { transform: translate(3px, -1px); }
          97%           { transform: translate(-2px, 2px); }
        }
        @keyframes glitchA {
          0%, 90%, 100% { opacity: 0; transform: translate(0); }
          91%           { opacity: 0.8; transform: translate(-4px, 0); }
          93%           { opacity: 0; }
        }
        @keyframes glitchB {
          0%, 93%, 100% { opacity: 0; transform: translate(0); }
          94%           { opacity: 0.7; transform: translate(4px, 0); }
          96%           { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Prime Smile Labs — Digital Dental Laboratory" },
      { name: "description", content: "Prime Smile Dental Laboratory — precision digital lab services for UK & Cyprus dentists. Submit cases, track progress, and collaborate seamlessly." },
      { name: "author", content: "Prime Smile Labs" },
      { property: "og:title", content: "Prime Smile Labs — Digital Dental Laboratory" },
      { property: "og:description", content: "Precision digital dental lab services. Submit cases, track progress, and collaborate with your lab online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@PrimeSmileLabs" },
      { name: "application-name", content: "Prime Smile Labs" },
      { name: "generator", content: "Developed & Designed by Mindspire (mindspire.org)" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/primesmile-logo.png" },
      { rel: "shortcut icon", href: "/primesmile-logo.png" },
      { rel: "apple-touch-icon", href: "/primesmile-logo.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Bootstrap: on every page load, silently refresh the access token using the
  // httpOnly refresh cookie so the in-memory token is populated.
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Only attempt refresh if we have a user in sessionStorage (i.e. logged-in session)
    const user = getCurrentUser();
    if (user) {
      fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => { if (data?.accessToken) setSession({ accessToken: data.accessToken, user }); })
        .catch(() => {});
    }
  }, []);

  // Track page views and analytics
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      // Track initial page load
      analytics.pageview(window.location.pathname, document.title);

      // Track navigation changes
      const unsubscribe = router.subscribe("onResolved", () => {
        analytics.pageview(window.location.pathname, document.title);
      });

      return unsubscribe;
    }
  }, [router]);

  // Get SEO data for current route (SSR safe)
  const location = router.state.location;
  const currentPath = location.pathname;
  let seoData = seoUtils.getPageSEO("home");
  
  if (currentPath.includes("/services")) {
    seoData = seoUtils.getPageSEO("services");
  } else if (currentPath.includes("/contact")) {
    seoData = seoUtils.getPageSEO("contact");
  } else if (currentPath.includes("/submit")) {
    seoData = seoUtils.getPageSEO("submit");
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* Google Analytics — set VITE_GA_MEASUREMENT_ID in .env */}
      <GoogleAnalytics measurementId={import.meta.env.VITE_GA_MEASUREMENT_ID || ""} />
      
      {/* SEO Meta Tags */}
      <SEOHead {...seoData} />
      
      {/* Layout Protection for Admin/Edit Mode */}
      <LayoutGuard 
        isEditing={isEditing}
        onLayoutChange={(changes) => {
          console.log("Layout changes detected:", changes);
        }}
      >
        <Outlet />
      </LayoutGuard>
    </QueryClientProvider>
  );
}
