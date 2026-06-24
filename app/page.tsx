import { BuiltWith } from "@/components/BuiltWith";
import { Console } from "@/components/Console";
import { Footer } from "@/components/Footer";
import { GuidedDemo } from "@/components/GuidedDemo";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Navbar } from "@/components/Navbar";
import { Positioning } from "@/components/Positioning";
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
      <Positioning />
      <Footer />
    </main>
  );
}
