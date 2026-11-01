// Loads and saves the landing-page settings in Firestore (siteSettings/landing).
// Used by BOTH the landing page (read) and the admin "Site settings" tab (read + write).
// site.config.js stays as the defaults and as the fallback if Firestore is empty or unreachable.
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import site from "./site.config.js";

const COLLECTION = "siteSettings";
const DOC_ID = "landing";

// A copy of the file's values, taken before anything can change `site`.
// (The landing page copies the saved settings into `site` before it renders.)
export const defaults = structuredClone(site);

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

// Objects merge key by key; lists and plain values from Firestore replace the default.
function merge(base, over) {
  const out = structuredClone(base);
  for (const k of Object.keys(over || {})) {
    out[k] = isObj(over[k]) && isObj(out[k]) ? merge(out[k], over[k]) : over[k];
  }
  return out;
}

/** The saved settings merged over site.config.js. Falls back to the file on any error. */
export async function loadSite() {
  try {
    const snap = await getDoc(doc(db, COLLECTION, DOC_ID));
    return snap.exists() && snap.data().config
      ? merge(defaults, snap.data().config)
      : structuredClone(defaults);
  } catch (err) {
    console.warn("Could not load site settings, using site.config.js defaults.", err);
    return structuredClone(defaults);
  }
}

/** Saves the full settings object. firestore.rules decide who may write (admins only). */
export async function saveSite(config, uid = null) {
  const plain = JSON.parse(JSON.stringify(config)); // drops undefined, which Firestore rejects
  await setDoc(doc(db, COLLECTION, DOC_ID), {
    config: plain,
    updatedAt: serverTimestamp(),
    updatedBy: uid
  });
}
