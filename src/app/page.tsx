import { HomeBigBangExperience } from "@/components/home-big-bang-experience";

type HomeProps = {
  searchParams?: Promise<{
    intro?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const skipIntro = params?.intro === "skip";

  return <HomeBigBangExperience key={skipIntro ? "skip-intro" : "intro"} skipIntro={skipIntro} />;
}
