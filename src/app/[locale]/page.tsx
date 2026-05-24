 import { NavbarServer as Navbar } from "@/components/NavbarServer";      
  import { Hero } from "@/components/Hero";          
  import { StepsSection } from                       
  "@/components/StepsSection";                       
  import { WorldMapSection } from                  
  "@/components/WorldMapSection";
  import { NationalitySection } from
  "@/components/NationalitySection";                 
  import { BlogsSection } from
  "@/components/ui/blogs";                           
  import { FAQSection } from                       
  "@/components/ui/faqs-component";
  import { Footer7Server as Footer7 } from "@/components/ui/footer-7-server";
  import { VisaContent } from "@/components/VisaContent";
  import { client } from "@/sanity/client";          
  
  // Getting countries list from Sanity
  async function getCountries(locale: string) {
    try {
      let query;
      if (locale === "es") {
        query = `*[_type == "country"] { "name": spanish.name_es, "slug": slug.current, countryCode }`;
      } else if (locale === "ar") {
        query = `*[_type == "country"] { "name": arabic.name_ar, "slug": slug.current, countryCode }`;
      } else {
        query = `*[_type == "country"] { "name": english.name_en, "slug": slug.current, countryCode }`;
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

  // Getting home page content from Sanity
  async function getHomePage(locale: string) {
    try {
      return await client.fetch(
        `*[_type == "homePage" && language == $locale][0]
        { heroTitle,
         heroPrimaryButton,
         heroSecondaryButton,
         processingOptions,
         steps,
         faqs,
         seoContent
        }`,
        { locale },
        { next: { revalidate: 0 } }
      );
    } catch (error) {
      return null;
    }
  }

  // Getting blog posts from Sanity
  async function getBlogs(locale: string) {
    try {
      let query;
      if (locale === "es") {
        query = `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc)[0..4]{
          "title": spanish.title_es,
          "category": spanish.category_es,
          "description": spanish.excerpt_es,
          "image": coverImage.asset->url,
          "publishDate": publishedAt,
          "readMoreLink": "/" + slug.current
        }`;
      } else if (locale === "ar") {
        query = `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc)[0..4]{
          "title": arabic.title_ar,
          "category": arabic.category_ar,
          "description": arabic.excerpt_ar,
          "image": coverImage.asset->url,
          "publishDate": publishedAt,
          "readMoreLink": "/" + slug.current
        }`;
      } else {
        query = `*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc)[0..4]{
          "title": english.title_en,
          "category": english.category_en,
          "description": english.excerpt_en,
          "image": coverImage.asset->url,
          "publishDate": publishedAt,
          "readMoreLink": "/" + slug.current
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

    const metadataByLocale: Record<string, { title: string; description: string }> = {
      es: {
        title: "e Visa Azerbaiyán - Solicita tu Visado Electrónico en Línea",
        description: "Solicita tu e visa Azerbaiyán en línea. Visa electrónica rápida y segura. Procesar tu visa online en 3 horas.",
      },
      ar: {
        title: "تأشيرة أذربيجان الإلكترونية - تقديم بتة Visa عبر الإنترنت",
        description: "قدم طلب e visa أذربيجان عبر الإنترنت. الفيزا الإلكترونية الرسمية ASAN. معالجة سريعة في 3 ساعات.",
      },
    };

    const meta = metadataByLocale[locale] || {
      title: "e Visa Azerbaijan - Apply for Official Electronic Visa Online",
      description: "Get your e visa Azerbaijan online in minutes. Fast electronic visa application. ASAN official e-visa portal. Processing as fast as 3 hours.",
    };

    return {
      title: meta.title,
      description: meta.description,
      alternates: {
        languages: {
          en: "https://azerbaijan-evisa.com/en",
          es: "https://azerbaijan-evisa.com/es",
          ar: "https://azerbaijan-evisa.com/ar",
        },
        canonical: `https://azerbaijan-evisa.com/${locale}`,
      },
      openGraph: {
        title: meta.title,
        description: meta.description,
        url: `https://azerbaijan-evisa.com/${locale}`,
        type: "website",
        locale: locale === "es" ? "es_ES" : locale === "ar" ? "ar_SA" : "en_US",
      },
    };
  }

  export default async function Home({ params,
  }: {
   params: Promise<{ locale: string }>;
  }) {
  const { locale } = await params;
  const countries = await getCountries(locale);
  const homePage = await getHomePage(locale);
  const blogs = await getBlogs(locale);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Azerbaijan eVisa",
    url: "https://azerbaijan-evisa.com",
    logo: "https://azerbaijan-evisa.com/evisa-logo.png",
    description: locale === "es"
      ? "Solicita tu e visa Azerbaiyán en línea"
      : locale === "ar"
      ? "قدم طلب e visa أذربيجان عبر الإنترنت"
      : "Apply for your e visa Azerbaijan online",
    sameAs: [
      "https://www.facebook.com/azerbaijan-evisa",
      "https://www.twitter.com/azerbaijan-evisa",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "support@azerbaijan-evisa.com",
      url: "https://azerbaijan-evisa.com/contact",
    },
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: locale === "es" ? "e Visa Azerbaiyán" : locale === "ar" ? "تأشيرة أذربيجان الإلكترونية" : "Azerbaijan e Visa",
    description: locale === "es"
      ? "Solicita tu visa electrónica para Azerbaiyán"
      : locale === "ar"
      ? "تقديم طلب الحصول على تأشيرة أذربيجان الإلكترونية"
      : "Apply for official Azerbaijan electronic visa online",
    provider: {
      "@type": "Organization",
      name: "ASAN Service",
    },
    areaServed: "Worldwide",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Visa Processing Options",
      itemListElement: [
        {
          "@type": "Offer",
          name: "Standard Processing",
          description: "3-5 business days",
          price: "50",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Urgent Processing",
          description: "3 hours",
          price: "100",
          priceCurrency: "USD",
        },
      ],
    },
  };

  const faqSchema = homePage?.faqs ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homePage.faqs.map((faq: any) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          suppressHydrationWarning
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
          suppressHydrationWarning
        />
        {faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            suppressHydrationWarning
          />
        )}
        <Navbar />
        <main>
        <Hero
       title={homePage?.heroTitle}
       primaryButton={homePage?.heroPrimaryButton}
       secondaryButton={homePage?.heroSecondaryButton}
       processingOptions={homePage?.processingOptions}
       />
        <StepsSection steps={homePage?.steps} />
        <WorldMapSection />
        <NationalitySection countries={countries} />
        <BlogsSection blogs={blogs} />
        <FAQSection faqs={homePage?.faqs || []} />
        <div style={{ background: "#fff", padding: "48px 24px 64px", maxWidth: 860, margin: "0 auto" }}>
          <VisaContent
            body={homePage?.seoContent}
            locale={locale}
            fallback={
              <div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#1a1a2e", marginBottom: 14 }}>
                  Azerbaijan e-Visa — Complete Guide
                </h2>
                <p>
                  Azerbaijan offers an <strong>electronic visa (e-Visa)</strong> to citizens of over 100 countries, making it easier than ever to visit this remarkable country at the crossroads of Europe and Asia. The Azerbaijan e-Visa system was launched in 2017 and has since processed millions of applications from travelers worldwide.
                </p>
                <p>
                  Citizens of <strong>India, China, the United States, the United Kingdom, most EU countries, Saudi Arabia, UAE, Pakistan, and many more</strong> are eligible to apply online. The entire process takes just a few minutes and your visa is delivered directly to your email — no embassy visit required.
                </p>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1a2e", margin: "20px 0 10px" }}>
                  How to Apply for Azerbaijan e-Visa
                </h3>
                <p>
                  The application process is straightforward: fill in your personal and passport details, select your visa type (tourist, business, or transit), pay the government fee online, and receive your approved visa by email within 3 hours (urgent) or 3–5 business days (standard). Your e-Visa is valid for 90 days from the date of issue, allowing a stay of up to 30 days.
                </p>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1a2e", margin: "20px 0 10px" }}>
                  Why Visit Azerbaijan?
                </h3>
                <p>
                  Baku, the capital, blends ultramodern architecture with a UNESCO-listed Old City. The country offers stunning natural landscapes — from the Caucasus mountains to the Caspian Sea coast — rich history, and a rapidly growing tourism infrastructure. Azerbaijan is also known for its hospitality, unique cuisine, and as the "Land of Fire" due to its ancient Zoroastrian heritage and natural gas fires.
                </p>
              </div>
            }
          />
        </div>
      </main>
      <Footer7 />
      </>
    );
  }
