import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturedSkins } from "@/components/landing/FeaturedSkins";
import { SkinGrid } from "@/components/landing/SkinGrid";
import { WhyUs } from "@/components/landing/WhyUs";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      <Navbar />
      <HeroSection />
      <FeaturedSkins />
      <SkinGrid />
      <WhyUs />
      <Testimonials />
      <Footer />
    </div>
  );
}
