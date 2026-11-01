import site from "./site.config.js";
import { Item, ScrollFade, Stagger } from "../motion/components.jsx";

// Motion here (settings: src/motion/motion.config.js):
//   Stagger mode="load"  the lines rise in one after another when the page opens
//   ScrollFade mode="out" the text fades and drifts up as you scroll away from it
export default function Hero() {
  const h = site.hero;
  return (
    <section className="hero" id="hero">
      <ScrollFade mode="out" className="wrap">
        <Stagger mode="load">
          <Item as="p" className="eyebrow">{h.eyebrow}</Item>
          <Item as="h1" className="hero-title">{h.headline}</Item>
          <Item as="p" className="hero-tagline">{h.tagline}</Item>
          <Item className="hero-actions">
            <a className="btn btn-primary" href={h.primaryButton.href}>{h.primaryButton.label}</a>
            <a className="btn btn-ghost" href={h.secondaryButton.href}>{h.secondaryButton.label}</a>
          </Item>
          {h.meta.length > 0 && (
            <Item as="dl" className="hero-meta">
              {h.meta.map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
            </Item>
          )}
        </Stagger>
      </ScrollFade>
    </section>
  );
}
