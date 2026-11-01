// site-settings-form.js
// Drop-in admin form for the landing page settings.
//
//   import { mountSiteSettingsForm } from "./site-settings-form.js";
//   mountSiteSettingsForm(document.getElementById("site-settings"));
//
// It injects its own scoped CSS (classes start with "ss-"), so it will not
// clash with your admin page styles.

import { loadSite, saveSite, defaults } from "./site-config.js";
import { auth } from "../firebase.js";

/* ───────── Form definition: edit this to add or remove fields ───────── */
const F = (path, label, type = "text", extra = {}) => ({ path, label, type, ...extra });

const SECTIONS = [
  { title: "Theme", fields: [
    F("theme.default", "Theme for first-time visitors", "select", { options: ["light", "dark"] }),
    F("theme.allowToggle", "Show the light/dark switch in the header", "checkbox"),
  ]},
  { title: "Header and menu", fields: [
    F("brand", "Brand text (top left)"),
    F("nav", "Menu links", "list", {
      help: "Use #about to scroll this page, or a file name such as projects.html to open another page.",
      item: [{ key: "label", label: "Label" }, { key: "href", label: "Link" }],
    }),
  ]},
  { title: "Hero", fields: [
    F("hero.eyebrow", "Small line above the headline"),
    F("hero.headline", "Headline"),
    F("hero.tagline", "Tagline", "textarea"),
    F("hero.primaryButton.label", "Main button text"),
    F("hero.primaryButton.href", "Main button link"),
    F("hero.secondaryButton.label", "Second button text"),
    F("hero.secondaryButton.href", "Second button link"),
    F("hero.meta", "Quick facts under the buttons", "list", {
      item: [{ key: "label", label: "Label" }, { key: "value", label: "Value" }],
    }),
  ]},
  { title: "About", fields: [
    F("about.show", "Show this section", "checkbox"),
    F("about.label", "Section label"),
    F("about.heading", "Heading"),
    F("about.paragraphs", "Paragraphs", "paragraphs", { help: "Separate paragraphs with a blank line." }),
    F("about.facts", "Facts", "list", {
      item: [{ key: "label", label: "Label" }, { key: "value", label: "Value" }],
    }),
    F("about.skills", "Subjects and areas", "lines", { help: "One per line." }),
  ]},
  { title: "Contact", fields: [
    F("contact.show", "Show this section", "checkbox"),
    F("contact.label", "Section label"),
    F("contact.heading", "Heading"),
    F("contact.intro", "Intro text", "textarea"),
    F("contact.email", "Email address", "email"),
    F("contact.socials", "Social links", "list", {
      item: [{ key: "label", label: "Name" }, { key: "href", label: "Full URL" }],
    }),
    F("contact.formEndpoint", "Form endpoint URL", "url", {
      help: "Leave empty to open the visitor’s email app. Use an https:// address (Formspree, Getform, your API) to send the form as JSON.",
    }),
    F("contact.emailSubject", "Email subject"),
    F("contact.form.nameLabel", "Name field label"),
    F("contact.form.emailLabel", "Email field label"),
    F("contact.form.messageLabel", "Message field label"),
    F("contact.form.submitLabel", "Send button text"),
    F("contact.form.successText", "Success message"),
    F("contact.form.errorText", "Error message"),
  ]},
  { title: "Footer", fields: [
    F("footer.text", "Footer text"),
    F("footer.showBackToTop", "Show “back to top” link", "checkbox"),
  ]},
];

/* ───────── Small helpers ───────── */
const get = (o, p) => p.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
const set = (o, p, v) => {
  const ks = p.split("."), last = ks.pop();
  const t = ks.reduce((a, k) => (a[k] = isObj(a[k]) ? a[k] : {}), o);
  t[last] = v;
};
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

function h(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
  }
  el.append(...kids.flat().filter((x) => x != null));
  return el;
}

const allFields = () => SECTIONS.flatMap((s) => s.fields);

