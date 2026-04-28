"use client";

import { useCallback, useState } from "react";
import {
  isBankConfigured,
  readPublicBankDetails,
} from "@/lib/order/bank-public";
import { formatPrice } from "@/lib/order/money";

const copyBtnClass =
  "shrink-0 rounded-lg border border-order-line/80 bg-order-bg px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide text-order-brownInk transition hover:bg-order-card";

function CopyRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [done, setDone] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  }, [value]);

  return (
    <div className="flex items-start justify-between gap-3 border-b border-order-line/50 px-1 py-2 last:border-b-0 sm:px-2">
      <div className="min-w-0 pr-1">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-wide text-order-muted leading-none">
          {label}
        </p>
        <p
          className={`mt-1 break-all font-sans text-[13px] font-medium leading-snug text-order-brownDark ${
            mono ? "tabular-nums tracking-tight" : ""
          }`}
        >
          {value}
        </p>
      </div>
      <button type="button" onClick={copy} className={copyBtnClass}>
        {done ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

type Props = {
  reference: string;
  amount: number;
  className?: string;
};

export function BankTransferPanel({ reference, amount, className = "" }: Props) {
  const bank = readPublicBankDetails();
  const configured = isBankConfigured(bank);
  const amountStr = formatPrice(amount);

  return (
    <div
      className={`rounded-[1.25rem] bg-order-card p-4 text-left shadow-soft ring-1 ring-order-line/50 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-order-bg text-lg ring-1 ring-black/[0.04]">
          🏦
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm font-bold text-order-brownDark">
            Bank transfer
          </p>
          <p className="mt-1 font-sans text-[12px] leading-snug text-order-taupe">
            Send the exact amount below. Include the reference in your transfer
            narration or memo so we can match your payment.
          </p>
        </div>
      </div>

      {configured ? (
        <div className="mt-4 rounded-2xl bg-order-bg/90 px-2 py-0.5 ring-1 ring-black/[0.04] sm:px-3">
          <CopyRow label="Bank" value={bank.bankName} />
          <CopyRow label="Account name" value={bank.accountName} />
          <CopyRow label="Account number" value={bank.accountNumber} mono />
          <CopyRow label="Amount" value={amountStr} mono />
          <CopyRow label="Reference (memo)" value={reference} mono />
        </div>
      ) : (
        <div className="mt-4 rounded-2xl bg-order-bg px-3 py-3 ring-1 ring-black/[0.04]">
          <p className="font-sans text-[12px] leading-snug text-order-taupe">
            Live account details will appear here once they&apos;re configured.
            You can still place your order—save your reference and total, then
            reach out if you need the account number.
          </p>
          <div className="mt-3 rounded-xl bg-order-card/80 px-0.5 py-0.5 ring-1 ring-order-line/40 sm:px-1">
            <CopyRow label="Amount" value={amountStr} mono />
            <CopyRow label="Reference (memo)" value={reference} mono />
          </div>
        </div>
      )}
    </div>
  );
}
