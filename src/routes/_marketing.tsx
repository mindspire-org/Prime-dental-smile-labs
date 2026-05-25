import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/_marketing")({
  component: MarketingLayout,
});

function MarketingLayout() {
  return (
    <>
      <SiteHeader />
      <main className="pt-[72px]">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
