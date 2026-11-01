import { useEffect } from "react";
import site from "./site.config.js";
import motionCfg from "../motion/motion.config.js";
import { motionOn } from "../motion/env.js";
import { ScrollProgress } from "../motion/components.jsx";
import Background from "./Background.jsx";
import Header from "./Header.jsx";
import Hero from "./Hero.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";

// One page, three sections: Hero, About, Contact.
// Projects lives on its own page; the nav links to it (see site.config.js).
export default function Landing() {
  // Nav links like #about glide instead of jumping (off for people who asked for less motion).
  useEffect(() => {
    if (!motionCfg.scroll.smoothAnchors || !motionOn()) return;
    document.documentElement.style.scrollBehavior = "smooth";
    return () => { document.documentElement.style.scrollBehavior = ""; };
  }, []);

  return (
    <>
      <ScrollProgress />
      <Background />
      <Header />
      <main>
        <Hero />
        <About />
        <Contact />
      </main>
      <footer className="footer">
        <div className="wrap footer-inner">
          <span>{site.footer.text}</span>
          {site.footer.showBackToTop && <a href="#hero">Back to top</a>}
        </div>
      </footer>
    </>
  );
}
