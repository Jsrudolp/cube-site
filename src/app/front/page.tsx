"use client";

import { useState } from "react";
import FaceLayout from "@/components/FaceLayout";
import CompanyLink from "@/components/CompanyLink";

export default function FrontPage() {
  // Design toggles
  const [darkerSubtitle, setDarkerSubtitle] = useState(false);
  const [widerHrMargin, setWiderHrMargin] = useState(false);
  const [strongerPreviouslySection, setStrongerPreviouslySection] = useState(false);
  const [widerListSpacing, setWiderListSpacing] = useState(false);
  const [adjustedPillMargin, setAdjustedPillMargin] = useState(false);

  // Computed values based on toggles
  const subtitleClass = darkerSubtitle ? "text-foreground/70" : "text-foreground/60";
  const hrMarginClass = widerHrMargin ? "my-10" : "my-8";
  const previouslyMarginClass = strongerPreviouslySection ? "mt-14 mb-5" : "mt-10 mb-4";
  const listSpacingClass = widerListSpacing ? "space-y-6" : "space-y-5";
  const pillMargin = adjustedPillMargin ? "-0.25rem" : "-0.125rem";

  return (
    <FaceLayout faceId="front" className="bg-[#FFFFFF]">
      {/* Design toggle panel */}
      <div className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur border border-gray-200 rounded-lg p-4 shadow-lg space-y-3 text-sm max-w-xs">
        <div className="font-medium text-gray-700 mb-2">Design Toggles</div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={darkerSubtitle}
            onChange={(e) => setDarkerSubtitle(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-600">Darker subtitle (60% → 70%)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={widerHrMargin}
            onChange={(e) => setWiderHrMargin(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-600">Wider HR margin (my-8 → my-10)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={strongerPreviouslySection}
            onChange={(e) => setStrongerPreviouslySection(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-600">Stronger &quot;Previously&quot; section</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={widerListSpacing}
            onChange={(e) => setWiderListSpacing(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-600">Wider list spacing (y-5 → y-6)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={adjustedPillMargin}
            onChange={(e) => setAdjustedPillMargin(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-600">Adjusted pill margin (-my-1)</span>
        </label>
      </div>

      <div className="mx-auto px-6 pb-16 max-w-[48rem] text-[15px]">
        {/* Header */}
        <h1 className="text-[1.6em] font-bold">Jake Rudolph</h1>
        <p className={`${subtitleClass} mt-1`}>
          Creating startups, software, communities, songs, and mental models
        </p>

        <hr className={`${hrMarginClass} border-foreground/20`} />

        {/* Current */}
        <ul className={`${listSpacingClass} leading-relaxed`}>
          <li className="list-disc ml-5">
            Led <strong>product, engineering, and design</strong> for{" "}
            <CompanyLink href="https://kindredhealth.ca" logo="/logos/kindred.svg" name="Stealth" bgColor="#f5e6e0" verticalMargin={pillMargin} />,
            a B2B2C healthcare marketplace platform as the sole product builder,
            working alongside the CEO.
            <ul className="mt-2 space-y-2 ml-5">
              <li className="list-disc">
                Grew from no customers, supply or product to{" "}
                <strong>5 pilot customers (4,000 employees),</strong> 12 care
                experts and an end-to-end product with SOC 2 compliance in 90
                days.
              </li>
            </ul>
          </li>

          <li className="list-disc ml-5">
            Hosting{" "}
            <CompanyLink href="https://socratica.info" logo="/logos/socratica.svg" name="Socratica" bgColor="#f5f0e0" verticalMargin={pillMargin} />,
            a community of kind, ambitious people that meets weekly to make and
            share progress on our passion projects.
            <ul className="mt-2 space-y-2 ml-5">
              <li className="list-disc">
                Rented out a hockey rink for Symposium, the{" "}
                <strong>world&apos;s largest student-run demo day</strong> with
                80 projects and 2,500 attendees.
              </li>
              <li className="list-disc">
                Supported by{" "}
                <CompanyLink href="https://anthropic.com" logo="/logos/anthropic.svg" name="Anthropic" bgColor="#f5e0dc" verticalMargin={pillMargin} />,{" "}
                <CompanyLink href="https://shopify.com" logo="/logos/shopify.svg" name="Shopify" bgColor="#e8ebe0" verticalMargin={pillMargin} />,
                and{" "}
                <CompanyLink href="https://velocityincubator.com" logo="/logos/velocity.svg" name="Velocity" bgColor="#e5e5e5" verticalMargin={pillMargin} />,
                with 40 global nodes.
              </li>
            </ul>
          </li>

          <li className="list-disc ml-5">
            Product Builder at Simple Ventures, a venture studio co-founded
            &amp; backed by the top Canadian entrepreneurs like Mike Katchen (
            <CompanyLink href="https://wealthsimple.com" logo="/logos/wealthsimple.svg" name="Wealthsimple" bgColor="#e5e5e5" verticalMargin={pillMargin} />
            ), Mike Murchison (
            <CompanyLink href="https://ada.cx" logo="/logos/ada.svg" name="Ada" bgColor="#e8e0f0" verticalMargin={pillMargin} />
            ), and Harley Finkelstein (
            <CompanyLink href="https://shopify.com" logo="/logos/shopify.svg" name="Shopify" bgColor="#e8ebe0" verticalMargin={pillMargin} />
            ).
            <ul className="mt-2 space-y-2 ml-5">
              <li className="list-disc">
                Built internal tooling, dashboards, automations and CRMs for{" "}
                <CompanyLink href="https://almacare.ca" logo="/logos/almacare.svg" name="Alma Care" bgColor="#e0f0eb" verticalMargin={pillMargin} />.
              </li>
              <li className="list-disc">
                Architected the handbag subscription system for{" "}
                <CompanyLink href="https://zerocollective.com" logo="/logos/zerocollective.svg" name="Zero Collective" bgColor="#e5e5e5" verticalMargin={pillMargin} />.
              </li>
              <li className="list-disc">
                Explored the business case for new concepts in Fintech, Vertical
                AI and Health.
              </li>
            </ul>
          </li>

          <li className="list-disc ml-5">
            Studying Systems Design Engineering @{" "}
            <CompanyLink href="https://uwaterloo.ca" logo="/logos/uwaterloo.svg" name="University of Waterloo" bgColor="#f5f0dc" verticalMargin={pillMargin} />.
          </li>
        </ul>

        {/* Previously */}
        {strongerPreviouslySection && <hr className="mt-14 border-foreground/20" />}
        <h2 className={`font-bold ${previouslyMarginClass}`}>Previously:</h2>
        <ul className={`${listSpacingClass} leading-relaxed`}>
          <li className="list-disc ml-5">
            Convinced the CEO at{" "}
            <CompanyLink href="https://outschool.com" logo="/logos/outschool.svg" name="Outschool" bgColor="#e8e0f5" verticalMargin={pillMargin} />{" "}
            to sunset an underperforming product.
            <ul className="mt-2 space-y-2 ml-5">
              <li className="list-disc">
                Also dove deep into value perception, recommendations, and
                learning outcomes.
              </li>
            </ul>
          </li>

          <li className="list-disc ml-5">
            Led an end-to-end navigation research project at{" "}
            <CompanyLink href="https://d2l.com" logo="/logos/d2l.svg" name="D2L" bgColor="#f5e8dc" verticalMargin={pillMargin} />{" "}
            which grew three sizes from its original scope to include assistive
            technology users, B2B users and &lt;16 y/o users.
          </li>

          <li className="list-disc ml-5">
            First co-op at{" "}
            <CompanyLink href="https://sunlife.com" logo="/logos/sunlife.svg" name="Sun Life" bgColor="#f5f0dc" verticalMargin={pillMargin} />.
            Was bored, so I self-initiated 3 projects, starting with discovery
            interviews to identify team pain points, which then led to
            redesigning a legacy tool and developing automations.
          </li>

          <li className="list-disc ml-5">
            Joined{" "}
            <CompanyLink href="https://prequel.co" logo="/logos/prequel.svg" name="Prequel" bgColor="#f0e0f0" verticalMargin={pillMargin} />{" "}
            as an early employee, owning cx and ops leading to an acquisition.
          </li>

          <li className="list-disc ml-5">
            Worked my first job as a basketball coach at 13 through to the end
            of high school.
            <ul className="mt-2 space-y-2 ml-5">
              <li className="list-disc">
                Was the youngest registered Head Coach for a rep team in Ontario
                in my senior year.
              </li>
            </ul>
          </li>
        </ul>

        <hr className="my-10 border-foreground/20" />

        {/* Footer */}
        <div className="space-y-4">
          <p className="text-[0.9em]">
            <a href="https://x.com/jakerudolph" target="_blank" rel="noopener noreferrer" className="hover:underline">X</a>
            {" | "}
            <a href="https://linkedin.com/in/jakerudolph" target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
            {" | "}
            <a href="https://github.com/jakerudolph" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
            {" | "}
            <a href="mailto:jake.rudolph@uwaterloo.ca" className="hover:underline">jake.rudolph@uwaterloo.ca</a>
          </p>

          <p className="text-[0.9em] italic text-foreground/60 leading-relaxed">
            This page is what inspired my personal website concept. At face
            value, its resume-esque aesthetic is an accurate summary of my
            largest accomplishments and career milestones. But, it lacks depth
            and dimension. This 3-D cube site is built for people who truly want
            to learn about the faces that make me, me.
          </p>
        </div>
      </div>
    </FaceLayout>
  );
}
