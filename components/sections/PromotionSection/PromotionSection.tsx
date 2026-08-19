import Link from "next/link";

import { Accordion } from "@/components/ui/Accordion";
import { PromotionCard } from "@/components/ui/PromotionCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { PromotionItem } from "@/lib/data/promotions";

import {
    backgroundGlowStyles,
    benefitCardStyles,
    benefitLabelStyles,
    benefitsBadgeStyles,
    benefitsDescriptionStyles,
    benefitsGridStyles,
    benefitsHeaderStyles,
    benefitsPanelStyles,
    benefitsSectionStyles,
    benefitsTitleStyles,
    benefitValueStyles,
    containerStyles,
    ctaDescriptionStyles,
    ctaLinkStyles,
    ctaPanelStyles,
    ctaSectionStyles,
    ctaTitleStyles,
    faqBadgeStyles,
    faqDescriptionStyles,
    faqHeaderStyles,
    faqListStyles,
    faqPanelStyles,
    faqSectionStyles,
    faqTitleStyles,
    gridStyles,
    purpleGlowStyles,
    sectionStyles,
    termsStyles,
} from "./PromotionSection.styles";

import type { PromotionBenefit } from "./PromotionSection.types";

const promotionBenefits: PromotionBenefit[] = [
    {
        value: "Exclusive",
        label: "Member Rewards",
    },
    {
        value: "Weekly",
        label: "New Campaigns",
    },
    {
        value: "Premium",
        label: "VIP Benefits",
    },
    {
        value: "24/7",
        label: "Support Access",
    },
];

const promotionFaqItems = [
    {
        id: "promotion-eligibility",
        question: "Who is eligible to participate in promotions?",
        answer:
            "Eligibility depends on the applicable campaign requirements. Review the promotion details and terms before participating.",
    },
    {
        id: "claim-promotion",
        question: "How do I claim a promotion reward?",
        answer:
            "Follow the instructions provided on the promotion page. Some rewards may require registration, verification or additional campaign steps.",
    },
    {
        id: "promotion-expiry",
        question: "What happens when a promotion expires?",
        answer:
            "Expired promotions are no longer available for new participation. Existing claims remain subject to the applicable campaign terms.",
    },
    {
        id: "promotion-support",
        question: "Where can I get help with a promotion?",
        answer:
            "Contact the official 7ERA Platform customer support channel and provide the relevant promotion name and account details.",
    },
];

export function PromotionSection({
    promotions,
}: {
    promotions: PromotionItem[];
}) {
    return (
        <section
            id="promotions"
            className={sectionStyles}
        >
            <div
                className={backgroundGlowStyles}
                aria-hidden="true"
            />

            <div
                className={purpleGlowStyles}
                aria-hidden="true"
            />

            <div className={containerStyles}>
                <Reveal>
                    <SectionHeader
                        badge="EXCLUSIVE PROMOTIONS"
                        title="Unlock Premium Rewards"
                        description="Discover the latest member campaigns, limited-time rewards and exclusive benefits available across the 7ERA Platform."
                    />
                </Reveal>

                <div className={gridStyles}>
                    {promotions.map((promotion, index) => (
                        <Reveal
                            key={promotion.id}
                            delay={index * 80}
                            className="h-full"
                        >
                            <PromotionCard
                                title={promotion.title}
                                subtitle={promotion.subtitle}
                                description={promotion.description}
                                category={promotion.category}
                                image={promotion.image}
                                status={promotion.status}
                                featured={promotion.featured}
                                className="h-full"
                            />
                        </Reveal>
                    ))}
                </div>

                <div className={benefitsSectionStyles}>
                    <Reveal distance={32}>
                        <div className={benefitsPanelStyles}>
                            <div className={benefitsHeaderStyles}>
                                <span className={benefitsBadgeStyles}>
                                    Member Benefits
                                </span>

                                <h2 className={benefitsTitleStyles}>
                                    More value with every campaign
                                </h2>

                                <p className={benefitsDescriptionStyles}>
                                    Explore selected rewards created to provide members with a
                                    premium, reliable and rewarding platform experience.
                                </p>
                            </div>

                            <div className={benefitsGridStyles}>
                                {promotionBenefits.map((benefit, index) => (
                                    <Reveal
                                        key={benefit.label}
                                        delay={index * 80}
                                        className="h-full"
                                    >
                                        <div className={benefitCardStyles}>
                                            <p className={benefitValueStyles}>
                                                {benefit.value}
                                            </p>

                                            <p className={benefitLabelStyles}>
                                                {benefit.label}
                                            </p>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>

                            <p className={termsStyles}>
                                Promotion eligibility, availability and campaign requirements
                                may vary. Please review the applicable terms before
                                participating.
                            </p>
                        </div>
                    </Reveal>
                </div>

                <div className={faqSectionStyles}>
                    <Reveal distance={32}>
                        <div className={faqPanelStyles}>
                            <div className={faqHeaderStyles}>
                                <span className={faqBadgeStyles}>
                                    Promotion FAQ
                                </span>

                                <h2 className={faqTitleStyles}>
                                    Frequently asked questions
                                </h2>

                                <p className={faqDescriptionStyles}>
                                    Find quick answers about promotion eligibility, claiming
                                    rewards and campaign availability.
                                </p>
                            </div>

                            <Accordion
                                items={promotionFaqItems}
                                className={faqListStyles}
                            />
                        </div>
                    </Reveal>
                </div>

                <div className={ctaSectionStyles}>
                    <Reveal distance={32}>
                        <div className={ctaPanelStyles}>
                            <h2 className={ctaTitleStyles}>
                                Need help with a promotion?
                            </h2>

                            <p className={ctaDescriptionStyles}>
                                Contact our customer support team for assistance with campaign
                                eligibility, reward claims and promotion requirements.
                            </p>

                            <Link
                                href="/#contact"
                                className={ctaLinkStyles}
                            >
                                Contact Support
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
