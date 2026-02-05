"use client";

import FaceLayout from "@/components/FaceLayout";
import Flashlight from "@/components/Flashlight";

export default function BackPage() {
  return (
    <FaceLayout faceId="back" className="bg-[#373737] text-white">
      {/* Black header bar */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-black z-40" />
      <Flashlight>
        <div className="mx-auto px-6 pb-16 pt-12 max-w-[48rem] text-[15px]">
          {/* Header */}
          <p className="font-bold">Jake Rudolph</p>
          <p className="text-white/70">To be honest, still figuring it out</p>

          <hr className="my-10 border-white/20" />

          {/* Current */}
          <ul className="space-y-2 leading-relaxed">
            <li className="list-disc ml-5">
              My biggest fears are:
              <ul className="mt-2 space-y-2 ml-5">
                <li className="list-disc">1) being a <strong>boring</strong> person</li>
                <li className="list-disc">2) building communities that are exclusive</li>
                <li className="list-disc">
                  3) following a pre-defined pathway without thinking about why
                </li>
              </ul>
            </li>

            <li className="list-disc ml-5">
              Most of the time, I feel like i&apos;m both <strong>too much</strong> and{" "}
              <strong>not enough</strong>
            </li>

            <li className="list-disc ml-5">
              I believe that great things take a long time to build, often much
              longer that anyone would expect. Tenure is a value that I hold
              close, and feels contradictory to today&apos;s fashion.
            </li>

            <li className="list-disc ml-5">
              Projects i&apos;ve worked on that never caught on include:
              <ul className="mt-2 space-y-2 ml-5">
                <li className="list-disc">The Socratica theme song</li>
                <li className="list-disc">
                  Digital story-based escape rooms for studying
                </li>
                <li className="list-disc">
                  A skill-tree builder for self-development
                </li>
              </ul>
            </li>

            <li className="list-disc ml-5">
              I was diagnosed with ADHD when I was a young child, but my parents{" "}
              <strong>didn&apos;t tell me</strong> until university. I&apos;ve
              never taken medication, and often wonder what I&apos;d be like if I
              could sit still for a minute. But in ways, I feel like its a
              superpower that I don&apos;t want to dampen.
            </li>
          </ul>

          {/* Previously */}
          <h2 className="font-bold mt-10 mb-4">Previously:</h2>
          <ul className="space-y-2 leading-relaxed">
            <li className="list-disc ml-5">
              When I first moved to Canada from South Africa at 4 years old, I{" "}
              <strong>scribbled</strong> a treasure map all over my new bunk bed
              frame with permanent marker.
            </li>

            <li className="list-disc ml-5">
              I used to share a washroom with my sisters, because the en suite in
              my room was reserved as my <strong>&apos;science lab&apos;</strong>.
              Evaporation was a thrilling discovery.
            </li>

            <li className="list-disc ml-5">
              The only pizza I would eat as a child was thin-crust black olive
              pizza from Pizza Nova. Even kalamata olives wouldn&apos;t cut it. To
              this day, I&apos;m still a <strong>picky eater</strong>, but have
              expanded my diet a lot. I credit friends that have peer pressured me
              into trying new foods, like blackened salmon, mushrooms and hot pot.
            </li>

            <li className="list-disc ml-5">
              When I played competitive basketball, I&apos;d go games without
              scoring a basket. I learned how to be the person who{" "}
              <strong>tries harder than everyone else</strong>, dives for loose
              balls, sprints back on defence and is a good teammate.
            </li>

            <li className="list-disc ml-5">
              My inflection point to becoming a{" "}
              <strong>*leadership kid*</strong> was during my 8th grade student
              council, in which I was the VP of Eco, a position I&apos;ve yet to
              see anywhere else.
            </li>
          </ul>

          <hr className="my-10 border-white/20" />

          {/* Footer */}
          <div className="space-y-4">
            <p className="text-[0.9em]">
              If you made it all the way here, let&apos;s be friends!
            </p>
            <p className="text-[0.9em]">
              <a href="https://instagram.com/jakerudolph" target="_blank" rel="noopener noreferrer" className="hover:underline">Instagram</a>
              {" | "}
              <a href="https://substack.com/@jakerudolph" target="_blank" rel="noopener noreferrer" className="hover:underline">Substack</a>
              {" | "}
              <a href="mailto:jakesrudolph7@gmail.com" className="hover:underline">jakesrudolph7@gmail.com</a>
            </p>
          </div>
        </div>
      </Flashlight>
    </FaceLayout>
  );
}
