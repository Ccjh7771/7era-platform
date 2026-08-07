export const MALAYSIA_TIMEZONE = "Asia/Kuala_Lumpur";

export function malaysiaDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: MALAYSIA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function formatMalaysiaDateTime(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    timeZone: MALAYSIA_TIMEZONE,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function isWithinCampaignWindow(
  startsAt: string | null,
  endsAt: string | null,
  now = new Date(),
) {
  const currentTime = now.getTime();
  const startTime = startsAt ? new Date(startsAt).getTime() : null;
  const endTime = endsAt ? new Date(endsAt).getTime() : null;

  return (
    (startTime === null || startTime <= currentTime) &&
    (endTime === null || endTime >= currentTime)
  );
}
