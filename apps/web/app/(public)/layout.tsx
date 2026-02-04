import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Navbar />
        {children}
        <Footer />
      </div>
    </div>
  );
}
