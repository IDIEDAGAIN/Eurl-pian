import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bed, Bath, Maximize, Building2, ArrowLeft, Check } from "lucide-react";
import { formatDZD } from "@/lib/format";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/apartments/$id")({
  component: Page,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(30),
  address: z.string().trim().min(3).max(300),
  notes: z.string().trim().max(1000).optional().default(""),
});

function Page() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: a, isLoading } = useQuery({
    queryKey: ["apartment", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("apartments").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Formulaire invalide");
      return;
    }
    setSubmitting(true);
    const { data: session } = await supabase.auth.getSession();
    const { error } = await supabase.from("orders").insert({
      apartment_id: id,
      user_id: session.session?.user.id ?? null,
      ...parsed.data,
    });
    setSubmitting(false);
    if (error) { toast.error("Erreur lors de la commande"); return; }
    setDone(true);
    toast.success("Commande reçue ! Nous vous contactons sous 24h.");
  }

  if (isLoading) return <div className="min-h-screen"><Header /><div className="container mx-auto p-12">Chargement…</div></div>;
  if (!a) return <div className="min-h-screen"><Header /><div className="container mx-auto p-12">Introuvable. <Link to="/apartments" className="text-gold underline">Retour</Link></div></div>;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-6 py-10">
        <Link to="/apartments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold mb-6"><ArrowLeft className="size-4" /> Tous les appartements</Link>
        <div className="grid md:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
            className="aspect-[4/3] rounded-3xl bg-gradient-hero relative overflow-hidden shadow-elegant">
            <Building2 className="size-32 text-gold/40 absolute inset-0 m-auto" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <div className="text-xs uppercase tracking-[0.25em] text-gold mb-2">{a.building}</div>
            <h1 className="font-display text-5xl mb-3">{a.title}</h1>
            <div className="text-3xl font-display text-primary">{formatDZD(Number(a.price_dzd))}</div>
            <div className="flex flex-wrap gap-6 mt-6 text-muted-foreground">
              <span className="flex items-center gap-2"><Bed className="size-5" /> {a.bedrooms} chambres</span>
              <span className="flex items-center gap-2"><Bath className="size-5" /> {a.bathrooms} sdb</span>
              <span className="flex items-center gap-2"><Maximize className="size-5" /> {a.area_sqm} m²</span>
              <span>Étage {a.floor}</span>
            </div>
            <p className="mt-6 leading-relaxed text-foreground/80">{a.description}</p>
            <Button onClick={() => setOpen(true)} disabled={a.status !== "available"} size="lg" className="mt-8 bg-gradient-gold text-primary hover:opacity-90 disabled:opacity-50">
              {a.status === "sold" ? "Rupture de stock" : a.status === "reserved" ? "Déjà réservé" : "Acheter cet appartement"}
            </Button>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !submitting && setOpen(false)}>
            <motion.div initial={{ scale: 0.92, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl shadow-elegant max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
              {done ? (
                <div className="text-center py-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                    className="mx-auto size-16 rounded-full bg-gradient-gold flex items-center justify-center mb-4">
                    <Check className="size-8 text-primary" />
                  </motion.div>
                  <h3 className="font-display text-3xl mb-2">Commande envoyée</h3>
                  <p className="text-muted-foreground">Notre équipe vous contacte sous 24h pour finaliser votre dossier.</p>
                  <Button onClick={() => { setOpen(false); navigate({ to: "/apartments" }); }} className="mt-6 bg-primary">Retour au catalogue</Button>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-3xl mb-1">Réserver {a.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6">Remplissez vos informations, nous vous rappelons.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div><Label>Nom complet</Label><Input name="full_name" required maxLength={100} /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Email</Label><Input name="email" type="email" required maxLength={255} /></div>
                      <div><Label>Téléphone</Label><Input name="phone" required maxLength={30} /></div>
                    </div>
                    <div><Label>Adresse</Label><Input name="address" required maxLength={300} /></div>
                    <div><Label>Message (optionnel)</Label><Textarea name="notes" maxLength={1000} rows={3} /></div>
                    <Button type="submit" disabled={submitting} className="w-full bg-gradient-gold text-primary hover:opacity-90 h-12 text-base">
                      {submitting ? "Envoi…" : `Confirmer · ${formatDZD(Number(a.price_dzd))}`}
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
