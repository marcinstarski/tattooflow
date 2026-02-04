import Link from "next/link";
import { Button } from "../ui/button";

export function Navbar() {
  return (
    <div className="flex items-center justify-between py-6">
      <Link href="/" className="text-xl font-display tracking-tight">InkFlow</Link>
      <nav className="hidden items-center gap-6 text-sm md:flex">
        <Link href="/pricing">Cennik</Link>
        <Link href="/demo">Demo</Link>
        <Link href="/blog">Baza wiedzy</Link>
      </nav>
      <div className="flex items-center gap-3">
        <Link href="/auth/login" className="text-sm text-ink-200">Zaloguj</Link>
        <Link href="/auth/register">
          <Button>Rozpocznij okres próbny</Button>
        </Link>
      </div>
    </div>
  );
}
