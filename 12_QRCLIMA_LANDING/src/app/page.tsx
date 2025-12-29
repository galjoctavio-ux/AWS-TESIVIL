import Hero from "@/components/Hero";
import Agenda from "@/components/Agenda";
import Recordatorios from "@/components/Recordatorios";
import Herramientas from "@/components/Herramientas";
import EcosistemaQR from "@/components/EcosistemaQR";
import Pricing from "@/components/Pricing";
import Screenshots from "@/components/Screenshots";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      {/* Section 1: Hero - El Gancho Inmediato */}
      <Hero />

      {/* Section 2: Agenda - Bento Grid Interactivo */}
      <Agenda />

      {/* Section 3: ROI - Recordatorios Automáticos */}
      <Recordatorios />

      {/* Section 4: Herramientas de Campo */}
      <Herramientas />

      {/* Section 5: Ecosistema QR - Retención */}
      <EcosistemaQR />

      {/* Section 6: Pricing */}
      <Pricing />

      {/* Section 7: Screenshots Carousel */}
      <Screenshots />

      {/* Section 8: Footer & Descarga (includes FAQ/Features modals) */}
      <Footer />
    </main>
  );
}
