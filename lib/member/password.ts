import "server-only";

export function isValidMemberPassword(password: string) {
  return password.length >= 6 && password.length <= 72;
}
