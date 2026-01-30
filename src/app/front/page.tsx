import FaceLayout from "@/components/FaceLayout";
import CompanyLink from "@/components/CompanyLink";

export default function FrontPage() {
  return (
    <FaceLayout faceId="front" className="bg-[#f5f5f0]">
      <div className="max-w-3xl mx-auto px-6 pb-16">
        {/* Header */}
        <h1 className="text-2xl font-bold">Jake Rudolph</h1>
        <p className="text-foreground/60 mt-1">
          Creating startups, software, communities, songs, and mental models
        </p>

        <hr className="my-8 border-foreground/20" />

        {/* Current */}
        <ul className="space-y-5 text-[15px] leading-relaxed">
          <li className="list-disc ml-5">
            Led <strong>product, engineering, and design</strong> for{" "}
            <CompanyLink href="https://kindredhealth.ca" logo="/logos/kindred.svg" name="Stealth" />,
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
            <CompanyLink href="https://socratica.info" logo="/logos/socratica.svg" name="Socratica" />,
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
                <CompanyLink href="https://anthropic.com" logo="/logos/anthropic.svg" name="Anthropic" />,{" "}
                <CompanyLink href="https://shopify.com" logo="/logos/shopify.svg" name="Shopify" />,
                and{" "}
                <CompanyLink href="https://velocityincubator.com" logo="/logos/velocity.svg" name="Velocity" />,
                with 40 global nodes.
              </li>
            </ul>
          </li>

          <li className="list-disc ml-5">
            Product Builder at Simple Ventures, a venture studio co-founded
            &amp; backed by the top Canadian entrepreneurs like Mike Katchen (
            <CompanyLink href="https://wealthsimple.com" logo="/logos/wealthsimple.svg" name="Wealthsimple" />
            ), Mike Murchison (
            <CompanyLink href="https://ada.cx" logo="/logos/ada.svg" name="Ada" />
            ), and Harley Finkelstein (
            <CompanyLink href="https://shopify.com" logo="/logos/shopify.svg" name="Shopify" />
            ).
            <ul className="mt-2 space-y-2 ml-5">
              <li className="list-disc">
                Built internal tooling, dashboards, automations and CRMs for{" "}
                <CompanyLink href="https://almacare.ca" logo="/logos/almacare.svg" name="Alma Care" />.
              </li>
              <li className="list-disc">
                Architected the handbag subscription system for{" "}
                <CompanyLink href="https://zerocollective.com" logo="/logos/zerocollective.svg" name="Zero Collective" />.
              </li>
              <li className="list-disc">
                Explored the business case for new concepts in Fintech, Vertical
                AI and Health.
              </li>
            </ul>
          </li>

          <li className="list-disc ml-5">
            Studying Systems Design Engineering @{" "}
            <CompanyLink href="https://uwaterloo.ca" logo="/logos/uwaterloo.svg" name="University of Waterloo" />.
          </li>
        </ul>

        {/* Previously */}
        <h2 className="font-bold mt-10 mb-4 text-[15px]">Previously:</h2>
        <ul className="space-y-5 text-[15px] leading-relaxed">
          <li className="list-disc ml-5">
            Convinced the CEO at{" "}
            <CompanyLink href="https://outschool.com" logo="/logos/outschool.svg" name="Outschool" />{" "}
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
            <CompanyLink href="https://d2l.com" logo="/logos/d2l.svg" name="D2L" />{" "}
            which grew three sizes from its original scope to include assistive
            technology users, B2B users and &lt;16 y/o users.
          </li>

          <li className="list-disc ml-5">
            First co-op at{" "}
            <CompanyLink href="https://sunlife.com" logo="/logos/sunlife.svg" name="Sun Life" />.
            Was bored, so I self-initiated 3 projects, starting with discovery
            interviews to identify team pain points, which then led to
            redesigning a legacy tool and developing automations.
          </li>

          <li className="list-disc ml-5">
            Joined{" "}
            <CompanyLink href="https://prequel.co" logo="/logos/prequel.svg" name="Prequel" />{" "}
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
          <p className="text-sm">
            <a href="https://x.com/jakerudolph" target="_blank" rel="noopener noreferrer" className="hover:underline">X</a>
            {" | "}
            <a href="https://linkedin.com/in/jakerudolph" target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
            {" | "}
            <a href="https://github.com/jakerudolph" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
            {" | "}
            <a href="mailto:jake.rudolph@uwaterloo.ca" className="hover:underline">jake.rudolph@uwaterloo.ca</a>
          </p>

          <p className="text-sm italic text-foreground/60 leading-relaxed">
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
