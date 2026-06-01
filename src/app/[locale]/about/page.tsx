import { notFound } from "next/navigation";
import { localizedUrl } from "@/lib/url";
import { NavbarServer as Navbar } from "@/components/NavbarServer";
import { Footer7Server as Footer7 } from "@/components/ui/footer-7-server";
import { InfoPageHero } from "@/components/infopage/InfoPageHero";
import { InfoPageStats } from "@/components/infopage/InfoPageStats";
import { client } from "@/sanity/client";
import { PortableText } from "@portabletext/react";
import styles from "../InfoPage.module.css";

async function getPage(locale: string) {
  const langMap: Record<string, { title: string; body: string; metaTitle: string; metaDescription: string }> = {
    en: { title: "english.title_en", body: "english.body_en", metaTitle: "english.metaTitle_en", metaDescription: "english.metaDescription_en" },
    es: { title: "spanish.title_es", body: "spanish.body_es", metaTitle: "spanish.metaTitle_es", metaDescription: "spanish.metaDescription_es" },
    ar: { title: "arabic.title_ar", body: "arabic.body_ar", metaTitle: "arabic.metaTitle_ar", metaDescription: "arabic.metaDescription_ar" },
  };

  const fields = langMap[locale] || langMap.en;

  try {
    const data = await client.fetch(
      `*[_type == "infoPage" && slug.current == "about"][0] {
        "title": ${fields.title},
        "body": ${fields.body},
        "metaTitle": ${fields.metaTitle},
        "metaDescription": ${fields.metaDescription},
        slug
      }`,
      {},
      { next: { revalidate: 0 } }
    );
    return data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const page = await getPage(locale);
  const baseUrl = "https://azerbaijan-evisa.com";
  const currentUrl = localizedUrl(baseUrl, locale, "/about");

  return {
    title: page?.metaTitle ?? page?.title ?? "About Us",
    description: page?.metaDescription ?? "",
    alternates: {
      languages: {
        en: localizedUrl(baseUrl, "en", "/about"),
        es: localizedUrl(baseUrl, "es", "/about"),
        ar: localizedUrl(baseUrl, "ar", "/about"),
      },
      canonical: currentUrl,
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const page = await getPage(locale);

  if (!page) notFound();

  return (
    <>
      <Navbar />
      <InfoPageHero title={page.title} heroImage="/baku-country-hero.jpg" />
      <InfoPageStats />

      <div className={styles.page}>
        <div className={styles.inner}>
          <main>
            {page.body && (
              <article className={styles.body}>
                <PortableText
                  value={page.body}
                  components={{
                    marks: {
                      link: ({ children, value }) => (
                        <a
                          href={value?.href}
                          target={value?.blank ? "_blank" : undefined}
                          rel={value?.blank ? "noopener noreferrer" : undefined}
                          style={{ color: "#E8671A", textDecoration: "underline" }}
                        >
                          {children}
                        </a>
                      ),
                      code: ({ children }) => (
                        <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: "4px", fontSize: "14px", fontFamily: "monospace" }}>
                          {children}
                        </code>
                      ),
                    },
                    block: {
                      blockquote: ({ children }) => (
                        <blockquote className={styles.blockquote}>{children}</blockquote>
                      ),
                      h4: ({ children }) => (
                        <h4 className={styles.h4}>{children}</h4>
                      ),
                    },
                  }}
                />
              </article>
            )}
          </main>
        </div>
      </div>
      <Footer7 />
    </>
  );
}
