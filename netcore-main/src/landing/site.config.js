// ─────────────────────────────────────────────────────────────
//  LANDING PAGE SETTINGS — everything you can customize lives here.
//  Text marked SAMPLE is placeholder content: replace it with the real details.
//  This is a personal site for a teacher; other people upload projects that
//  are shown on the separate Projects page.
//  Colors and fonts live in landing.css (the :root block at the top).
// ─────────────────────────────────────────────────────────────
const site = {
  // ── Theme (white / black) ───────────────────────────────────
  theme: {
    default: "light",        // "dark" or "light". Used on a visitor's first visit.
    allowToggle: true,      // show the dark/light switch in the header
    storageKey: "nc-theme"  // where the visitor's choice is remembered
    // NOTE: also change DEFAULT_THEME in landing.html if you change `default`,
    // so the page never flashes the wrong color while loading.
  },

  // ── Header and navigation ───────────────────────────────────
  brand: "DR. DEVISHREE NAIDU", // SAMPLE: text at the left of the header
  nav: [
    // label: text shown. href: "#id" scrolls this page, "file.html" opens another page.
    { label: "About", href: "#about" },
    { label: "Projects", href: "projects.html" }, // the public gallery (reads Firestore, no sign-in needed)
    { label: "Upload", href: "upload.html" },     // guests are asked to sign in there (auth.html)
    { label: "Contact", href: "#contact" }
  ],

  // ── Hero ────────────────────────────────────────────────────
  hero: {
    eyebrow: "DEPARTMENT OF COMPUTER SCIENCE",                    // SAMPLE
    headline: "DR. DEVISHREE NAIDU",                                // SAMPLE
    tagline: "Assistant Professor, mentor and guide. Explore the projects built by my students.", // SAMPLE
    primaryButton: { label: "Browse projects", href: "projects.html" },
    secondaryButton: { label: "Get in touch", href: "#contact" },
    // small label/value pairs under the buttons. Delete the array items to hide them.
    meta: [
      { label: "Teaches", value: "Computer Networks" }, // SAMPLE
      { label: "Department", value: "Computer Science" },       // SAMPLE
      { label: "Office hours", value: "Mon–Fri, 9:00-5:00" }    // SAMPLE
    ]
  },

  // ── About ───────────────────────────────────────────────────
  about: {
    show: true,                    // false removes the section
    id: "about",
    label: "ABOUT",
    heading: "About me",                                          // SAMPLE
    paragraphs: [                                                // SAMPLE
      "I have taught computer science for over 19 years. I enjoy helping students turn what they learn in class into projects they are proud to show.",
      "This site collects the projects my students build, so their work can be seen, shared and built on."
    ],
    facts: [                                                     // SAMPLE
      { label: "Institution", value: "RamdeoBaba University" },
      { label: "Department", value: "Computer Science and Engineering" },
      { label: "Qualification", value: "Ph.D., IoT Security" },
      { label: "Experience", value: "20+ years of teaching" }
    ],
    skills: [ "Computer Networks", "Internet Of Things", "Juniper JNCIA", "Palo Alto Networks"] // SAMPLE: subjects and areas
  },

  // ── Contact ─────────────────────────────────────────────────
  contact: {
    show: true,
    id: "contact",
    label: "CONTACT",
    heading: "Contact Me",                                       // SAMPLE
    intro: "Questions about a course, a project or a collaboration? Send a message and I will reply.", // SAMPLE
    email: "naidud@rbunagpur.in",                                // SAMPLE: her real address
    socials: [                                                   // SAMPLE: her real links; delete items not used
      { label: "GitHub", href: "https://github.com/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/dr-devishree-naidu-68a938b7" }
    ],
    // Where the form sends messages.
    //  ""  → opens the visitor's email app addressed to `email` (no server needed).
    //  "https://..." → sends the form as JSON with POST (Formspree, Getform, your own API).
    formEndpoint: "",
    emailSubject: "Message from the website",
    form: {
      nameLabel: "Name",
      emailLabel: "Email",
      messageLabel: "Message",
      submitLabel: "Send message",
      successText: "Thanks, your message was sent.",
      errorText: "Something went wrong. Please email me directly."
    }
  },

  // ── Footer ──────────────────────────────────────────────────
  footer: {
    text: "Built by Devansh & Chhayank", // SAMPLE
    showBackToTop: true
  }
};

export default site;
