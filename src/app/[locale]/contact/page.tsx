import { NavbarServer as Navbar } from "@/components/NavbarServer";
import { localizedUrl } from "@/lib/url";
import { Footer7Server as Footer7 } from "@/components/ui/footer-7-server";
import { InfoPageHero } from "@/components/infopage/InfoPageHero";
import { ContactForm } from "@/components/contact/ContactForm";
import { client } from "@/sanity/client";
import styles from "./Contact.module.css";

async function getContactPage(locale: string) {
  let query: string;
  if (locale === "es") {
    query = `*[_type == "contactPage"][0] {
      "heroTitle": spanish.heroTitle_es,
      "label": spanish.label_es,
      "title": spanish.title_es,
      "description": spanish.description_es,
      "namePlaceholder": spanish.namePlaceholder_es,
      "emailPlaceholder": spanish.emailPlaceholder_es,
      "phonePlaceholder": spanish.phonePlaceholder_es,
      "subjectPlaceholder": spanish.subjectPlaceholder_es,
      "messagePlaceholder": spanish.messagePlaceholder_es,
      "buttonText": spanish.buttonText_es,
      "successMessage": spanish.successMessage_es,
      "metaTitle": spanish.metaTitle_es,
      "metaDescription": spanish.metaDescription_es,
      "heroImage": heroImage.asset->url
    }`;
  } else if (locale === "ar") {
    query = `*[_type == "contactPage"][0] {
      "heroTitle": arabic.heroTitle_ar,
      "label": arabic.label_ar,
      "title": arabic.title_ar,
      "description": arabic.description_ar,
      "namePlaceholder": arabic.namePlaceholder_ar,
      "emailPlaceholder": arabic.emailPlaceholder_ar,
      "phonePlaceholder": arabic.phonePlaceholder_ar,
      "subjectPlaceholder": arabic.subjectPlaceholder_ar,
      "messagePlaceholder": arabic.messagePlaceholder_ar,
      "buttonText": arabic.buttonText_ar,
      "successMessage": arabic.successMessage_ar,
      "metaTitle": arabic.metaTitle_ar,
      "metaDescription": arabic.metaDescription_ar,
      "heroImage": heroImage.asset->url
    }`;
  } else {
    query = `*[_type == "contactPage"][0] {
      "heroTitle": english.heroTitle_en,
      "label": english.label_en,
      "title": english.title_en,
      "description": english.description_en,
      "namePlaceholder": english.namePlaceholder_en,
      "emailPlaceholder": english.emailPlaceholder_en,
      "phonePlaceholder": english.phonePlaceholder_en,
      "subjectPlaceholder": english.subjectPlaceholder_en,
      "messagePlaceholder": english.messagePlaceholder_en,
      "buttonText": english.buttonText_en,
      "successMessage": english.successMessage_en,
      "metaTitle": english.metaTitle_en,
      "metaDescription": english.metaDescription_en,
      "heroImage": heroImage.asset->url
    }`;
  }

  try {
    const data = await client.fetch(query, {}, { next: { revalidate: 0 } });
    return data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const page = await getContactPage(locale);
  const baseUrl = "https://azerbaijan-evisa.com";
  const currentUrl = localizedUrl(baseUrl, locale, "/contact");

  return {
    title: page?.metaTitle ?? "Contact Us – eVisa Azerbaijan",
    description: page?.metaDescription ?? "",
    alternates: {
      languages: {
        en: localizedUrl(baseUrl, "en", "/contact"),
        es: localizedUrl(baseUrl, "es", "/contact"),
        ar: localizedUrl(baseUrl, "ar", "/contact"),
      },
      canonical: currentUrl,
    },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const page = await getContactPage(locale);

  const data = page || {
    heroTitle: "Contact",
    label: "WRITE A MESSAGE",
    title: "Always Here to Help You",
    description: "Have a question, comment, or suggestion? We'd love to hear from you! Use the form below to get in touch with us.",
    namePlaceholder: "Your name",
    emailPlaceholder: "Email address",
    phonePlaceholder: "Phone number",
    subjectPlaceholder: "Subject",
    messagePlaceholder: "Write a message",
    buttonText: "Send a Message",
    successMessage: "Thank you! Your message has been sent.",
    heroImage: null,
  };

  return (
    <>
      <Navbar />
      <InfoPageHero
        title={data.heroTitle}
        heroImage={data.heroImage || "/baku-country-hero.jpg"}
      />

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.left}>
            <p className={styles.label}>{data.label}</p>
            <h2 className={styles.title}>{data.title}</h2>
            <p className={styles.description}>{data.description}</p>
          </div>

          <div className={styles.right}>
            <ContactForm
              namePlaceholder={data.namePlaceholder}
              emailPlaceholder={data.emailPlaceholder}
              phonePlaceholder={data.phonePlaceholder}
              subjectPlaceholder={data.subjectPlaceholder}
              messagePlaceholder={data.messagePlaceholder}
              buttonText={data.buttonText}
              successMessage={data.successMessage}
            />
          </div>
        </div>
      </section>

      <Footer7 />
    </>
  );
}
