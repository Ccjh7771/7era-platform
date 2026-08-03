"use client";

import { cn } from "@/lib/utils";

import {
  activeTabStyles,
  disabledTabStyles,
  inactiveTabStyles,
  tabBaseStyles,
  tabsListStyles,
  tabsWrapperStyles,
} from "./Tabs.styles";

import type { TabsProps } from "./Tabs.types";

export function Tabs({
  items,
  value,
  onValueChange,
  ariaLabel = "Content filter",
  className,
}: TabsProps) {
  return (
    <div
      className={cn(
        tabsWrapperStyles,
        className,
      )}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={tabsListStyles}
      >
        {items.map((item) => {
          const isActive = item.id === value;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  onValueChange(item.id);
                }
              }}
              className={cn(
                tabBaseStyles,
                isActive
                  ? activeTabStyles
                  : inactiveTabStyles,
                item.disabled && disabledTabStyles,
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}