import { notFound } from "next/navigation";
import { localizedUrl } from "@/lib/url";
import { NavbarServer as Navbar } from "@/components/NavbarServer";
import { Footer7Server as Footer7 } from "@/components/ui/footer-7-server";
import { PostSidebar } from "@/components/blog/PostSidebar";
import { client } from "@/sanity/client";
import { PortableText } from "@portabletext/react";
import styles from "./PostPage.module.css";
import { BlogCountryGrid } from "@/components/BlogCountryGrid";

async function getPost(slug: string, locale: string) {
  const langFields: Record<string, { title: string; excerpt: string; category: string; body: string; metaTitle: string; metaDescription: string }> = {
    en: { title: "english.title_en", excerpt: "english.excerpt_en", category: "english.category_en", body: "english.body_en", metaTitle: "english.metaTitle_en", metaDescription: "english.metaDescription_en" },
    es: { title: "spanish.title_es", excerpt: "spanish.excerpt_es", category: "spanish.category_es", body: "spanish.body_es", metaTitle: "spanish.metaTitle_es", metaDescription: "spanish.metaDescription_es" },
    ar: { title: "arabic.title_ar", excerpt: "arabic.excerpt_ar", category: "arabic.category_ar", body: "arabic.body_ar", metaTitle: "arabic.metaTitle_ar", metaDescription: "arabic.metaDescription_ar" },
  };
  const f = langFields[locale] || langFields.en;

  try {
    const data = await client.fetch(
      `*[_type == "post" && slug.current == $slug][0] {
        "title": ${f.title},
        "excerpt": ${f.excerpt},
        "category": ${f.category},
        "body": ${f.body},
        "metaTitle": ${f.metaTitle},
        "metaDescription": ${f.metaDescription},
        "coverImage": coverImage.asset->url,
        publishedAt
      }`,
      { slug },
      { next: { revalidate: 0 } }
    );
    return data ?? null;
  } catch {
    return null;
  }
}

async function getRelatedPosts(excludeSlug: string, locale: string) {
  const titleField = locale === "es" ? "spanish.title_es" : locale === "ar" ? "arabic.title_ar" : "english.title_en";
  const categoryField = locale === "es" ? "spanish.category_es" : locale === "ar" ? "arabic.category_ar" : "english.category_en";

  try {
    return await client.fetch(
      `*[_type == "post" && slug.current != $slug] | order(publishedAt desc) [0...5] {
        "title": ${titleField},
        "slug": slug.current,
        "category": ${categoryField},
        "coverImage": coverImage.asset->url,
        publishedAt
      }`,
      { slug: excludeSlug },
      { next: { revalidate: 0 } }
    );
  } catch {
    return [];
  }
}

async function getCountries(locale: string) {
  const nameField = locale === "es" ? "spanish.name_es" : locale === "ar" ? "arabic.name_ar" : "english.name_en";

  try {
    return await client.fetch(
      `*[_type == "country"] | order(${nameField} asc) { "name": ${nameField}, "slug": slug.current, countryCode }`,
      {},
      { next: { revalidate: 0 } }
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const post = await getPost(slug, locale);
  const baseUrl = "https://azerbaijan-evisa.com";
  const currentUrl = localizedUrl(baseUrl, locale, `/${slug}`);

  return {
    title: post?.metaTitle ?? post?.title ?? "",
    description: post?.metaDescription ?? post?.excerpt ?? "",
    alternates: {
      languages: {
        en: localizedUrl(baseUrl, "en", `/${slug}`),
        es: localizedUrl(baseUrl, "es", `/${slug}`),
        ar: localizedUrl(baseUrl, "ar", `/${slug}`),
      },
      canonical: currentUrl,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const [post, relatedPosts, countries] = await Promise.all([
    getPost(slug, locale),
    getRelatedPosts(slug, locale),
    getCountries(locale),
  ]);
  if (!post) notFound();

  const date = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const siteUrl = "https://azerbaijan-evisa.com";
  const postUrl = localizedUrl(siteUrl, locale, `/${slug}`);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.metaDescription ?? post.excerpt ?? "",
    "image": post.coverImage ?? `${siteUrl}/baku-country-hero.jpg`,
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    "author": {
      "@type": "Organization",
      "name": "eVisa Azerbaijan",
      "url": siteUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name": "eVisa Azerbaijan",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/evisa-logo.png`,
      },
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",  "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Blog",  "item": `${siteUrl}/blog` },
      ...(post.category ? [{ "@type": "ListItem", "position": 3, "name": post.category, "item": `${siteUrl}/blog` }] : []),
      { "@type": "ListItem", "position": post.category ? 4 : 3, "name": post.title, "item": postUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />

      <section className={styles.hero}>
        <picture className={styles.heroBgPicture}>
          <img
            src={post.coverImage ?? "/baku-country-hero.jpg"}
            alt={post.title}
            className={styles.heroBgImage}
            loading="eager"
          />
        </picture>
        <nav className={styles.heroBreadcrumb}>
          <a href="/">Home</a>
          <span className={styles.sep}>/</span>
          <a href="/blog">News</a>
          {post.category && (
            <>
              <span className={styles.sep}>/</span>
              <span>{post.category}</span>
            </>
          )}
          <span className={styles.sep}>/</span>
          <span>{post.title}</span>
        </nav>
        <h1 className={styles.heroTitle}>{post.title}</h1>
      </section>

      <div className={styles.page}>

        <div className={styles.inner}>

          {/* Main article */}
          <main>
            <div className={styles.meta}>
              {post.category && (
                <span className={styles.category}>
                  <span className={styles.dot} />
                  {post.category.toUpperCase()}
                </span>
              )}
              <span className={styles.metaDate}>{date}</span>
              <span className={styles.metaAuthor}>By admin</span>
            </div>

            {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

            {post.body && (() => {
              const portableTextComponents = {
                marks: {
                  link: ({ children, value }: any) => (
                    <a
                      href={value?.href}
                      target={value?.blank ? "_blank" : undefined}
                      rel={value?.blank ? "noopener noreferrer" : undefined}
                      style={{ color: "#E8671A", textDecoration: "underline" }}
                    >
                      {children}
                    </a>
                  ),
                  code: ({ children }: any) => (
                    <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", fontSize: "14px", fontFamily: "monospace" }}>
                      {children}
                    </code>
                  ),
                },
                block: {
                  blockquote: ({ children }: any) => (
                    <blockquote className={styles.blockquote}>{children}</blockquote>
                  ),
                  h4: ({ children }: any) => (
                    <h4 className={styles.h4}>{children}</h4>
                  ),
                },
              };

              return (
                <>
                  <article className={styles.body}>
                    <PortableText value={post.body.slice(0, 1)} components={portableTextComponents} />
                  </article>

                  {countries.length > 0 && (
                    <BlogCountryGrid countries={countries} locale={locale} limit={12} />
                  )}

                  <article className={styles.body}>
                    <PortableText value={post.body.slice(1)} components={portableTextComponents} />
                  </article>
                </>
              );
            })()}
          </main>

          <PostSidebar relatedPosts={relatedPosts} countries={countries} />
        </div>
      </div>

      <Footer7 />
    </>
  );
}
