"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function BootSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900">
      <Image src="/taflologo.png" alt="TaFlo" width={240} height={80} className="h-14 w-auto opacity-90" priority />
    </div>
  );
}
