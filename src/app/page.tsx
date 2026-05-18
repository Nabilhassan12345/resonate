import { ArchitectureSection } from "@/components/landing/ArchitectureSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { MoatSection } from "@/components/landing/MoatSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { InteractiveStudio } from "@/components/studio/InteractiveStudio";

export default function Home() {
  return (
    <main className="bg-black text-white">
      <HeroSection />
      <ProblemSection />
      <InteractiveStudio />
      <ArchitectureSection />
      <MoatSection />
      <FooterSection />
    </main>
  );
}
