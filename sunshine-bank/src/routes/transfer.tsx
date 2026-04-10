import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { account, isAuthenticated } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/transfer")({
  component: TransferPage,
  head: () => ({
    meta: [{ title: "Fund Transfer — NexBank" }],
  }),
});

function TransferPage() {
  const navigate = useNavigate();
  const [targetAccountNumber, setTarget] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) navigate({ to: "/login" });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      await account.fundTransfer({ targetAccountNumber, amount: Number(amount), pin });
      setMsg({ type: "success", text: "Transfer successful!" });
      setTarget(""); setAmount(""); setPin("");
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Transfer failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-lg">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">Fund Transfer</h1>
          <p className="text-muted-foreground mt-1">Send money to another account</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {msg && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
              {msg.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="target">Target Account Number</Label>
              <Input id="target" value={targetAccountNumber} onChange={(e) => setTarget(e.target.value)} placeholder="Enter account number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input id="amount" type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input id="pin" type="password" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              <Send className="w-4 h-4 mr-2" />
              {loading ? "Processing…" : "Transfer Funds"}
            </Button>
          </form>
        </div>
      </motion.div>
    </AppLayout>
  );
}
