import "server-only";

import { randomBytes } from "node:crypto";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function generateTemporaryPassword() {
  const bytes = randomBytes(10);
  let randomPart = "";

  for (const byte of bytes) {
    randomPart += alphabet[byte % alphabet.length];
  }

  return `Era7!${randomPart}`;
}

export function isStrongMemberPassword(password: string) {
  return (
    password.length >= 10 &&
    password.length <= 72 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}
