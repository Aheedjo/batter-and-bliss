export type PublicBankDetails = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export function isBankConfigured(d: PublicBankDetails): boolean {
  return Boolean(d.bankName && d.accountNumber && d.accountName);
}

/** Shown when `NEXT_PUBLIC_*` bank vars are unset and `NODE_ENV === "development"` only. */
const TEST_BANK_DETAILS: PublicBankDetails = {
  bankName: "Demo Bank (test)",
  accountNumber: "0123456789",
  accountName: "Batter & Bliss — test account",
};

/** Client-safe; set NEXT_PUBLIC_* in env for checkout / track pages. */
export function readPublicBankDetails(): PublicBankDetails {
  const fromEnv: PublicBankDetails = {
    bankName: process.env.NEXT_PUBLIC_BANK_NAME?.trim() ?? "",
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER?.trim() ?? "",
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME?.trim() ?? "",
  };
  if (isBankConfigured(fromEnv)) return fromEnv;
  if (process.env.NODE_ENV === "development") return TEST_BANK_DETAILS;
  return fromEnv;
}
