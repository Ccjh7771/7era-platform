export function normalizeMalaysianPhone(input: string) {
  const digits = input.replace(/\D/g, "");

  let nationalDigits = digits;

  if (digits.startsWith("60")) {
    nationalDigits = `0${digits.slice(2)}`;
  } else if (digits.startsWith("1")) {
    nationalDigits = `0${digits}`;
  }

  if (!/^01\d{8,9}$/.test(nationalDigits)) {
    return null;
  }

  return `+60${nationalDigits.slice(1)}`;
}

export function displayMalaysianPhone(phone: string) {
  if (!/^\+601\d{8,9}$/.test(phone)) {
    return phone;
  }

  const national = `0${phone.slice(3)}`;
  const prefixLength = national.length === 11 ? 4 : 3;

  return `${national.slice(0, prefixLength)}-${national.slice(prefixLength, prefixLength + 3)}-${national.slice(prefixLength + 3)}`;
}
