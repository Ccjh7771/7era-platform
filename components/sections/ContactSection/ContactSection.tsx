import { SectionHeader } from "@/components/ui/SectionHeader";

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

export function ContactSection() {
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
                <div className={panelStyles}>
                    <div className={contentStyles}>
                        <div className={leftStyles}>
                            <SectionHeader
                                badge="CUSTOMER SUPPORT"
                                title="Need assistance with our platform?"
                                description="Our support team is available to help with account enquiries, platform access, game downloads and general assistance."
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
                                        href="#"
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
                                        href="#"
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
            </div>
        </section>
    );
}