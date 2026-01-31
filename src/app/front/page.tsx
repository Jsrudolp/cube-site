import FaceLayout from "@/components/FaceLayout";
import CompanyLink from "@/components/CompanyLink";

export default function FrontPage() {
  return (
    <FaceLayout faceId="front" className="bg-[#FFFFFF]">
      <div className="mx-auto px-6 pb-16 max-w-[48rem] text-[15px]">
        {/* Header */}
        <p className="font-bold">Jake Rudolph</p>
        <p className="text-foreground/70">
          Creating startups, software, communities, songs, and mental models
        </p>

        <hr className="my-10 border-foreground/20" />

        {/* Current */}
        <ul className="space-y-2 leading-relaxed">
          <li className="list-disc ml-5">
            Led <strong>product, engineering, and design</strong> for{" "}
            <CompanyLink href="https://kindredhealth.ca" logo="/logos/kindred.png" name="Stealth" bgColor="#f5e6e0" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />,
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
            <CompanyLink href="https://socratica.info" logo="/logos/socratica.png" name="Socratica" bgColor="#f5f0e0" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />,
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
                <CompanyLink href="https://anthropic.com" logo="/logos/anthropic.png" name="Anthropic" bgColor="#f5e0dc" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />,{" "}
                <CompanyLink href="https://shopify.com" logo="/logos/shopify.svg" name="Shopify" bgColor="#e8ebe0" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />,
                and{" "}
                <CompanyLink href="https://velocityincubator.com" logo="/logos/velocity.png" name="Velocity" bgColor="#d4d4d4" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />,
                with 40 global nodes.
              </li>
            </ul>
          </li>

          <li className="list-disc ml-5">
            Product Builder at Simple Ventures, a venture studio co-founded
            &amp; backed by the top Canadian entrepreneurs like Mike Katchen (
            <CompanyLink href="https://wealthsimple.com" logo="/logos/wealthsimple.png" name="Wealthsimple" bgColor="#e0e5e8" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />
            ), Mike Murchison (
            <CompanyLink href="https://ada.cx" logo="/logos/ada.png" name="Ada" bgColor="#e8e0f0" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />
            ), and Harley Finkelstein (
            <CompanyLink href="https://shopify.com" logo="/logos/shopify.svg" name="Shopify" bgColor="#e8ebe0" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />
            ).
            <ul className="mt-2 space-y-2 ml-5">
              <li className="list-disc">
                Built internal tooling, dashboards, automations and CRMs for{" "}
                <CompanyLink href="https://almacare.ca" logo="/logos/almacare.png" name="Alma Care" bgColor="#e0f0eb" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />.
              </li>
              <li className="list-disc">
                Architected the handbag subscription system for{" "}
                <CompanyLink href="https://zerocollective.com" logo="/logos/zerocollective.png" name="Zero Collective" bgColor="#d8d8d8" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />.
              </li>
              <li className="list-disc">
                Explored the business case for new concepts in Fintech, Vertical
                AI and Health.
              </li>
            </ul>
          </li>

          <li className="list-disc ml-5">
            Studying Systems Design Engineering @{" "}
            <CompanyLink href="https://uwaterloo.ca" logo="/logos/uwaterloo.svg" name="University of Waterloo" bgColor="#f5f0dc" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />.
          </li>
        </ul>

        {/* Previously */}
        <h2 className="font-bold mt-10 mb-4">Previously:</h2>
        <ul className="space-y-2 leading-relaxed">
          <li className="list-disc ml-5">
            Convinced the CEO at{" "}
            <CompanyLink href="https://outschool.com" logo="/logos/outschool.png" name="Outschool" bgColor="#e8e0f5" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />{" "}
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
            <CompanyLink href="https://d2l.com" logo="/logos/d2l.png" name="D2L" bgColor="#f5e8dc" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />{" "}
            which grew three sizes from its original scope to include assistive
            technology users, B2B users and &lt;16 y/o users.
          </li>

          <li className="list-disc ml-5">
            First co-op at{" "}
            <CompanyLink href="https://sunlife.com" logo="/logos/sunlife.png" name="Sun Life" bgColor="#f5f0dc" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />.
            Was bored, so I self-initiated 3 projects, starting with discovery
            interviews to identify team pain points, which then led to
            redesigning a legacy tool and developing automations.
          </li>

          <li className="list-disc ml-5">
            Joined{" "}
            <CompanyLink href="https://prequel.co" logo="/logos/prequel.png" name="Prequel" bgColor="#f0e0f0" scale={0.85} verticalOffset={2} shineWhite={true} shineDuration={600} />{" "}
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
