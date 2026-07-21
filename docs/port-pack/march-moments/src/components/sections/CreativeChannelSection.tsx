import Step3CreativeViz from "../visualizations/Step3CreativeViz";
import type { MarchMadnessMomentsContent } from "../../content/marchMadnessMoments";
import { Reveal } from "../motion/MotionPrimitives";

type CreativeChannelSectionProps = {
  header: string;
  paragraph: string;
  creativeViz: MarchMadnessMomentsContent["creativeAndChannel"]["creativeViz"];
};

function CreativeChannelSection({ header, paragraph, creativeViz }: CreativeChannelSectionProps) {
  const [triggerPrefix, triggerSuffix] = creativeViz.triggerTitle.split(": ");

  return (
    <Reveal
      id="creative"
      as="section"
      className="section-shell scroll-mt-24 border border-slate-200/80"
    >
      <h2 className="section-title">{header}</h2>
      <p className="section-copy">{paragraph}</p>
      <div className="mt-4 -mx-6 border-y border-slate-200 bg-slate-50/70 px-6 py-3 text-center md:hidden">
        <p className="text-base font-bold text-slate-900">
          {triggerSuffix ? (
            <>
              <span className="block">{`${triggerPrefix}:`}</span>
              <span className="block">{triggerSuffix}</span>
            </>
          ) : (
            creativeViz.triggerTitle
          )}
        </p>
        <p className="mt-1 text-base text-slate-700">{creativeViz.exampleEvent}</p>
      </div>
      <Step3CreativeViz data={creativeViz} />
    </Reveal>
  );
}

export default CreativeChannelSection;
