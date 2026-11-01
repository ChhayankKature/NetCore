import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { enterPage } from "./pageTransition.js";

// Wrap each page in this (see the entry.jsx files). It fades the page in after the first
// render and makes every motion component respect the visitor's "reduce motion" setting.
export default function MotionRoot({ children }) {
  useEffect(() => { enterPage(); }, []);
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