/* ───────── Mount ───────── */
export async function mountSiteSettingsForm(root) {
  injectStyles();
  root.classList.add("ss");
  root.replaceChildren(h("p", { class: "ss-note" }, "Loading settings…"));

  let cfg = await loadSite();
  let dirty = false;

  const status = h("span", { class: "ss-status", role: "status", "aria-live": "polite" });
  const say = (msg, kind = "") => { status.textContent = msg; status.dataset.kind = kind; };
  const touch = () => { dirty = true; say("Unsaved changes", "warn"); };

  /* One field → one DOM block */
  function renderField(f) {
    if (f.type === "list") return renderList(f);

    const toInput = (val) =>
      f.type === "lines" ? (val || []).join("\n")
      : f.type === "paragraphs" ? (val || []).join("\n\n")
      : val ?? "";
    const fromInput = (s) =>
      f.type === "lines" ? s.split("\n").map((x) => x.trim()).filter(Boolean)
      : f.type === "paragraphs" ? s.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)
      : s;

    let control;
    if (f.type === "checkbox") {
      control = h("input", { type: "checkbox", checked: !!get(cfg, f.path),
        onchange: (e) => { set(cfg, f.path, e.target.checked); touch(); } });
      return h("label", { class: "ss-check" }, control, f.label);
    }
    if (f.type === "select") {
      control = h("select", { onchange: (e) => { set(cfg, f.path, e.target.value); touch(); } },
        f.options.map((o) => h("option", { value: o, selected: get(cfg, f.path) === o }, o)));
    } else if (["textarea", "lines", "paragraphs"].includes(f.type)) {
      control = h("textarea", { rows: f.type === "textarea" ? 3 : 5,
        oninput: (e) => { set(cfg, f.path, fromInput(e.target.value)); touch(); } });
      control.value = toInput(get(cfg, f.path));
    } else {
      control = h("input", { type: f.type,
        oninput: (e) => { set(cfg, f.path, e.target.value); touch(); } });
      control.value = toInput(get(cfg, f.path));
    }
    return h("label", { class: "ss-field" },
      h("span", { class: "ss-label" }, f.label), control,
      f.help ? h("span", { class: "ss-help" }, f.help) : null);
  }

  /* Repeating rows (menu links, facts, socials …) */
  function renderList(f) {
    const wrap = h("div", { class: "ss-list" });
    const draw = () => {
      const rows = get(cfg, f.path) || [];
      wrap.replaceChildren(
        ...rows.map((row, i) => h("div", { class: "ss-row" },
          ...f.item.map((c) => {
            const inp = h("input", { type: "text", "aria-label": c.label, placeholder: c.label,
              oninput: (e) => { row[c.key] = e.target.value; touch(); } });
            inp.value = row[c.key] ?? "";
            return inp;
          }),
          h("span", { class: "ss-row-btns" },
            h("button", { type: "button", title: "Move up", "aria-label": "Move up", disabled: i === 0,
              onclick: () => { [rows[i - 1], rows[i]] = [rows[i], rows[i - 1]]; touch(); draw(); } }, "↑"),
            h("button", { type: "button", title: "Move down", "aria-label": "Move down", disabled: i === rows.length - 1,
              onclick: () => { [rows[i + 1], rows[i]] = [rows[i], rows[i + 1]]; touch(); draw(); } }, "↓"),
            h("button", { type: "button", title: "Remove", "aria-label": "Remove", class: "ss-danger",
              onclick: () => { rows.splice(i, 1); touch(); draw(); } }, "✕"))
        )),
        h("button", { type: "button", class: "ss-add",
          onclick: () => {
            const next = Object.fromEntries(f.item.map((c) => [c.key, ""]));
            set(cfg, f.path, [...(get(cfg, f.path) || []), next]); touch(); draw();
          } }, `Add ${f.label.toLowerCase().replace(/s$/, "")}`));
    };
    draw();
    return h("div", { class: "ss-field" },
      h("span", { class: "ss-label" }, f.label),
      f.help ? h("span", { class: "ss-help" }, f.help) : null, wrap);
  }

  /* Validation + clean-up before saving */
  function prepare() {
    const out = structuredClone(cfg);
    for (const f of allFields().filter((x) => x.type === "list")) {
      set(out, f.path, (get(out, f.path) || []).filter((r) =>
        f.item.some((c) => String(r[c.key] ?? "").trim())).map((r) =>
        Object.fromEntries(f.item.map((c) => [c.key, String(r[c.key] ?? "").trim()]))));
    }
    const errors = [];
    const email = (get(out, "contact.email") || "").trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Contact email isn’t a valid address.");
    const ep = (get(out, "contact.formEndpoint") || "").trim();
    set(out, "contact.formEndpoint", ep);
    if (ep && !/^https:\/\//i.test(ep)) errors.push("Form endpoint must start with https://.");
    for (const s of get(out, "contact.socials") || [])
      if (!/^https?:\/\//i.test(s.href)) errors.push(`Social link “${s.label || "?"}” needs a full URL starting with https://.`);
    for (const n of get(out, "nav") || [])
      if (!n.label || !n.href) errors.push("Every menu link needs both a label and a link.");
    return { out, errors };
  }

  const saveBtn = h("button", { type: "button", class: "ss-primary", onclick: async () => {
    const { out, errors } = prepare();
    if (errors.length) return say(errors[0], "err");
    saveBtn.disabled = true; say("Saving…");
    try {
      await saveSite(out, auth?.currentUser?.uid ?? null);
      cfg = out; dirty = false;
      say("Saved. Visitors see the changes on their next page load.", "ok");
    } catch (e) {
      say(e.code === "permission-denied"
        ? "You don’t have permission to save. Sign in with an admin account."
        : `Couldn’t save: ${e.message}`, "err");
    } finally { saveBtn.disabled = false; }
  } }, "Save changes");

  const resetBtn = h("button", { type: "button", onclick: () => {
    if (!confirm("Replace the form with the original values from site.config.js? Nothing is saved until you press Save changes.")) return;
    cfg = structuredClone(defaults); build(); touch();
  } }, "Restore defaults");

  function build() {
    root.replaceChildren(
      ...SECTIONS.map((s, i) => h("details", { class: "ss-section", open: i < 2 },
        h("summary", {}, s.title),
        h("div", { class: "ss-grid" }, s.fields.map(renderField)))),
      h("div", { class: "ss-bar" }, saveBtn, resetBtn, status));
  }
  build();

  window.addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });
}

