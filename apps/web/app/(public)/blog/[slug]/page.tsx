import { notFound } from "next/navigation";
import { blogPosts } from "@/content/blog";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((item) => item.slug === params.slug);
  if (!post) {
    notFound();
  }
  return (
    <main className="pb-24">
      <article className="mx-auto max-w-3xl py-16">
        <div className="text-xs text-ink-400">{post.date}</div>
        <h1 className="mt-2 text-4xl font-display">{post.title}</h1>
        <p className="mt-4 text-ink-200">{post.excerpt}</p>
        <div className="mt-8 space-y-4 text-ink-200">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
