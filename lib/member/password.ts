import "server-only";

import { randomInt } from "node:crypto";

export function generateTemporaryPassword() {
  return String(randomInt(100_000, 1_000_000));
}

export function isSixDigitMemberPassword(password: string) {
  return /^\d{6}$/.test(password);
}
