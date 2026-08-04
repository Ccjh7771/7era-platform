import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getWebsiteSettings } from "@/lib/data/get-website-settings";

import {
    actionListStyles,
    arrowStyles,
    backgroundGlowStyles,
    containerStyles,
    contentStyles,
    featureCardStyles,
    featureLabelStyles,
    featureListStyles,
    featureValueStyles,
    leftStyles,
    panelStyles,
    primaryLinkStyles,
    rightStyles,
    secondaryLinkStyles,
    sectionStyles,
    supportCardStyles,
    supportDescriptionStyles,
    supportTitleStyles,
} from "./ContactSection.styles";

const supportFeatures = [
    {
        value: "24/7",
        label: "Available",
    },
    {
        value: "Fast",
        label: "Response",
    },
    {
        value: "Secure",
        label: "Support",
    },
];

export async function ContactSection() {
    const settings = await getWebsiteSettings();

    return (
        <section
            id="contact"
            className={sectionStyles}
        >
            <div
                className={backgroundGlowStyles}
                aria-hidden="true"
            />

            <div className={containerStyles}>
                <Reveal distance={32}>
                    <div className={panelStyles}>
                        <div className={contentStyles}>
                            <div className={leftStyles}>
                                <SectionHeader
                                    badge="CUSTOMER SUPPORT"
                                    title={settings.supportHeading}
                                    description={settings.supportDescription}
                                    align="left"
                                    showDot
                                />

                                <div className={featureListStyles}>
                                    {supportFeatures.map((feature) => (
                                        <div
                                            key={feature.label}
                                            className={featureCardStyles}
                                        >
                                            <span className={featureValueStyles}>
                                                {feature.value}
                                            </span>

                                            <span className={featureLabelStyles}>
                                                {feature.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={rightStyles}>
                                <div className={supportCardStyles}>
                                    <h3 className={supportTitleStyles}>
                                        Contact our team
                                    </h3>

                                    <p className={supportDescriptionStyles}>
                                        Choose your preferred support channel and connect with our
                                        customer service team.
                                    </p>

                                    <div className={actionListStyles}>
                                        <a
                                            href={settings.whatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`group ${primaryLinkStyles}`}
                                        >
                                            <span>WhatsApp Support</span>

                                            <span
                                                className={arrowStyles}
                                                aria-hidden="true"
                                            >
                                                →
                                            </span>
                                        </a>

                                        <a
                                            href={settings.heylinkUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`group ${secondaryLinkStyles}`}
                                        >
                                            <span>Official HeyLink</span>

                                            <span
                                                className={arrowStyles}
                                                aria-hidden="true"
                                            >
                                                →
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
