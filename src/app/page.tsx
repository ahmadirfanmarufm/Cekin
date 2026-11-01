
import { HeroSection } from "@/features/home/components/hero-section";
import { PrimaryFeatures } from "@/features/home/components/primary-features";
import { ThreatModes } from "@/features/home/components/threat-modes";
import { EmergencyBanner } from "@/features/home/components/emergency-banner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PrimaryFeatures />
      <ThreatModes />
      <EmergencyBanner />
    </>
  );
}
