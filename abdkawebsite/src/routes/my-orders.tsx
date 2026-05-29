import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Header } from "@/components/site/Header";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/my-orders")({
  head: () => ({ meta: [{ title: "Mes commandes — NOUFA AEK" }] }),
  component: Page,
});

function Page() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null)); }, []);

  const { data } = useQuery({
    queryKey: ["my-orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, apartments(title, price_dzd)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-6 py-16">
        <h1 className="font-display text-5xl mb-8">Mes commandes</h1>
        {!userId && <p className="text-muted-foreground">Veuillez <Link to="/auth" className="text-gold underline">vous connecter</Link>.</p>}
        <div className="space-y-4">
          {data?.map((o, i) => (
            <motion.div key={o.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card border rounded-2xl p-6 shadow-soft flex justify-between items-center">
              <div>
                <div className="font-display text-2xl">{(o as any).apartments?.title ?? "Appartement"}</div>
                <div className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString("fr-FR")} · {o.full_name}</div>
              </div>
              <Badge className="bg-gold text-gold-foreground">{o.status}</Badge>
            </motion.div>
          ))}
          {data?.length === 0 && <p className="text-muted-foreground">Aucune commande pour le moment.</p>}
        </div>
      </div>
    </div>
  );
}
