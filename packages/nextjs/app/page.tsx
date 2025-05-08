import { FeaturedLaunches } from "@/components/home/FeaturedLaunches";
import { Footer } from "@/components/home/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrendingCoins } from "@/components/home/TrendingCoins";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/90">
      <main className="flex-1">
        <HeroSection />
        <FeaturedLaunches />
        <TrendingCoins />
      </main>
      <Footer />
    </div>
  );
}
