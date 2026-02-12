import FaceLayout from "@/components/FaceLayout";
import CompanyLink from "@/components/CompanyLink";

const pill = { scale: 0.75, verticalOffset: 0, shineWhite: true, shineDuration: 1000 } as const;

export default function FrontPage() {
  return (
    <FaceLayout faceId="front" className="bg-[#FFFFFF] text-[#434343]">
      <div className="mx-auto px-7 pb-12 max-w-[52rem] text-[18px] leading-[1.4]">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-[32px] font-bold tracking-tight leading-[1.1]">
            Jake Rudolph
          </h1>
          <p className="mt-2 text-[17px] text-foreground/50 leading-[1.5]">
            Creating startups, software, communities, songs, and mental models
          </p>
        </div>

        {/* Now */}
        <section className="mb-14">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/35 mb-6">
            Now
          </h2>

          <div className="space-y-8">
            {/* Kindred */}
            <div>
              <p>
                Led <strong>product, engineering, and design</strong> for{" "}
                <CompanyLink href="https://kindredhealth.ca" logo="/logos/kindred.png" name="Stealth" bgColor="#f5e6e0" {...pill} />,
                a B2B2C healthcare marketplace platform as the sole product builder,
                working alongside the CEO.
              </p>
              <p className="mt-3 pl-5 border-l-2 border-foreground/10 text-foreground/70">
                Grew from no customers, supply or product to{" "}
                <strong className="text-[#434343]">5 pilot customers (4,000 employees),</strong> 12 care
                experts and an end-to-end product with SOC 2 compliance in 90
                days.
              </p>
            </div>

            {/* Socratica */}
            <div>
              <p>
                Hosting{" "}
                <CompanyLink href="https://socratica.info" logo="/logos/socratica.png" name="Socratica" bgColor="#f5f0e0" {...pill} />,
                a community of kind, ambitious people that meets weekly to make and
                share progress on our passion projects.
              </p>
              <div className="mt-3 pl-5 border-l-2 border-foreground/10 space-y-3 text-foreground/70">
                <p>
                  Rented out a hockey rink for Symposium, the{" "}
                  <strong className="text-[#434343]">world&apos;s largest student-run demo day</strong> with
                  80 projects and 2,500 attendees.
                </p>
                <p>
                  Supported by{" "}
                  <CompanyLink href="https://anthropic.com" logo="/logos/anthropic.png" name="Anthropic" bgColor="#f5e0dc" {...pill} />,{" "}
                  <CompanyLink href="https://shopify.com" logo="/logos/shopify.svg" name="Shopify" bgColor="#e8ebe0" {...pill} />,
                  and{" "}
                  <CompanyLink href="https://velocityincubator.com" logo="/logos/velocity.png" name="Velocity" bgColor="#d4d4d4" {...pill} />,
                  with 40 global nodes.
                </p>
              </div>
            </div>

            {/* Simple Ventures */}
            <div>
              <p>
                Product Builder at Simple Ventures, a venture studio co-founded
                &amp; backed by the top Canadian entrepreneurs like Mike Katchen{" "}
                <CompanyLink href="https://wealthsimple.com" logo="/logos/wealthsimple.png" name="Wealthsimple" bgColor="#e0e5e8" {...pill} />
                , Mike Murchison{" "}
                <CompanyLink href="https://ada.cx" logo="/logos/ada.png" name="Ada" bgColor="#e8e0f0" {...pill} />
                , and Harley Finkelstein{" "}
                <CompanyLink href="https://shopify.com" logo="/logos/shopify.svg" name="Shopify" bgColor="#e8ebe0" {...pill} />
                .
              </p>
              <div className="mt-3 pl-5 border-l-2 border-foreground/10 space-y-3 text-foreground/70">
                <p>
                  Built internal tooling, dashboards, automations and CRMs for{" "}
                  <CompanyLink href="https://almacare.ca" logo="/logos/almacares.png" name="Alma Care" bgColor="#e0f0eb" {...pill} />.
                </p>
                <p>
                  Architected the handbag subscription system for{" "}
                  <CompanyLink href="https://zerocollective.com" logo="/logos/zerocollective.png" name="Zero Collective" bgColor="#d8d8d8" {...pill} />.
                </p>
                <p>
                  Explored the business case for new concepts in Fintech, Vertical
                  AI and Health.
                </p>
              </div>
            </div>

            {/* Waterloo */}
            <div>
              <p>
                Studying Systems Design Engineering @{" "}
                <CompanyLink href="https://uwaterloo.ca" logo="/logos/uwaterloo.svg" name="University of Waterloo" bgColor="#f5f0dc" {...pill} />.
              </p>
            </div>
          </div>
        </section>

        {/* Previously */}
        <section className="mb-14">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/35 mb-6">
            Previously
          </h2>

          <div className="space-y-8">
            {/* Outschool */}
            <div>
              <p>
                Convinced the CEO at{" "}
                <CompanyLink href="https://outschool.com" logo="/logos/outschool.png" name="Outschool" bgColor="#e8e0f5" {...pill} />{" "}
                to sunset an underperforming product.
              </p>
              <p className="mt-3 pl-5 border-l-2 border-foreground/10 text-foreground/70">
                Also dove deep into value perception, recommendations, and
                learning outcomes.
              </p>
            </div>

            {/* D2L */}
            <div>
              <p>
                Led an end-to-end navigation research project at{" "}
                <CompanyLink href="https://d2l.com" logo="/logos/d2l.png" name="D2L" bgColor="#f5e8dc" {...pill} />{" "}
                which grew three sizes from its original scope to include assistive
                technology users, B2B users and &lt;16 y/o users.
              </p>
            </div>

            {/* Sun Life */}
            <div>
              <p>
                First co-op at{" "}
                <CompanyLink href="https://sunlife.com" logo="/logos/sunlife.png" name="Sun Life" bgColor="#f5f0dc" {...pill} />.
                Was bored, so I self-initiated 3 projects, starting with discovery
                interviews to identify team pain points, which then led to
                redesigning a legacy tool and developing automations.
              </p>
            </div>

            {/* Prequel */}
            <div>
              <p>
                Joined{" "}
                <CompanyLink href="https://prequel.co" logo="/logos/prequel.png" name="Prequel" bgColor="#f0e0f0" {...pill} />{" "}
                as an early employee, owning cx and ops leading to an acquisition.
              </p>
            </div>

            {/* Basketball */}
            <div>
              <p>
                Worked my first job as a basketball coach at 13 through to the end
                of high school.
              </p>
              <p className="mt-3 pl-5 border-l-2 border-foreground/10 text-foreground/70">
                Was the youngest registered Head Coach for a rep team in Ontario
                in my senior year.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-foreground/10">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
            <a href="https://x.com/jakerudolph" target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-foreground/80 transition-colors">X</a>
            <a href="https://linkedin.com/in/jakerudolph" target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-foreground/80 transition-colors">LinkedIn</a>
            <a href="https://github.com/jakerudolph" target="_blank" rel="noopener noreferrer" className="text-foreground/40 hover:text-foreground/80 transition-colors">GitHub</a>
            <a href="mailto:jake.rudolph@uwaterloo.ca" className="text-foreground/40 hover:text-foreground/80 transition-colors">jake.rudolph@uwaterloo.ca</a>
          </div>

          <p className="mt-6 text-[14px] leading-[1.6] italic text-foreground/35">
            This page is what inspired my personal website concept. At face
            value, its resume-esque aesthetic is an accurate summary of my
            largest accomplishments and career milestones. But, it lacks depth
            and dimension. This 3-D cube site is built for people who truly want
            to learn about the faces that make me, me.
          </p>
        </footer>
      </div>
    </FaceLayout>
  );
}
