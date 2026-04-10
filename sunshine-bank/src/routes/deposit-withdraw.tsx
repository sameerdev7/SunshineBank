import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { account, isAuthenticated } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/deposit-withdraw")({
  component: DepositWithdrawPage,
  head: () => ({
    meta: [{ title: "Deposit & Withdraw — NexBank" }],
  }),
});

function DepositWithdrawPage() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated()) navigate({ to: "/login" });
  }, [navigate]);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-lg">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">Deposit & Withdraw</h1>
          <p className="text-muted-foreground mt-1">Add or remove funds from your account</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <Tabs defaultValue="deposit">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="deposit" className="flex-1">
                <ArrowDownToLine className="w-4 h-4 mr-2" /> Deposit
              </TabsTrigger>
              <TabsTrigger value="withdraw" className="flex-1">
                <ArrowUpFromLine className="w-4 h-4 mr-2" /> Withdraw
              </TabsTrigger>
            </TabsList>
            <TabsContent value="deposit">
              <MoneyForm type="deposit" />
            </TabsContent>
            <TabsContent value="withdraw">
              <MoneyForm type="withdraw" />
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </AppLayout>
  );
}

function MoneyForm({ type }: { type: "deposit" | "withdraw" }) {
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const fn = type === "deposit" ? account.deposit : account.withdraw;
      await fn({ amount: Number(amount), pin });
      setMsg({ type: "success", text: `${type === "deposit" ? "Deposit" : "Withdrawal"} successful!` });
      setAmount(""); setPin("");
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || `${type} failed` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
          {msg.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor={`${type}-amount`}>Amount (₹)</Label>
          <Input id={`${type}-amount`} type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${type}-pin`}>PIN</Label>
          <Input id={`${type}-pin`} type="password" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Processing…" : type === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
        </Button>
      </form>
    </>
  );
}
