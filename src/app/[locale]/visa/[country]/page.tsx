import { notFound } from "next/navigation";
import { NavbarServer as Navbar } from "@/components/NavbarServer";
import { CountryHero } from "@/components/country/CountryHero";
import { InfoCards } from "@/components/country/InfoCards";
import { CountryContent } from "@/components/country/CountryContent";
import { Footer7Server as Footer7 } from "@/components/ui/footer-7-server";
import { client } from "@/sanity/client";
import { localizedUrl } from "@/lib/url";

const DEFAULT_INFO_CARDS = [
  { label: "Processing Time", value: "3 Business Days" },
  { label: "Stay Duration",   value: "Up to 30 Days"   },
  { label: "Urgent Service",  value: "3–5 Hours"       },
  { label: "Entry Type",      value: "Single Entry"    },
];

// Helper to get language-specific field names
function getLanguageFields(locale: string) {
  const fieldMap: Record<string, { name: string; metaTitle: string; metaDescription: string; description: string; overview: string; body: string; infoCards: string; faqs: string; steps: string }> = {
    es: { name: "spanish.name_es", metaTitle: "spanish.metaTitle_es", metaDescription: "spanish.metaDescription_es", description: "spanish.description_es", overview: "spanish.overview_es", body: "spanish.body_es", infoCards: "spanish.infoCards_es", faqs: "spanish.faqs_es", steps: "spanish.steps_es" },
    ar: { name: "arabic.name_ar", metaTitle: "arabic.metaTitle_ar", metaDescription: "arabic.metaDescription_ar", description: "arabic.description_ar", overview: "arabic.overview_ar", body: "arabic.body_ar", infoCards: "arabic.infoCards_ar", faqs: "arabic.faqs_ar", steps: "arabic.steps_ar" },
  };
  return fieldMap[locale] || fieldMap.en || { name: "english.name_en", metaTitle: "english.metaTitle_en", metaDescription: "english.metaDescription_en", description: "english.description_en", overview: "english.overview_en", body: "english.body_en", infoCards: "english.infoCards_en", faqs: "english.faqs_en", steps: "english.steps_en" };
}

async function getCountryData(slug: string, locale: string) {
  try {
    const fields = getLanguageFields(locale);
    const data = await client.fetch(
      `*[_type == "country" && slug.current == $slug][0] {
        countryCode,
        heroImage,
        applyLink,
        publishedDate,
        "name": ${fields.name},
        "metaTitle": ${fields.metaTitle},
        "metaDescription": ${fields.metaDescription},
        "description": ${fields.description},
        "overview": ${fields.overview},
        "body": ${fields.body},
        "infoCards": ${fields.infoCards},
        "faqs": ${fields.faqs},
        "steps": ${fields.steps}
      }`,
      { slug: slug.toLowerCase() },
      { next: { revalidate: 0 } }
    );
    return data ?? null;
  } catch {
    return null;
  }
}

