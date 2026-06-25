import { BuiltWith } from "@/components/BuiltWith";
import { Architecture } from "@/components/Architecture";
import { Console } from "@/components/Console";
import { Footer } from "@/components/Footer";
import { GuidedDemo } from "@/components/GuidedDemo";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Integrate } from "@/components/Integrate";
import { Navbar } from "@/components/Navbar";
import { Positioning } from "@/components/Positioning";
import { PossibilitiesExplorer } from "@/components/PossibilitiesExplorer";
import { SetupNotice } from "@/components/SetupNotice";

export default function Home() {
  return (
    <main className="relative">
      <SetupNotice />
      <Navbar />
      <GuidedDemo />
      <Hero />
      <BuiltWith />
      <Console />
      <HowItWorks />
      <Architecture />
      <Integrate />
      <Positioning />
      <PossibilitiesExplorer />
      <Footer />
    </main>
  );
}
