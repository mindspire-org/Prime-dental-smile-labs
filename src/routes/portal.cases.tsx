import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/portal/cases")({
  component: () => <Outlet />,
});
