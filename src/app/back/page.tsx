"use client";

import FaceLayout from "@/components/FaceLayout";
import Flashlight from "@/components/Flashlight";

export default function BackPage() {
  return (
    <FaceLayout
      faceId="back"
      className="bg-[#1a1a1a] text-white"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}
    >
      <Flashlight fullscreen>
        {/* z-50 keeps content above the z-40 dark overlay — always readable */}
        <div className="relative mx-auto px-7 pb-12 max-w-[52rem] text-[18px] leading-[1.4]">

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-[32px] tracking-tight leading-[1.1]">Jake Rudolph</h1>
            <p className="mt-2 text-[17px] text-white/50 leading-[1.5]">To be honest, still figuring it out</p>
          </div>

          {/* Right Now */}
          <section className="mb-14">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/35 mb-6">
              Right Now
            </h2>

            <div className="space-y-8">
              <div>
                <p>My biggest fears are:</p>
                <div className="mt-3 pl-5 border-l-2 border-white/10 space-y-3 text-white/70">
                  <p>1) being a <strong className="text-white">boring</strong> person</p>
                  <p>2) building communities that are exclusive</p>
                  <p>3) following a pre-defined pathway without thinking about why</p>
                </div>
              </div>

              <div>
                <p>Most of the time, I feel like I&apos;m both <strong>too much</strong> and <strong>not enough</strong>.</p>
              </div>

              <div>
                <p>I believe that great things take a long time to build, often much longer than anyone would expect. Tenure is a value that I hold close, and feels contradictory to today&apos;s fashion.</p>
              </div>

              <div>
                <p>Projects I&apos;ve worked on that never caught on:</p>
                <div className="mt-3 pl-5 border-l-2 border-white/10 space-y-3 text-white/70">
                  <p>The Socratica theme song</p>
                  <p>Digital story-based escape rooms for studying</p>
                  <p>A skill-tree builder for self-development</p>
                </div>
              </div>

              <div>
                <p>I was diagnosed with ADHD when I was a young child, but my parents <strong>didn&apos;t tell me</strong> until university.</p>
                <p className="mt-3 pl-5 border-l-2 border-white/10 text-white/70">
                  I&apos;ve never taken medication, and often wonder what I&apos;d be like if I could sit still for a minute. But in ways, I feel like it&apos;s a superpower that I don&apos;t want to dampen.
                </p>
              </div>
            </div>
          </section>

          {/* Previously */}
          <section className="mb-14">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/35 mb-6">
              Previously
            </h2>

            <div className="space-y-8">
              <div>
                <p>When I first moved to Canada from South Africa at 4 years old, I <strong>scribbled</strong> a treasure map all over my new bunk bed frame with permanent marker.</p>
              </div>

              <div>
                <p>I used to share a washroom with my sisters, because the en suite in my room was reserved as my <strong>&apos;science lab&apos;</strong>. Evaporation was a thrilling discovery.</p>
              </div>

              <div>
                <p>The only pizza I would eat as a child was thin-crust black olive pizza from Pizza Nova.</p>
                <p className="mt-3 pl-5 border-l-2 border-white/10 text-white/70">
                  To this day, I&apos;m still a <strong className="text-white">picky eater</strong>, but have expanded my diet a lot. I credit friends that have peer pressured me into trying new foods, like blackened salmon, mushrooms and hot pot.
                </p>
              </div>

              <div>
                <p>When I played competitive basketball, I&apos;d go games without scoring a basket.</p>
                <p className="mt-3 pl-5 border-l-2 border-white/10 text-white/70">
                  I learned how to be the person who <strong className="text-white">tries harder than everyone else</strong>, dives for loose balls, sprints back on defence and is a good teammate.
                </p>
              </div>

              <div>
                <p>My inflection point to becoming a <strong>leadership kid</strong> was during my 8th grade student council, in which I was the VP of Eco — a position I&apos;ve yet to see anywhere else.</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-8 border-t border-white/10">
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
              <a href="https://instagram.com/jakerudolph" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/80 transition-colors">Instagram</a>
              <a href="https://substack.com/@jakerudolph" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/80 transition-colors">Substack</a>
              <a href="mailto:jakesrudolph7@gmail.com" className="text-white/40 hover:text-white/80 transition-colors">jakesrudolph7@gmail.com</a>
            </div>
            <p className="mt-6 text-[14px] leading-[1.6] italic text-white/35">
              If you made it all the way here, let&apos;s be friends!
            </p>
          </footer>
        </div>
      </Flashlight>
    </FaceLayout>
  );
}
