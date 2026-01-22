import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";
import { createClient } from "@/lib/supabase/server";
import SectionBlogs from "./SectionBlogs";

const PAGE_SIZE = 12;

export const metadata = constructMetadata({
  title: "Blog",
  description: `Discover insights, tips, and guides from the ${siteConfig.name} experts.`,
});

export const revalidate = 600; // Revalidate every 10 minutes

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string };
}) {
  const supabase = await createClient();
  const page = parseInt(searchParams.page || "1", 10);
  const category = searchParams.category || "all";

  // Fetch categories
  const { data: categories } = (await supabase
    .from("blog_categories")
    .select("id, name, slug")) as { data: any[] | null };

  // Fetch blog posts
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  // Query all blog posts without any filtering
  let query = supabase
    .from("blog_posts")
    .select(
      `
      id,
      title,
      slug,
      excerpt,
      featured_image,
      status,
      published_at,
      created_at,
      updated_at,
      content
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false }) // Order by creation date
    .range(from, to);

  const { data, count } = (await query) as {
    data: any[] | null;
    count: number | null;
  };

  // Process the blog posts data
  const blogPosts = (data || []).map((post) => {
    // For each post, we'll fetch its categories
    return {
      ...post,
      categories: [], // We'll fetch categories separately if needed
    };
  });

  console.log("Blog posts found:", blogPosts.length);
  const total = count || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">
            {siteConfig.name} Blog
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Discover insights, tips, and guides from the {siteConfig.name} experts.
          </p>
        </div>
        {/* Category Filter Bar */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <a
            href="?"
            className={`px-4 py-1 rounded-full border ${category === "all"
              ? "bg-primary text-white border-primary"
              : "bg-gray-100 text-gray-700 border-gray-300"
              } transition`}
          >
            All
          </a>
          {categories?.map((cat) => (
            <a
              key={cat.id}
              href={`?category=${cat.id}`}
              className={`px-4 py-1 rounded-full border ${category === cat.id
                ? "bg-primary text-white border-primary"
                : "bg-gray-100 text-gray-700 border-gray-300"
                } transition`}
            >
              {cat.name}
            </a>
          ))}
        </div>
        <SectionBlogs blogs={blogPosts} />
        {/* Pagination UI */}
        {total > PAGE_SIZE && (
          <div className="flex justify-center gap-2 mt-8">
            <a
              href={`?page=${page - 1}${category !== "all" ? `&category=${category}` : ""
                }`}
              className={`px-4 py-2 border rounded ${page === 1 ? "opacity-50 pointer-events-none" : ""
                }`}
            >
              Previous
            </a>
            <span>
              Page {page} of {Math.ceil(total / PAGE_SIZE)}
            </span>
            <a
              href={`?page=${page + 1}${category !== "all" ? `&category=${category}` : ""
                }`}
              className={`px-4 py-2 border rounded ${page >= Math.ceil(total / PAGE_SIZE)
                ? "opacity-50 pointer-events-none"
                : ""
                }`}
            >
              Next
            </a>
          </div>
        )}
        {/* Newsletter Signup */}
        <div className="mt-16 rounded-2xl bg-primary/5 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold">Stay Updated</h2>
          <p className="mb-6 text-gray-600">
            Subscribe to our newsletter for the latest articles, tips, and
            expert recommendations.
          </p>
          <form className="mx-auto flex max-w-md gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary/90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
