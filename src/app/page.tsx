import { PortfolioNavbar } from "./_components/PortfolioNavbar";
import { ProductTeaserCard } from "./_components/ProductTeaserCard";
import { BankingScaleHero } from "./_components/BankingScaleHero";
import { CaseStudiesCarousel } from "./_components/CaseStudiesCarousel";
import { IntegrationCarousel } from "./_components/IntegrationCarousel";
import { PricingSection } from "./_components/PricingSection";
import { FAQSection } from "./_components/FAQSection";
import { Footer } from "./_components/Footer";

export default function Page() {
  return (
    <>
      <PortfolioNavbar />
      <ProductTeaserCard />
      <BankingScaleHero />
      {/* <CaseStudiesCarousel /> */}
      <IntegrationCarousel />
      <PricingSection />
      <FAQSection />
      <Footer />
    </>
  );
}
