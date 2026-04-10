import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { account, isAuthenticated } from "@/lib/api";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/pin-management")({
  component: PinManagementPage,
  head: () => ({
    meta: [{ title: "PIN Management — NexBank" }],
  }),
});

function PinManagementPage() {
  const navigate = useNavigate();
  const [hasPin, setHasPin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { navigate({ to: "/login" }); return; }
    account.checkPin()
      .then((res) => setHasPin(res?.hasPin ?? res?.hasPIN ?? true))
      .catch(() => setHasPin(false));
  }, [navigate]);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-lg">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">PIN Management</h1>
          <p className="text-muted-foreground mt-1">Create or update your transaction PIN</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {hasPin === null ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !hasPin ? (
            <CreatePinForm onCreated={() => setHasPin(true)} />
          ) : (
            <Tabs defaultValue="update">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="update" className="flex-1">Update PIN</TabsTrigger>
              </TabsList>
              <TabsContent value="update">
                <UpdatePinForm />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}

function CreatePinForm({ onCreated }: { onCreated: () => void }) {
  const [pin, setPin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setLoading(true);
    try {
      await account.createPin({ pin, password });
      setMsg({ type: "success", text: "PIN created successfully!" });
      onCreated();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to create PIN" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-accent/10">
        <Shield className="w-5 h-5 text-accent" />
        <p className="text-sm text-foreground">You need to create a transaction PIN to use account features.</p>
      </div>
      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{msg.text}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="new-pin">New PIN</Label>
          <Input id="new-pin" type="password" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Account Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating…" : "Create PIN"}
        </Button>
      </form>
    </>
  );
}

function UpdatePinForm() {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null); setLoading(true);
    try {
      await account.updatePin({ oldPin, newPin, password });
      setMsg({ type: "success", text: "PIN updated successfully!" });
      setOldPin(""); setNewPin(""); setPassword("");
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to update PIN" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>{msg.text}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="old-pin">Current PIN</Label>
          <Input id="old-pin" type="password" maxLength={6} value={oldPin} onChange={(e) => setOldPin(e.target.value)} placeholder="••••" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="update-new-pin">New PIN</Label>
          <Input id="update-new-pin" type="password" maxLength={6} value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="••••" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="update-password">Account Password</Label>
          <Input id="update-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating…" : "Update PIN"}
        </Button>
      </form>
    </>
  );
}
