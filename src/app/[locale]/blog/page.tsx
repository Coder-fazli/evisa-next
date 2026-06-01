import { NavbarServer as Navbar } from "@/components/NavbarServer";
import { PostGrid } from "@/components/blog/PostGrid";
import { Footer7Server as Footer7 } from "@/components/ui/footer-7-server";
import { client } from "@/sanity/client";
import styles from "../InfoPage.module.css";
import { localizedUrl } from "@/lib/url";

async function getPosts(locale: string) {
  try {
    let query;
    if (locale === "es") {
      query = `*[_type == "post"] | order(publishedAt desc) {
        "title": spanish.title_es,
        "slug": slug.current,
        publishedAt,
        "excerpt": spanish.excerpt_es,
        "category": spanish.category_es,
        "coverImage": coverImage.asset->url
      }`;
    } else if (locale === "ar") {
      query = `*[_type == "post"] | order(publishedAt desc) {
        "title": arabic.title_ar,
        "slug": slug.current,
        publishedAt,
        "excerpt": arabic.excerpt_ar,
        "category": arabic.category_ar,
        "coverImage": coverImage.asset->url
      }`;
    } else {
      query = `*[_type == "post"] | order(publishedAt desc) {
        "title": english.title_en,
        "slug": slug.current,
        publishedAt,
        "excerpt": english.excerpt_en,
        "category": english.category_en,
        "coverImage": coverImage.asset->url
      }`;
    }

    return await client.fetch(
      query,
      {},
      { next: { revalidate: 0 } }
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const baseUrl = "https://azerbaijan-evisa.com";

  const metadataByLocale: Record<string, { title: string; description: string }> = {
    es: {
      title: "Noticias y Guías de Visas - eVisa Azerbaiyán",
      description: "Guías de visas, consejos de viaje y noticias sobre Azerbaiyán. Mantente informado sobre los requisitos de eVisa.",
    },
    ar: {
      title: "الأخبار والأدلة - تأشيرة أذربيجان الإلكترونية",
      description: "أدلة التأشيرات ونصائح السفر والأخبار عن أذربيجان. ابق على اطلاع بمتطلبات التأشيرة الإلكترونية.",
    },
  };

  const meta = metadataByLocale[locale] || {
    title: "News & Guides – eVisa Azerbaijan",
    description: "Visa guides, travel tips, and news about Azerbaijan. Stay informed about e-Visa requirements.",
  };

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      languages: {
        en: localizedUrl(baseUrl, "en", "/blog"),
        es: localizedUrl(baseUrl, "es", "/blog"),
        ar: localizedUrl(baseUrl, "ar", "/blog"),
      },
      canonical: localizedUrl(baseUrl, locale, "/blog"),
    },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const posts = await getPosts(locale);

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 120, background: "white", minHeight: "100vh" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 24px 0" }}>
          <nav className={styles.breadcrumb}>
            <a href="/">Home</a>
            <span className={styles.sep}>/</span>
            <span>News</span>
          </nav>
          <h1 className={styles.articleTitle}>News</h1>
        </div>
        <PostGrid posts={posts} />
      </div>
      <Footer7 />
    </>
  );
}
