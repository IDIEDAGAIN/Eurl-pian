import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Building2, LogOut } from "lucide-react";

export function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
      if (session?.user) {
        supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle()
          .then(({ data }) => setIsAdmin(!!data));
      } else setIsAdmin(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
      if (data.session?.user) {
        supabase.from("user_roles").select("role").eq("user_id", data.session.user.id).eq("role", "admin").maybeSingle()
          .then(({ data: r }) => setIsAdmin(!!r));
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-9 rounded-md bg-gradient-gold flex items-center justify-center shadow-soft group-hover:rotate-6 transition-transform">
            <Building2 className="size-5 text-primary" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg font-semibold">NOUFA AEK</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Promotion Immobilière</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" activeOptions={{ exact: true }} className="hover:text-gold" activeProps={{ className: "text-gold" }}>Accueil</Link>
          <Link to="/apartments" className="hover:text-gold" activeProps={{ className: "text-gold" }}>Appartements</Link>
          <Link to="/about" className="hover:text-gold" activeProps={{ className: "text-gold" }}>À propos</Link>
          <Link to="/contact" className="hover:text-gold" activeProps={{ className: "text-gold" }}>Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          {email ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link to="/my-orders">Mes commandes</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/" }); }}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="bg-gradient-gold text-primary hover:opacity-90">
              <Link to="/auth">Se connecter</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
