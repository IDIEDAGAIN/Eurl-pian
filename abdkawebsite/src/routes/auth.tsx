import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Header } from "@/components/site/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Connexion — NOUFA AEK" }] }),
  component: Page,
});

function Page() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/` } });
        if (error) throw error;
        toast.success("Compte créé !");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
      }
      navigate({ to: "/" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-6 py-16 flex justify-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card border rounded-3xl p-8 shadow-elegant">
          <h1 className="font-display text-4xl mb-2">{mode === "login" ? "Connexion" : "Créer un compte"}</h1>
          <p className="text-sm text-muted-foreground mb-6">Suivez vos commandes et accédez à votre espace.</p>
          <form onSubmit={handle} className="space-y-4">
            <div><Label>Email</Label><Input name="email" type="email" required /></div>
            <div><Label>Mot de passe</Label><Input name="password" type="password" required minLength={6} /></div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary hover:opacity-90 h-11">
              {loading ? "…" : mode === "login" ? "Se connecter" : "Créer le compte"}
            </Button>
          </form>
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-4 text-sm text-muted-foreground hover:text-gold w-full text-center">
            {mode === "login" ? "Pas de compte ? Créer un compte" : "Déjà inscrit ? Se connecter"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
