import { notFound } from "next/navigation";
import { NavbarServer as Navbar } from "@/components/NavbarServer";
import { Footer7Server as Footer7 } from "@/components/ui/footer-7-server";
import { InfoPageHero } from "@/components/infopage/InfoPageHero";
import { InfoPageStats } from "@/components/infopage/InfoPageStats";
import { NationalitySection } from "@/components/NationalitySection";
import { FAQSection } from "@/components/ui/faqs-component";
import { client } from "@/sanity/client";
import { VisaContent } from "@/components/VisaContent";
import { localizedUrl } from "@/lib/url";

async function getPage(locale: string) {
  const langMap: Record<string, { title: string; body: string; metaTitle: string; metaDescription: string }> = {
    en: { title: "english.title_en", body: "english.body_en", metaTitle: "english.metaTitle_en", metaDescription: "english.metaDescription_en" },
    es: { title: "spanish.title_es", body: "spanish.body_es", metaTitle: "spanish.metaTitle_es", metaDescription: "spanish.metaDescription_es" },
    ar: { title: "arabic.title_ar", body: "arabic.body_ar", metaTitle: "arabic.metaTitle_ar", metaDescription: "arabic.metaDescription_ar" },
  };

  const fields = langMap[locale] || langMap.en;

  try {
    const data = await client.fetch(
      `*[_type == "infoPage" && slug.current == "visa-by-nationality"][0] {
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

async function getCountries(locale: string) {
  try {
    let query;
    if (locale === "es") {
      query = `*[_type == "country"] | order(name asc) { "name": spanish.name_es, "slug": slug.current, countryCode }`;
    } else if (locale === "ar") {
      query = `*[_type == "country"] | order(name asc) { "name": arabic.name_ar, "slug": slug.current, countryCode }`;
    } else {
      query = `*[_type == "country"] | order(name asc) { "name": english.name_en, "slug": slug.current, countryCode }`;
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

async function getVisaFAQs(locale: string) {
  try {
    let query;
    if (locale === "es") {
      query = `*[_type == "infoPage" && slug.current == "visa-faq"][0] { "faqs": spanish.faqs_es }`;
    } else if (locale === "ar") {
      query = `*[_type == "infoPage" && slug.current == "visa-faq"][0] { "faqs": arabic.faqs_ar }`;
    } else {
      query = `*[_type == "infoPage" && slug.current == "visa-faq"][0] { "faqs": english.faqs_en }`;
    }

    const result = await client.fetch(query, {}, { next: { revalidate: 0 } });
    return result?.faqs ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const page = await getPage(locale);
  const baseUrl = "https://azerbaijan-evisa.com";
  const currentUrl = localizedUrl(baseUrl, locale, "/visa");

  // SEO-optimized fallbacks based on Search Console keywords:
  // "eligible countries egypt" (141), "eligible countries list" (53+),
  // country-specific terms for Egypt, Saudi Arabia, Pakistan, Malaysia, China, Iran
  const metadataByLocale: Record<string, { title: string; description: string }> = {
    es: {
      title: "Países Elegibles para e-Visa Azerbaiyán 2026 | Lista Completa",
      description: "Lista completa de países elegibles para la e-visa de Azerbaiyán. Solicita online desde Egipto, Arabia Saudita, Paquistán, Malasia, China, Irán y 100+ países más. Visa ASAN.",
    },
    ar: {
      title: "الدول المؤهلة للتأشيرة الإلكترونية لأذربيجان 2026 | قائمة كاملة",
      description: "قائمة كاملة بالدول المؤهلة للتأشيرة الإلكترونية لأذربيجان. تقدم بالطلب من مصر والسعودية وباكستان وماليزيا والصين وإيران وأكثر من 100 دولة. تأشيرة ASAN.",
    },
  };

  const fallback = metadataByLocale[locale] || {
    title: "Azerbaijan e-Visa Eligible Countries List 2026 | Check Now",
    description: "Check Azerbaijan e-Visa eligible countries list. Apply online from Egypt, Saudi Arabia, Pakistan, Malaysia, China, Iran & 100+ eligible countries. Official ASAN visa.",
  };

  // Use Sanity meta first, fallback to optimized defaults
  const metaTitle = page?.metaTitle || fallback.title;
  const metaDescription = page?.metaDescription || fallback.description;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      languages: {
        en: localizedUrl(baseUrl, "en", "/visa"),
        es: localizedUrl(baseUrl, "es", "/visa"),
        ar: localizedUrl(baseUrl, "ar", "/visa"),
      },
      canonical: currentUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: currentUrl,
      type: "website",
    },
  };
}

export default async function VisaIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const page = await getPage(locale);
  const countries = await getCountries(locale);
  const faqs = await getVisaFAQs(locale);

  if (!page) notFound();

  const visaStats = [
    {
      value: "10,450+",
      label: "Visa Approved",
      description: locale === "es" ? "Solicitudes aprobadas este año" : locale === "ar" ? "الطلبات الموافق عليها هذا العام" : "Applications approved this year"
    },
    {
      value: "540+",
      label: "Legal Matters",
      description: locale === "es" ? "Asuntos legales resueltos" : locale === "ar" ? "المسائل القانونية المحلولة" : "Legal matters handled"
    },
    {
      value: "100%",
      label: "Client Satisfaction",
      description: locale === "es" ? "Clientes completamente satisfechos" : locale === "ar" ? "رضا العملاء الكامل" : "Customer satisfaction rate"
    },
    {
      value: "99.99%",
      label: "Success Rate",
      description: locale === "es" ? "Tasa de aprobación de visas" : locale === "ar" ? "معدل الموافقة على التأشيرات" : "Visa approval success"
    },
  ];

  return (
    <>
      <Navbar />
      <InfoPageHero title={page.title} heroImage="/baku-country-hero.jpg" />

      <section className="relative z-30 bg-white -mt-10 md:-mt-16 rounded-t-[40px] md:rounded-t-[80px] px-5 md:px-12 lg:px-20 pt-4 pb-16">
        <div className="max-w-5xl mx-auto -mt-[40px] md:-mt-[80px]">
          <InfoPageStats stats={visaStats} />
        </div>

        <div className="max-w-3xl mx-auto mt-12 md:mt-16">
          <VisaContent
            body={page.body}
            locale={locale}
            fallback={
              locale === "es" ? (
                <>
                  <h2>Lista de Países Elegibles para e-Visa de Azerbaiyán 2026</h2>
                  <p>
                    Más de <strong>100 países son elegibles</strong> para solicitar la e-visa de Azerbaiyán en línea. Si eres ciudadano de <strong>Egipto, Arabia Saudita, Paquistán, Malasia, China, Irán, Emiratos Árabes Unidos, India, Turquía</strong> o cualquier país elegible, puedes obtener tu visa electrónica ASAN en solo unos minutos sin visitar la embajada.
                  </p>
                  <h3>¿Mi país es elegible para la e-visa de Azerbaiyán?</h3>
                  <p>
                    Los ciudadanos de países como <strong>Egipto, Arabia Saudita, Paquistán, Malasia, China, Irán, Estados Unidos, Reino Unido, Alemania, Francia, Italia, España, Canadá, Australia, Japón, Corea del Sur</strong> y muchos otros pueden solicitar la e-visa de Azerbaiyán. Verifica la lista completa de países elegibles seleccionando tu nacionalidad arriba.
                  </p>
                  <h3>Países Populares con e-Visa para Azerbaiyán</h3>
                  <p>
                    Los solicitantes más frecuentes provienen de <strong>Egipto, Arabia Saudita, Paquistán, India, China, Irán, Turquía, Malasia, Indonesia, Filipinas, EAU, Kuwait, Catar y Bangladés</strong>. Todos estos países tienen acceso completo al programa de visa electrónica ASAN de Azerbaiyán.
                  </p>
                  <h3>Requisitos de e-Visa para Azerbaiyán</h3>
                  <p>
                    Para solicitar la visa electrónica de Azerbaiyán necesitas: <strong>pasaporte válido</strong> con al menos 6 meses de validez, una foto digital tamaño pasaporte, una dirección de email válida y un método de pago. La tarifa estándar es de <strong>$69 USD</strong> e incluye todos los cargos gubernamentales.
                  </p>
                  <h3>Procesamiento Rápido de e-Visa</h3>
                  <p>
                    Nuestro servicio ofrece <strong>aprobación en 3 horas</strong> para procesamiento urgente o 3 días hábiles para procesamiento estándar. Con una tasa de éxito del <strong>99.99%</strong> y más de <strong>10,450 visas aprobadas</strong> este año, somos el servicio de e-visa más confiable para Azerbaiyán.
                  </p>
                  <h3>¿Cuánto Tiempo Puedo Quedarme en Azerbaiyán?</h3>
                  <p>
                    La e-visa de Azerbaiyán permite una <strong>estancia máxima de 30 días</strong> con entrada única. La visa es válida por 90 días desde la fecha de emisión, por lo que debes ingresar a Azerbaiyán dentro de ese período.
                  </p>
                  <blockquote>
                    Solicita tu e-visa de Azerbaiyán hoy mismo. Más de 100 países elegibles, proceso 100% en línea, sin necesidad de visitar embajada.
                  </blockquote>
                </>
              ) : locale === "ar" ? (
                <>
                  <h2>قائمة الدول المؤهلة للتأشيرة الإلكترونية لأذربيجان 2026</h2>
                  <p>
                    أكثر من <strong>100 دولة مؤهلة</strong> للتقدم بطلب التأشيرة الإلكترونية لأذربيجان عبر الإنترنت. إذا كنت من مواطني <strong>مصر، المملكة العربية السعودية، باكستان، ماليزيا، الصين، إيران، الإمارات، الهند، تركيا</strong> أو أي دولة مؤهلة، يمكنك الحصول على تأشيرة ASAN الإلكترونية في دقائق قليلة دون زيارة السفارة.
                  </p>
                  <h3>هل بلدي مؤهل للحصول على التأشيرة الإلكترونية لأذربيجان؟</h3>
                  <p>
                    يمكن لمواطني دول مثل <strong>مصر، المملكة العربية السعودية، باكستان، ماليزيا، الصين، إيران، الولايات المتحدة، المملكة المتحدة، ألمانيا، فرنسا، إيطاليا، إسبانيا، كندا، أستراليا، اليابان، كوريا الجنوبية</strong> وغيرها الكثير التقدم بطلب للحصول على التأشيرة الإلكترونية لأذربيجان. تحقق من القائمة الكاملة باختيار جنسيتك أعلاه.
                  </p>
                  <h3>الدول الأكثر شعبية للحصول على التأشيرة الإلكترونية لأذربيجان</h3>
                  <p>
                    يأتي أكثر المتقدمين من <strong>مصر، المملكة العربية السعودية، باكستان، الهند، الصين، إيران، تركيا، ماليزيا، إندونيسيا، الفلبين، الإمارات، الكويت، قطر، وبنغلاديش</strong>. جميع هذه الدول لديها وصول كامل إلى برنامج التأشيرة الإلكترونية ASAN لأذربيجان.
                  </p>
                  <h3>متطلبات التأشيرة الإلكترونية لأذربيجان</h3>
                  <p>
                    للتقدم بطلب التأشيرة الإلكترونية لأذربيجان، تحتاج إلى: <strong>جواز سفر صالح</strong> لمدة 6 أشهر على الأقل، صورة رقمية بحجم جواز السفر، عنوان بريد إلكتروني صالح وطريقة دفع. الرسوم القياسية هي <strong>69 دولاراً أمريكياً</strong> وتشمل جميع الرسوم الحكومية.
                  </p>
                  <h3>معالجة سريعة للتأشيرة الإلكترونية</h3>
                  <p>
                    تقدم خدمتنا <strong>موافقة خلال 3 ساعات</strong> للمعالجة العاجلة أو 3 أيام عمل للمعالجة القياسية. مع معدل نجاح <strong>99.99%</strong> وأكثر من <strong>10,450 تأشيرة موافق عليها</strong> هذا العام، نحن خدمة التأشيرة الإلكترونية الأكثر موثوقية لأذربيجان.
                  </p>
                  <h3>كم من الوقت يمكنني البقاء في أذربيجان؟</h3>
                  <p>
                    تسمح التأشيرة الإلكترونية لأذربيجان <strong>بإقامة قصوى 30 يوماً</strong> بدخول واحد. التأشيرة صالحة لمدة 90 يوماً من تاريخ الإصدار، لذلك يجب الدخول إلى أذربيجان خلال هذه الفترة.
                  </p>
                  <blockquote>
                    تقدم بطلب التأشيرة الإلكترونية لأذربيجان اليوم. أكثر من 100 دولة مؤهلة، عملية 100% عبر الإنترنت، بدون الحاجة لزيارة السفارة.
                  </blockquote>
                </>
              ) : (
                <>
                  <h2>Azerbaijan e-Visa Eligible Countries List 2026</h2>
                  <p>
                    Over <strong>100 countries are eligible</strong> to apply for the Azerbaijan e-Visa online. If you are a citizen of <strong>Egypt, Saudi Arabia, Pakistan, Malaysia, China, Iran, UAE, India, Turkey</strong>, or any eligible country, you can get your ASAN electronic visa in just minutes without visiting an embassy.
                  </p>
                  <h3>Is My Country Eligible for Azerbaijan e-Visa?</h3>
                  <p>
                    Citizens from countries like <strong>Egypt, Saudi Arabia, Pakistan, Malaysia, China, Iran, United States, United Kingdom, Germany, France, Italy, Spain, Canada, Australia, Japan, South Korea</strong>, and many others can apply for Azerbaijan e-Visa. Check the complete eligible countries list by selecting your nationality above.
                  </p>
                  <h3>Popular Countries for Azerbaijan e-Visa</h3>
                  <p>
                    Most frequent applicants come from <strong>Egypt, Saudi Arabia, Pakistan, India, China, Iran, Turkey, Malaysia, Indonesia, Philippines, UAE, Kuwait, Qatar, and Bangladesh</strong>. All these countries have full access to the Azerbaijan ASAN e-Visa program.
                  </p>
                  <h3>Azerbaijan e-Visa Requirements</h3>
                  <p>
                    To apply for the Azerbaijan electronic visa you need: a <strong>valid passport</strong> with at least 6 months validity, a digital passport-sized photo, a valid email address, and payment method. The standard fee is <strong>$69 USD</strong> which includes all government and processing charges.
                  </p>
                  <h3>Fast e-Visa Processing</h3>
                  <p>
                    Our service offers <strong>3-hour approval</strong> for urgent processing or 3 business days for standard processing. With a <strong>99.99% success rate</strong> and over <strong>10,450 approved visas</strong> this year, we are the most trusted e-Visa service for Azerbaijan.
                  </p>
                  <h3>How Long Can I Stay in Azerbaijan?</h3>
                  <p>
                    The Azerbaijan e-Visa allows a <strong>maximum 30-day stay</strong> with single entry. The visa is valid for 90 days from the date of issue, so you must enter Azerbaijan within that window.
                  </p>
                  <blockquote>
                    Apply for your Azerbaijan e-Visa today. Over 100 eligible countries, 100% online process, no embassy visit required.
                  </blockquote>
                </>
              )
            }
          />
        </div>
      </section>

      {countries.length > 0 && <NationalitySection countries={countries} />}

      {faqs.length > 0 && <FAQSection faqs={faqs} />}

      <section className="py-12 md:py-16 px-5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            {locale === "es"
              ? "Países Elegibles para e-Visa"
              : locale === "ar"
              ? "الدول المؤهلة"
              : "Eligible Countries"}
          </h2>
          <p className="text-center text-gray-600 mb-10 leading-relaxed">
            {locale === "es"
              ? "Más de 100 países son elegibles. Egipto, Arabia Saudita, Paquistán, Malasia, China, Irán y muchos más."
              : locale === "ar"
              ? "أكثر من 100 دول مؤهلة. مصر والمملكة العربية السعودية وباكستان وماليزيا والصين وإيران والمزيد."
              : "Over 100 countries eligible. Egypt, Saudi Arabia, Pakistan, Malaysia, China, Iran and more."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">
                {locale === "es" ? "Países Populares" : locale === "ar" ? "الدول الشهيرة" : "Popular Countries"}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {locale === "es"
                  ? "Egipto, Arabia Saudita, Paquistán, Malasia, China, Irán, UAE, Francia, Alemania, Reino Unido"
                  : locale === "ar"
                  ? "مصر والمملكة العربية السعودية وباكستان وماليزيا والصين وإيران والإمارات"
                  : "Egypt, Saudi Arabia, Pakistan, Malaysia, China, Iran, UAE, France, Germany, UK"}
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">
                {locale === "es" ? "Cómo Verificar" : locale === "ar" ? "كيفية التحقق" : "How to Check"}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {locale === "es"
                  ? "Selecciona tu país arriba. Revisa los requisitos. Solicita tu e-visa."
                  : locale === "ar"
                  ? "حدد دولتك. راجع المتطلبات. تقدم بطلب."
                  : "Select your country. Review requirements. Apply for e-visa."}
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">
                {locale === "es" ? "Proceso Rápido" : locale === "ar" ? "عملية سريعة" : "Fast Process"}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {locale === "es"
                  ? "5 minutos para aplicar. 3 horas aprobación. Sin visita a embajada."
                  : locale === "ar"
                  ? "5 دقائق للتقديم. 3 ساعات موافقة. بدون زيارة سفارة."
                  : "5 min to apply. 3 hrs approval. No embassy visit."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer7 />
    </>
  );
}
