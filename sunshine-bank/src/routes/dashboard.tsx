import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Building2, Hash, CreditCard, TrendingUp } from "lucide-react";
import { dashboard, isAuthenticated } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [{ title: "Dashboard — NexBank" }],
  }),
});

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [acct, setAcct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
      return;
    }
    Promise.all([dashboard.getUser(), dashboard.getAccount()])
      .then(([u, a]) => { setUser(u); setAcct(a); })
      .catch(() => navigate({ to: "/login" }))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const cards = [
    { label: "Balance", value: `₹${acct?.balance?.toLocaleString() ?? "0"}`, icon: Wallet, color: "text-accent" },
    { label: "Account No.", value: acct?.accountNumber ?? "—", icon: Hash, color: "text-primary" },
    { label: "Account Type", value: acct?.accountType ?? "—", icon: CreditCard, color: "text-chart-4" },
    { label: "Branch", value: acct?.branch ?? "—", icon: Building2, color: "text-chart-5" },
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Welcome back, {user?.name ?? "User"}
          </h1>
          <p className="text-muted-foreground mt-1">Here's your account overview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="font-heading text-xl font-bold text-card-foreground truncate">{card.value}</p>
            </motion.div>
          ))}
        </div>

        {acct?.ifscCode && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-card-foreground">IFSC Code</span>
            </div>
            <p className="font-heading text-lg font-semibold text-card-foreground">{acct.ifscCode}</p>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
