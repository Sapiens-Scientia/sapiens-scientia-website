import Image from "next/image";
import Link from "next/link";

export function ObservableUniverseView() {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white"
      aria-label="Observable universe alternate view"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.14),rgba(3,7,18,0.38)_36%,rgba(0,0,0,0.96)_76%)]" />

      <div className="pointer-events-none absolute left-1/2 top-5 z-10 w-[min(34rem,calc(100vw-2.5rem))] -translate-x-1/2 text-center">
        <h1 className="text-balance text-2xl font-semibold leading-none tracking-normal text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.65)] sm:text-4xl">
          <span>Observable Universe</span>
          <br />
          <span className="mt-1 inline-block text-lg font-medium text-slate-400 sm:text-2xl">
            93 Billion Light Years Diameter
          </span>
        </h1>
      </div>

      <figure className="relative mt-12 flex h-[min(78vh,84vw)] w-[min(78vh,84vw)] items-center justify-center sm:mt-10">
        <Image
          src="/images/observable-universe-logarithmic-illustration.png"
          alt="Logarithmic illustration of the observable universe, centered on the Solar System and expanding outward through nearby stars, the Milky Way, galaxies, cosmic web, cosmic microwave background, and Big Bang plasma."
          width={1920}
          height={1920}
          priority
          className="h-full w-full object-contain drop-shadow-[0_0_42px_rgba(186,230,253,0.2)]"
        />
        <Link
          href="/?intro=skip"
          aria-label="Zoom into the History of Planet Earth in the Milky Way"
          title="Zoom into the History of Planet Earth"
          className="absolute left-1/2 top-1/2 z-10 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/58 bg-cyan-200/[0.025] shadow-[0_0_42px_rgba(56,189,248,0.28),inset_0_0_26px_rgba(56,189,248,0.14)] transition-all hover:scale-105 hover:border-cyan-50/90 hover:bg-cyan-100/[0.045] hover:shadow-[0_0_56px_rgba(56,189,248,0.38),inset_0_0_32px_rgba(56,189,248,0.2)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
        />
        <figcaption className="absolute -bottom-7 left-1/2 w-[min(36rem,calc(100vw-3rem))] -translate-x-1/2 text-center text-[0.62rem] font-medium leading-4 text-slate-500">
          Image by{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Observable_universe_logarithmic_illustration.png"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 underline-offset-4 transition-colors hover:text-sky-200 hover:underline"
          >
            Pablo Carlos Budassi
          </a>
          , licensed{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 underline-offset-4 transition-colors hover:text-sky-200 hover:underline"
          >
            CC BY-SA 3.0
          </a>
          .
        </figcaption>
      </figure>
    </section>
  );
}