async function getAllCountries(excludeSlug: string, locale: string) {
  try {
    const fields = getLanguageFields(locale);
    return await client.fetch(
      `*[_type == "country" && slug.current != $slug] {
        "name": ${fields.name},
        "slug": slug.current,
        countryCode
      }`,
      { slug: excludeSlug.toLowerCase() },
      { next: { revalidate: 0 } }
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { country, locale } = await params;
  const data = await getCountryData(country, locale);
  const name = data?.name ?? country.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const baseUrl = "https://azerbaijan-evisa.com";
  const currentUrl = localizedUrl(baseUrl, locale, `/visa/${country}`);

  return {
    title: data?.metaTitle ?? `${name} Visa for Azerbaijan`,
    description: data?.metaDescription ?? `Apply for Azerbaijan e-Visa for ${name} citizens. Fast, secure, and 100% official.`,
    alternates: {
      languages: {
        en: localizedUrl(baseUrl, "en", `/visa/${country}`),
        es: localizedUrl(baseUrl, "es", `/visa/${country}`),
        ar: localizedUrl(baseUrl, "ar", `/visa/${country}`),
      },
      canonical: currentUrl,
    },
  };
}

export default async function CountryPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { country, locale } = await params;
  const [sanityData, sidebarCountries] = await Promise.all([
    getCountryData(country, locale),
    getAllCountries(country, locale),
  ]);
  if (!sanityData) notFound();
  const heroImageUrl = sanityData?.heroImage?.asset?._ref
    ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/production/${sanityData.heroImage.asset._ref.replace("image-", "").replace(/-(\w+)$/, ".$1")}`
    : "/baku-country-hero.jpg";
  const name = sanityData?.name
    ?? country.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  const applyLink = sanityData?.applyLink || "https://apply.azerbaijan-evisa.com/";
  const countryCode = sanityData?.countryCode ?? "az";
  const description = sanityData?.description
    ?? `Comprehensive guide on visa requirements and easy online application process for ${name} citizens.`;
  const overview = sanityData?.overview
    ?? `${name} citizens need a visa to travel to Azerbaijan. The easiest way is to apply online for an Azerbaijan e-Visa, which is issued within 3 business days, allows a 30-day stay, and costs $69 USD. No embassy visit is required.`;
  const publishedDate = sanityData?.publishedDate ?? "Jan 20, 2026";
  const infoCards = sanityData?.infoCards?.length ? sanityData.infoCards : DEFAULT_INFO_CARDS;

  const slugLabel = country.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  const faqs = sanityData?.faqs?.length
    ? sanityData.faqs
    : [
        { q: `Do ${slugLabel} citizens need a visa for Azerbaijan?`, a: `Yes, ${slugLabel} passport holders are required to obtain a visa before traveling to Azerbaijan. However, ${slugLabel} citizens can conveniently apply online for the Azerbaijan e-Visa without visiting an embassy.` },
        { q: "How long does the Azerbaijan e-Visa take to process?", a: "The standard processing time is 3 business days. Urgent processing is available for an additional fee and takes 3–5 hours." },
        { q: `What documents do ${slugLabel} citizens need for Azerbaijan e-Visa?`, a: "You need a valid passport (6+ months validity), a digital passport photo, a valid email address, and a credit/debit card for payment." },
        { q: `How much does Azerbaijan e-Visa cost for ${slugLabel} citizens?`, a: "The standard processing fee is $69 USD, which includes all government and processing charges." },
        { q: `How long can ${slugLabel} citizens stay in Azerbaijan with e-Visa?`, a: `${slugLabel} citizens can stay in Azerbaijan for up to 30 days per entry with a single-entry e-Visa.` },
        { q: `Can ${slugLabel} citizens extend their Azerbaijan e-Visa?`, a: "The Azerbaijan e-Visa cannot be extended online. If you need to stay longer, you must apply for a new visa through the State Migration Service of Azerbaijan." },
      ];

  const steps = sanityData?.steps?.length
    ? sanityData.steps
    : [
        { title: "Check Your Eligibility", desc: `Verify that ${slugLabel} citizens are eligible for the Azerbaijan e-Visa. ${slugLabel} passport holders are fully eligible.` },
        { title: "Prepare Your Documents", desc: "Have your valid passport (6+ months validity), credit/debit card, and email address ready." },
        { title: "Fill Out the Application", desc: "Complete the online application form with your personal details and travel information. It takes about 5 minutes." },
        { title: "Pay the Visa Fee", desc: "Submit payment of $69 USD using your credit or debit card. All major cards are accepted." },
        { title: "Receive Your e-Visa", desc: "Your approved e-Visa will be sent to your email within 3 business days. Print it for travel." },
      ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": `Azerbaijan e-Visa for ${name} Citizens`,
    "description": sanityData?.metaDescription ?? `Apply for Azerbaijan e-Visa online for ${name} citizens. Fast processing, $69 USD, no embassy visit required.`,
    "provider": {
      "@type": "Organization",
      "name": "eVisa Azerbaijan",
      "url": "https://azerbaijan-evisa.com"
    },
    "areaServed": name,
    "offers": {
      "@type": "Offer",
      "price": "69",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1240"
    },
    "faqPage": {
      "@type": "FAQPage",
      "mainEntity": faqs.map((faq: { q: string; a: string }) => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      }))
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <CountryHero 
      country={name} 
      countryCode={countryCode} 
      description={description} 
      heroImage={heroImageUrl} />
      <InfoCards cards={infoCards} />
      <CountryContent
        country={slugLabel}
        overview={overview}
        faqs={faqs}
        steps={steps}
        publishedDate={publishedDate}
        body={sanityData?.body}
        applyLink={applyLink}
        sidebarCountries={sidebarCountries}
      />
      <Footer7 />
    </>
  );
}


