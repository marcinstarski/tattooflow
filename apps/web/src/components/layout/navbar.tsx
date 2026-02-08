import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";

export function Navbar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-6">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/taflologo.png" alt="TaFlo" width={120} height={40} className="h-7 w-auto sm:h-8" priority />
        <span className="sr-only">TaFlo</span>
      </Link>
      <nav className="hidden items-center gap-6 text-sm md:flex">
        <Link href="/pricing">Cennik</Link>
        <Link href="/demo">Demo</Link>
        <Link href="/blog">Baza wiedzy</Link>
      </nav>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/auth/login" className="text-sm text-ink-200">Zaloguj</Link>
        <Link href="/auth/register" className="hidden sm:inline-flex">
          <Button>Rozpocznij okres próbny</Button>
        </Link>
      </div>
    </div>
  );
}
