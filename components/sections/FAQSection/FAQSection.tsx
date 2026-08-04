"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Accordion } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tabs } from "@/components/ui/Tabs";

import {
  backgroundGlowStyles,
  clearButtonStyles,
  containerStyles,
  controlsStyles,
  ctaDescriptionStyles,
  ctaLinkStyles,
  ctaPanelStyles,
  ctaSectionStyles,
  ctaTitleStyles,
  emptyDescriptionStyles,
  emptyIconStyles,
  emptyStateStyles,
  emptyTitleStyles,
  faqPanelStyles,
  purpleGlowStyles,
  resultsSummaryStyles,
  searchIconStyles,
  searchInputStyles,
  searchWrapperStyles,
  sectionStyles,
  tabsStyles,
} from "./FAQSection.styles";

import type {
  FAQCategoryOption,
  FAQSectionProps,
} from "./FAQSection.types";

const faqCategories: FAQCategoryOption[] = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "download",
    label: "Download",
  },
  {
    id: "promotion",
    label: "Promotion",
  },
  {
    id: "account",
    label: "Account",
  },
  {
    id: "technical",
    label: "Technical",
  },
  {
    id: "security",
    label: "Security",
  },
];

export function FAQSection({ faqItems }: FAQSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const visibleFaqItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return faqItems.filter((item) => {
      if (!item.visible) {
        return false;
      }

      const matchesCategory =
        activeCategory === "all" ||
        item.category === activeCategory;

      const matchesSearch =
        normalizedQuery.length === 0 ||
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, faqItems, searchQuery]);

  const accordionItems = visibleFaqItems.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
  }));

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
  };

  return (
    <section
      id="faq"
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
            badge="HELP CENTER"
            title="Frequently Asked Questions"
            description="Find quick answers about downloads, promotions, accounts, technical support and platform security."
          />
        </Reveal>

        <Reveal delay={100}>
          <div className={controlsStyles}>
            <div className={searchWrapperStyles}>
              <span
                className={searchIconStyles}
                aria-hidden="true"
              >
                ⌕
              </span>

              <label
                htmlFor="faq-search"
                className="sr-only"
              >
                Search frequently asked questions
              </label>

              <input
                id="faq-search"
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                }}
                placeholder="Search your question..."
                className={searchInputStyles}
              />
            </div>

            <Tabs
              items={faqCategories}
              value={activeCategory}
              onValueChange={setActiveCategory}
              ariaLabel="Filter frequently asked questions by category"
              className={tabsStyles}
            />

            <p
              className={resultsSummaryStyles}
              aria-live="polite"
            >
              Showing {visibleFaqItems.length}{" "}
              {visibleFaqItems.length === 1
                ? "answer"
                : "answers"}
            </p>
          </div>
        </Reveal>

        {accordionItems.length > 0 ? (
          <Reveal distance={24}>
            <div className={faqPanelStyles}>
              <Accordion items={accordionItems} />
            </div>
          </Reveal>
        ) : (
          <Reveal distance={24}>
            <div className={emptyStateStyles}>
              <div className={emptyIconStyles}>
                ?
              </div>

              <h2 className={emptyTitleStyles}>
                No answers found
              </h2>

              <p className={emptyDescriptionStyles}>
                We could not find a matching FAQ. Try another keyword,
                select a different category or contact our support team.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className={clearButtonStyles}
              >
                Clear filters
              </button>
            </div>
          </Reveal>
        )}

        <div className={ctaSectionStyles}>
          <Reveal distance={32}>
            <div className={ctaPanelStyles}>
              <h2 className={ctaTitleStyles}>
                Still need assistance?
              </h2>

              <p className={ctaDescriptionStyles}>
                Contact our customer support team for help with your
                account, application downloads, promotions or technical
                issues.
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
