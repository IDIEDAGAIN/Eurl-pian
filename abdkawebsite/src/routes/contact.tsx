import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MapPin, Phone, Clock } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — NOUFA AEK" }] }),
  component: () => (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-6 py-16">
        <div className="text-xs uppercase tracking-[0.25em] text-gold">Nous contacter</div>
        <h1 className="font-display text-5xl mb-10">Venez nous rencontrer</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: MapPin, title: "Adresse", lines: ["Bloc N°17, AADL COSIDER USTO", "Bir El Djir, Oran 31028"] },
            { icon: Phone, title: "Téléphone", lines: ["0560 00 27 05"] },
            { icon: Clock, title: "Horaires", lines: ["Dimanche — Jeudi", "Ouvert 8h00 — 16h00", "Fermé vendredi & samedi"] },
          ].map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
              className="bg-card border rounded-2xl p-8 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all">
              <c.icon className="size-7 text-gold mb-4" />
              <h3 className="font-display text-2xl mb-2">{c.title}</h3>
              {c.lines.map(l => <div key={l} className="text-muted-foreground">{l}</div>)}
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  ),
});