/* ───────── Scoped styles ───────── */
function injectStyles() {
  if (document.getElementById("ss-styles")) return;
  const css = `
.ss{--ss-bg:#fff;--ss-ink:#1b1f24;--ss-mute:#5d6672;--ss-line:#d8dde3;--ss-accent:#0b5cad;--ss-ok:#146c43;--ss-err:#b3261e;--ss-warn:#8a5a00;
  font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ss-ink);max-width:760px}
@media (prefers-color-scheme:dark){.ss{--ss-bg:#14181d;--ss-ink:#e8ebef;--ss-mute:#9aa4b0;--ss-line:#2c343d;--ss-accent:#6db0f2;--ss-ok:#58c48a;--ss-err:#ff8a80;--ss-warn:#e8b34a}}
.ss *{box-sizing:border-box}
.ss-section{border:1px solid var(--ss-line);border-radius:8px;margin:0 0 12px;background:var(--ss-bg)}
.ss-section>summary{cursor:pointer;padding:12px 16px;font-weight:600;font-size:16px}
.ss-grid{display:grid;gap:16px;padding:4px 16px 16px}
.ss-field{display:grid;gap:4px}
.ss-label{font-weight:600}
.ss-help,.ss-note{color:var(--ss-mute);font-size:13px}
.ss input[type=text],.ss input[type=email],.ss input[type=url],.ss select,.ss textarea{width:100%;padding:8px 10px;border:1px solid var(--ss-line);border-radius:6px;background:var(--ss-bg);color:var(--ss-ink);font:inherit}
.ss textarea{resize:vertical}
.ss :is(input,select,textarea,button,summary):focus-visible{outline:2px solid var(--ss-accent);outline-offset:2px}
.ss-check{display:flex;gap:8px;align-items:center}
.ss-list{display:grid;gap:8px}
.ss-row{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:center}
.ss-row-btns{display:flex;gap:4px}
.ss button{font:inherit;padding:7px 12px;border:1px solid var(--ss-line);border-radius:6px;background:var(--ss-bg);color:var(--ss-ink);cursor:pointer}
.ss button:disabled{opacity:.4;cursor:default}
.ss-row-btns button{padding:6px 9px}
.ss-danger{color:var(--ss-err)!important}
.ss-add{justify-self:start;border-style:dashed!important}
.ss-primary{background:var(--ss-accent)!important;border-color:var(--ss-accent)!important;color:#fff!important;font-weight:600}
.ss-bar{position:sticky;bottom:0;display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 0;background:var(--ss-bg);border-top:1px solid var(--ss-line)}
.ss-status[data-kind=ok]{color:var(--ss-ok)}.ss-status[data-kind=err]{color:var(--ss-err)}.ss-status[data-kind=warn]{color:var(--ss-warn)}
@media (max-width:560px){.ss-row{grid-template-columns:1fr}.ss-row-btns{justify-content:flex-end}}`;
  document.head.append(h("style", { id: "ss-styles" }, css));
}
