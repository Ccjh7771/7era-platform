export function isActionableHref(
  href: string | null | undefined,
) {
  const normalizedHref = href?.trim();

  return Boolean(
    normalizedHref && normalizedHref !== "#",
  );
}
