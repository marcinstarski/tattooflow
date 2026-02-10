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
      document.documentElement.classList.add("splash-active");
    };
    const unlockScroll = () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.documentElement.classList.remove("splash-active");
    };

    lockScroll();
    const fadeTimer = setTimeout(() => setFadeOut(true), 1200);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      unlockScroll();
    }, 1700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      unlockScroll();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-ink-900 transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <Image src="/taflologo.png" alt="TaFlo" width={240} height={80} className="h-14 w-auto opacity-90" priority />
    </div>
  );
}
