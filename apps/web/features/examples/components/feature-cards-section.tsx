import {
  MotionItem,
  MotionSection,
  MotionViewportStagger,
} from "@/features/examples/components/motion";
import { landingFeatures } from "@/features/landing/lib/features";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";

export function FeatureCardsSection() {
  return (
    <section
      id="features"
      className="relative isolate w-full overflow-hidden border-t border-border py-16 lg:pt-18 lg:pb-24"
    >
      <div className="relative z-10 w-full space-y-10 lg:space-y-12">
        <MotionViewportStagger className="w-full max-w-5xl space-y-2 px-4 sm:px-6 lg:px-20">
          <MotionItem>
            <h2 className="text-xl font-bold sm:text-2xl ">
              Everything you need to turn shipped work into content
            </h2>
          </MotionItem>

          <MotionItem>
            <p className="tracking-wider text-sm leading-relaxed text-muted-foreground">
              Generate from real GitHub changes, shape the output for every
              platform, and publish without rewriting the same update.
            </p>
          </MotionItem>
        </MotionViewportStagger>

        <Accordion type="multiple" className="w-full">
          <div className="grid w-full gap-4 px-4 pb-2 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-5 lg:px-20 lg:pb-8">
            {landingFeatures.map((feature, index) => (
              <MotionSection
                key={feature.title}
                className={`${getFeatureOffset(index)} min-w-0`}
              >
                <FeatureItem
                  {...feature}
                  index={index}
                  value={`feature-${index}`}
                />
              </MotionSection>
            ))}
          </div>
        </Accordion>
      </div>
    </section>
  );
}

function FeatureItem({
  title,
  description,
  // tag,
  index,
  value,
}: {
  title: string;
  description: string;
  tag?: string;
  index: number;
  value: string;
}) {
  return (
    <AccordionItem
      value={value}
      className="group relative isolate min-w-0 overflow-hidden shadow-sm shadow-white/10 transition duration-300 hover:-translate-y-1 hover:bg-foreground/5.5"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-5 z-0 font-mono text-8xl font-bold text-foreground/3 transition-colors group-hover:text-foreground/5.5"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <AccordionTrigger className="relative  z-10 items-start p-5 hover:no-underline data-[state=open]:pb-3 sm:p-6 sm:data-[state=open]:pb-3 [&>svg]:mt-1">
        <span className="flex min-w-0 flex-1 flex-col pr-1">
          <span className="flex min-h-6 items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-wider">
            <span className="text-muted-foreground">
              Feature {String(index + 1).padStart(2, "0")}
            </span>
            {/* {tag ? (
              <span className="bg-foreground/6 px-2 py-1 text-foreground/70">
                {tag}
              </span>
            ) : null} */}
          </span>

          <span className="pt-2 text-base font-semibold leading-6">
            {title}
          </span>
        </span>
      </AccordionTrigger>

      <AccordionContent className="relative z-10 px-5 pb-5 sm:px-6 sm:pb-6">
        <p className="max-w-md text-[13px] leading-6 text-muted-foreground">
          {description}
        </p>
      </AccordionContent>
    </AccordionItem>
  );
}

function getFeatureOffset(index: number) {
  if (index % 3 === 1) {
    return "lg:translate-y-4";
  }

  if (index % 3 === 2) {
    return "lg:translate-y-8";
  }

  return "";
}
