"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import {
  accordionStyles,
  answerStyles,
  contentInnerStyles,
  contentWrapperStyles,
  iconStyles,
  itemStyles,
  triggerStyles,
} from "./Accordion.styles";

import type { AccordionProps } from "./Accordion.types";

export function Accordion({
  items,
  className,
}: AccordionProps) {
  const [openItemId, setOpenItemId] = useState<string | null>(
    items[0]?.id ?? null,
  );

  return (
    <div className={cn(accordionStyles, className)}>
      {items.map((item) => {
        const isOpen = item.id === openItemId;
        const contentId = `accordion-content-${item.id}`;
        const triggerId = `accordion-trigger-${item.id}`;

        return (
          <div
            key={item.id}
            className={itemStyles}
          >
            <h3>
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => {
                  setOpenItemId((currentItemId) =>
                    currentItemId === item.id ? null : item.id,
                  );
                }}
                className={triggerStyles}
              >
                <span>{item.question}</span>

                <span
                  className={cn(
                    iconStyles,
                    isOpen && "rotate-45",
                  )}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
            </h3>

            <div
              id={contentId}
              role="region"
              aria-labelledby={triggerId}
              className={cn(
                contentWrapperStyles,
                isOpen
                  ? "grid-rows-[1fr]"
                  : "grid-rows-[0fr]",
              )}
            >
              <div className={contentInnerStyles}>
                <p className={answerStyles}>
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}