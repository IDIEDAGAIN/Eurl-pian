import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Maximize, Building2 } from "lucide-react";
import { formatDZD } from "@/lib/format";

export const Route = createFileRoute("/apartments")({
  head: () => ({
    meta: [
      { title: "Appartements à vendre — NOUFA AEK Oran" },
      { name: "description", content: "Parcourez tous les appartements disponibles au Bloc N°17 AADL COSIDER USTO." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useQuery({
    queryKey: ["apartments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("apartments").select("*").order("price_dzd");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <Header />
      <section className="container mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-xs uppercase tracking-[0.25em] text-gold">Catalogue</div>
          <h1 className="font-display text-5xl md:text-6xl mt-2 mb-3">Appartements disponibles</h1>
          <p className="text-muted-foreground max-w-xl">Cliquez sur un bien pour voir les détails et réserver en ligne en quelques minutes.</p>
        </motion.div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card aspect-[4/5] animate-pulse" />
          ))}
          {data?.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const }}>
              <Link to="/apartments/$id" params={{ id: a.id }} className="group block">
                <div className="overflow-hidden rounded-2xl border bg-card shadow-soft hover:shadow-elegant transition-all hover:-translate-y-1">
                  <div className="aspect-[4/3] bg-gradient-hero relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="size-20 text-gold/40 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <Badge className={`absolute top-3 left-3 border-0 ${a.status === "sold" ? "bg-red-600 text-white" : a.status === "reserved" ? "bg-amber-500 text-white" : "bg-gold text-gold-foreground"}`}>{a.status === "sold" ? "Vendu" : a.status === "reserved" ? "Réservé" : "Disponible"}</Badge>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-display text-2xl group-hover:text-gold transition-colors">{a.title}</h3>
                    </div>
                    <div className="text-sm text-muted-foreground">{a.building} · Étage {a.floor}</div>
                    <div className="flex gap-4 text-sm mt-3 text-muted-foreground">
                      <span className="flex items-center gap-1"><Bed className="size-4" /> {a.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="size-4" /> {a.bathrooms}</span>
                      <span className="flex items-center gap-1"><Maximize className="size-4" /> {a.area_sqm} m²</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="font-display text-xl text-primary">{formatDZD(Number(a.price_dzd))}</div>
                      <Button size="sm" disabled={a.status !== "available"} className="bg-gradient-gold text-primary hover:opacity-90 disabled:opacity-50">{a.status === "sold" ? "Rupture" : "Acheter"}</Button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
