import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { isAuthenticated } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "NexBank — Digital Banking Portal" },
      { name: "description", content: "Secure modern banking portal for managing your accounts, transfers and transactions." },
    ],
  }),
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated()) {
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
