import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Header } from "@/components/site/Header";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDZD } from "@/lib/format";
import { toast } from "sonner";
import { TrendingUp, Calendar, DollarSign, Package, CheckCircle2, Clock, XCircle, Home } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — NOUFA AEK" }] }),
  component: Page,
});

type OrderRow = {
  id: string;
  status: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  apartment_id: string | null;
  apartments?: { title: string; price_dzd: number; building: string; floor: number } | null;
};

type ApartmentRow = {
  id: string;
  title: string;
  building: string;
  floor: number;
  price_dzd: number;
  status: string;
};

function Page() {
  const [state, setState] = useState<"loading" | "ok" | "denied" | "anon">("loading");
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return setState("anon");
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", data.session.user.id).eq("role", "admin").maybeSingle();
      setState(r ? "ok" : "denied");
    });
  }, []);

  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    enabled: state === "ok",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, apartments(title, price_dzd, building, floor)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as OrderRow[];
    },
  });

  const { data: apartments } = useQuery({
    queryKey: ["admin-apartments"],
    enabled: state === "ok",
    queryFn: async () => {
      const { data, error } = await supabase.from("apartments").select("id, title, building, floor, price_dzd, status").order("floor");
      if (error) throw error;
      return data as ApartmentRow[];
    },
  });

  async function updateOrder(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error("Erreur de mise à jour");
    toast.success(status === "completed" ? "Vente finalisée — appartement marqué vendu" : "Statut mis à jour");
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    qc.invalidateQueries({ queryKey: ["admin-apartments"] });
  }

  async function updateApartmentStatus(id: string, status: string) {
    const { error } = await supabase.from("apartments").update({ status }).eq("id", id);
    if (error) return toast.error("Erreur");
    toast.success("Stock mis à jour");
    qc.invalidateQueries({ queryKey: ["admin-apartments"] });
  }

  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfDay - now.getDay() * 86400000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
    const sold = (orders ?? []).filter(o => o.status === "completed");
    const buckets = { day: 0, week: 0, month: 0, year: 0, dayRev: 0, weekRev: 0, monthRev: 0, yearRev: 0 };
    for (const o of sold) {
      const t = new Date(o.created_at).getTime();
      const price = Number(o.apartments?.price_dzd ?? 0);
      if (t >= startOfDay) { buckets.day++; buckets.dayRev += price; }
      if (t >= startOfWeek) { buckets.week++; buckets.weekRev += price; }
      if (t >= startOfMonth) { buckets.month++; buckets.monthRev += price; }
      if (t >= startOfYear) { buckets.year++; buckets.yearRev += price; }
    }
    return {
      pending: (orders ?? []).filter(o => o.status === "pending").length,
      confirmed: (orders ?? []).filter(o => o.status === "confirmed").length,
      completed: sold.length,
      rejected: (orders ?? []).filter(o => o.status === "rejected").length,
      available: (apartments ?? []).filter(a => a.status === "available").length,
      soldUnits: (apartments ?? []).filter(a => a.status === "sold").length,
      ...buckets,
    };
  }, [orders, apartments]);

  if (state === "loading") return <Shell><div className="p-12 text-muted-foreground">Chargement…</div></Shell>;
  if (state === "anon") return <Shell><div className="p-12">Veuillez <Link to="/auth" className="text-gold underline">vous connecter</Link>.</div></Shell>;
  if (state === "denied") return <Shell><div className="p-12 max-w-xl">
    <h1 className="font-display text-4xl mb-3">Accès refusé</h1>
    <p className="text-muted-foreground">Votre compte n'a pas le rôle administrateur.</p>
  </div></Shell>;

  return (
    <Shell>
      <div className="container mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="text-xs uppercase tracking-[0.25em] text-gold">Tableau de bord</div>
          <h1 className="font-display text-5xl mb-8">Administration</h1>
        </motion.div>

        {/* Period stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Vendus aujourd'hui", value: stats.day, sub: formatDZD(stats.dayRev), icon: Calendar, tint: "from-emerald-500/20 to-emerald-500/5" },
            { label: "Cette semaine", value: stats.week, sub: formatDZD(stats.weekRev), icon: TrendingUp, tint: "from-blue-500/20 to-blue-500/5" },
            { label: "Ce mois", value: stats.month, sub: formatDZD(stats.monthRev), icon: Package, tint: "from-purple-500/20 to-purple-500/5" },
            { label: "Cette année", value: stats.year, sub: formatDZD(stats.yearRev), icon: DollarSign, tint: "from-gold/30 to-gold/5" },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06, ease: [0.22, 1, 0.36, 1] as const }}
              whileHover={{ y: -4 }}
              className={`relative overflow-hidden bg-card border rounded-2xl p-6 shadow-soft`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${s.tint} opacity-60 pointer-events-none`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                  <s.icon className="size-4 text-gold" />
                </div>
                <div className="font-display text-4xl mt-2">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pipeline + inventory */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-10">
          {[
            { label: "En attente", value: stats.pending, icon: Clock },
            { label: "Confirmées", value: stats.confirmed, icon: CheckCircle2 },
            { label: "Finalisées", value: stats.completed, icon: CheckCircle2 },
            { label: "Rejetées", value: stats.rejected, icon: XCircle },
            { label: "Disponibles", value: stats.available, icon: Home },
            { label: "Vendus", value: stats.soldUnits, icon: Package },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.04 }}
              className="bg-card border rounded-xl p-4 flex items-center gap-3">
              <s.icon className="size-4 text-muted-foreground" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="font-display text-xl">{s.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="inventory">Inventaire (12 étages)</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <div className="bg-card border rounded-2xl shadow-soft overflow-hidden">
              <div className="divide-y">
                {orders?.map((o, i) => (
                  <motion.div key={o.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="p-5 grid md:grid-cols-[2fr_2fr_1fr_auto] gap-4 items-center hover:bg-muted/40 transition-colors">
                    <div>
                      <div className="font-medium">{o.apartments?.title ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        Étage {o.apartments?.floor} · {formatDZD(Number(o.apartments?.price_dzd ?? 0))}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{o.full_name}</div>
                      <div className="text-xs text-muted-foreground">{o.email} · {o.phone}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("fr-FR")}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={
                        o.status === "completed" ? "default" :
                        o.status === "confirmed" ? "default" :
                        o.status === "rejected" ? "destructive" : "secondary"
                      } className={o.status === "completed" ? "bg-emerald-600" : ""}>{o.status}</Badge>

                      {o.status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => updateOrder(o.id, "confirmed")} className="bg-gradient-gold text-primary hover:opacity-90">Confirmer</Button>
                          <Button size="sm" variant="outline" onClick={() => updateOrder(o.id, "rejected")}>Rejeter</Button>
                        </>
                      )}
                      {o.status === "confirmed" && (
                        <Button size="sm" onClick={() => updateOrder(o.id, "completed")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Finaliser (vendu)
                        </Button>
                      )}
                      {o.status === "completed" && (
                        <Button size="sm" variant="outline" onClick={() => updateOrder(o.id, "confirmed")}>Annuler vente</Button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {orders?.length === 0 && <div className="p-8 text-center text-muted-foreground">Aucune commande.</div>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="mt-6">
            <div className="bg-card border rounded-2xl shadow-soft overflow-hidden">
              <div className="divide-y">
                {apartments?.map((a, i) => (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}
                    className="p-5 grid md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center hover:bg-muted/40 transition-colors">
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">Étage {a.floor}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{a.building}</div>
                    <div className="font-display">{formatDZD(Number(a.price_dzd))}</div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        a.status === "sold" ? "bg-red-600" :
                        a.status === "reserved" ? "bg-amber-500" : "bg-emerald-600"
                      }>{a.status === "sold" ? "Vendu" : a.status === "reserved" ? "Réservé" : "Disponible"}</Badge>
                      <Select value={a.status} onValueChange={(v) => updateApartmentStatus(a.id, v)}>
                        <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponible</SelectItem>
                          <SelectItem value="reserved">Réservé</SelectItem>
                          <SelectItem value="sold">Vendu (rupture)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      {children}
    </div>
  );
}
