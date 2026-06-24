import { Console } from "@/components/Console";
import { Footer } from "@/components/Footer";
import { GuidedDemo } from "@/components/GuidedDemo";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Positioning } from "@/components/Positioning";
import { SetupNotice } from "@/components/SetupNotice";

export default function Home() {
  return (
    <main className="relative">
      <SetupNotice />
      <GuidedDemo />
      <Hero />
      <Console />
      <HowItWorks />
      <Positioning />
      <Footer />
    </main>
  );
}
