import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/about")({
  component: AboutLayout,
});

function AboutLayout() {
  return <Outlet />;
}
