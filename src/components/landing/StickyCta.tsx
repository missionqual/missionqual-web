"use client";

import { useEffect, useState } from "react";
import { CtaButton } from "./CtaButton";
import s from "./StickyCta.module.css";

/**
 * Shown after the hero CTA scrolls out of view, hidden again while the final
 * CTA section (#guide) is on screen. Hidden entirely at ≥1024px via CSS.
 */
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const heroBtn = document.querySelector('[data-cta="hero"]');
    const finalSection = document.getElementById("guide");
    if (!heroBtn || !finalSection || !("IntersectionObserver" in window)) return;

    let heroVisible = true;
    let finalVisible = false;
    const update = () => setShow(!heroVisible && !finalVisible);

    const heroObserver = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      update();
    });
    const finalObserver = new IntersectionObserver(
      ([entry]) => {
        finalVisible = entry.isIntersecting;
        update();
      },
      { threshold: 0.2 },
    );
    heroObserver.observe(heroBtn);
    finalObserver.observe(finalSection);
    return () => {
      heroObserver.disconnect();
      finalObserver.disconnect();
    };
  }, []);

  return (
    // inert keeps the off-screen button out of the tab order.
    <div className={`${s.sticky} ${show ? s.show : ""}`} aria-hidden={!show} inert={!show}>
      <CtaButton href="#guide" cta="sticky" className={s.btn} />
    </div>
  );
}
