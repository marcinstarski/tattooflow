"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function BootSplash() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const lockScroll = () => {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    };
    const unlockScroll = () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };

    lockScroll();
    const fadeTimer = setTimeout(() => setFadeOut(true), 900);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      unlockScroll();
    }, 1200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      unlockScroll();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-ink-900 transition-opacity duration-300 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <Image src="/taflologo.png" alt="TaFlo" width={240} height={80} className="h-14 w-auto opacity-90" priority />
    </div>
  );
}
