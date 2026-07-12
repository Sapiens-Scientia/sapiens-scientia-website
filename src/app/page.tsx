import { YouAreHereExperience } from "@/components/lab/you-are-here";

// The homepage: one continuous scroll from the Big Bang to the reader's own
// seat on Earth, ending with the handoff into Meta Earth.
export default function Home() {
  return (
    <main className="min-h-screen bg-[#050308]">
      <YouAreHereExperience />
    </main>
  );
}
