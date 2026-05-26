import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MarketingMobileNav } from "@/components/site/MobileNav";

export const Route = createFileRoute("/_marketing")({
  component: MarketingLayout,
});

function MarketingLayout() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[72px] pb-[72px] lg:pb-0">
        <Outlet />
      </main>
      <SiteFooter />
      <MarketingMobileNav />
    </>
  );
}
