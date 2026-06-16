import { EarthHero } from "@/components/earth-hero";
import { HomeOverview } from "@/components/home-overview";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <EarthHero />
      <HomeOverview />
      <div className="bg-black px-6 pb-8 text-white sm:px-10">
        <SiteFooter />
      </div>
    </main>
  );
}
