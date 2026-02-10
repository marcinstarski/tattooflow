import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
}
