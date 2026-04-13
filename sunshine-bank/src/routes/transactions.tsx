import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import { account, isAuthenticated } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
  head: () => ({
    meta: [{ title: "Transactions — NexBank" }],
  }),
});

function TransactionsPage() {
  const navigate = useNavigate();
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    account.getTransactions()
      .then((data) => setTxns(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated()) { navigate({ to: "/login" }); return; }
    load();
  }, [navigate]);

  const handleSendStatement = async () => {
  try {
    await account.sendStatement();
    setMsg({ type: "success", text: "Statement sent to your email!" });
  } catch (err: any) {
    setMsg({ type: "error", text: err.message || "Failed to send statement" });
  }
};

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">Your recent account activity</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleSendStatement}>
              Email Statement
            </Button>
          </div>
        </div>

        {msg && (
  <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
    {msg.text}
  </div>
)}

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : txns.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.map((tx, i) => {
                    const isCredit = tx.transactionType === "CREDIT" || tx.transactionType === "DEPOSIT" || tx.type === "credit";
                    return (
                      <tr key={tx.id ?? i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCredit ? "bg-success/10" : "bg-destructive/10"}`}>
                              {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5 text-success" /> : <ArrowUpRight className="w-3.5 h-3.5 text-destructive" />}
                            </div>
                            <span className="font-medium text-card-foreground capitalize">
                              {tx.transactionType?.toLowerCase() ?? tx.type ?? "—"}
                            </span>
                          </div>
                        </td>
                        <td className={`p-4 font-heading font-semibold ${isCredit ? "text-success" : "text-destructive"}`}>
                          {isCredit ? "+" : "-"}₹{Math.abs(tx.amount)?.toLocaleString() ?? "0"}
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                          {tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString() : tx.date ?? "—"}
                        </td>
                        <td className="p-4 text-muted-foreground hidden sm:table-cell truncate max-w-[200px]">
                          {tx.description ?? tx.targetAccountNumber ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
