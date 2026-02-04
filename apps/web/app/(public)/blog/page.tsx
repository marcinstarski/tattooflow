import Link from "next/link";
import { Card } from "@/components/ui/card";
import { blogPosts } from "@/content/blog";

export default function BlogPage() {
  return (
    <main className="pb-24">
      <section className="py-16">
        <h1 className="text-4xl font-display">Baza wiedzy</h1>
        <p className="mt-4 text-ink-200">Praktyczne porady dla studiów tatuażu.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Card key={post.slug}>
              <div className="text-xs text-ink-400">{post.date}</div>
              <h3 className="mt-2 text-xl font-semibold">{post.title}</h3>
              <p className="mt-2 text-sm text-ink-200">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} className="mt-4 inline-block text-sm text-accent-400">
                Czytaj więcej →
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
