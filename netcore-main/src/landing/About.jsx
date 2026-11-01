import site from "./site.config.js";
import { Item, ScrollFade, Stagger } from "../motion/components.jsx";

// Motion here (settings: src/motion/motion.config.js): each block fades in as it scrolls into view
// and out as it scrolls away, tied to the scroll position. The skill chips rise in once, one by one.

export default function About() {
  const a = site.about;
  if (!a.show) return null;
  return (
    <section className="section" id={a.id}>
      <div className="wrap">
        <ScrollFade>
          <p className="section-label">{a.label}</p>
          <h2 className="section-title">{a.heading}</h2>
        </ScrollFade>
        <div className="about-grid">
          <ScrollFade className="about-text">
            {a.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </ScrollFade>
          <ScrollFade as="dl" className="facts" distance={56}>
            {a.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </ScrollFade>
        </div>
        {a.skills.length > 0 && (
          <Stagger as="ul" className="chips" aria-label="Skills">
            {a.skills.map((s) => (
              <Item as="li" key={s}>{s}</Item>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}
