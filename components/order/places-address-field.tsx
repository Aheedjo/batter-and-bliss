"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_KEY =
  typeof process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "string"
    ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.trim()
    : "";

function placesCountryCodes(): string[] {
  const raw = process.env.NEXT_PUBLIC_GOOGLE_PLACES_COUNTRY;
  if (raw === undefined) return ["ng"];
  const t = raw.trim();
  if (!t) return ["ng"];
  if (t.toLowerCase() === "all") return [];
  return t
    .split(/[,\s]+/)
    .map((c) => c.trim().toLowerCase())
    .filter((c) => c.length === 2);
}

const PLACES_COUNTRIES = placesCountryCodes();

function loadPlacesLibrary(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-bb-google-places="1"]',
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      const deadline = window.setTimeout(
        () => reject(new Error("Google Maps load timeout")),
        20000,
      );
      const done = () => {
        window.clearTimeout(deadline);
        resolve();
      };
      const fail = () => {
        window.clearTimeout(deadline);
        reject(new Error("Google Maps script error"));
      };
      existing.addEventListener("error", fail, { once: true });
      const tick = () => {
        if (window.google?.maps?.places) done();
        else window.requestAnimationFrame(tick);
      };
      tick();
    });
  }

  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.dataset.bbGooglePlaces = "1";
    s.async = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Google Maps script failed"));
    document.head.appendChild(s);
  });
}

type Props = {
  id: string;
  name: string;
  value: string;
  onChange: (next: string) => void;
  maxLength: number;
  placeholder: string;
  /** Single-line field when Places is active */
  inputClassName: string;
  /** Multi-line fallback */
  textareaClassName: string;
};

export function PlacesAddressField({
  id,
  name,
  value,
  onChange,
  maxLength,
  placeholder,
  inputClassName,
  textareaClassName,
}: Props) {
  const hasKey = GOOGLE_MAPS_KEY.length > 0;
  const [manualMode, setManualMode] = useState(!hasKey);
  const [loadError, setLoadError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);
  const maxLengthRef = useRef(maxLength);

  useEffect(() => {
    onChangeRef.current = onChange;
    maxLengthRef.current = maxLength;
  }, [onChange, maxLength]);

  const useTextarea = !hasKey || manualMode || loadError;

  useEffect(() => {
    if (useTextarea || !hasKey) return;

    let cancelled = false;

    loadPlacesLibrary(GOOGLE_MAPS_KEY)
      .then(() => {
        if (cancelled || !inputRef.current) return;
        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address"],
          componentRestrictions:
            PLACES_COUNTRIES.length > 0
              ? { country: PLACES_COUNTRIES }
              : undefined,
        });
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          const line = place.formatted_address?.trim();
          if (line) {
            onChangeRef.current(line.slice(0, maxLengthRef.current));
          }
        });
        acRef.current = ac;
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
      const g = globalThis as typeof globalThis & { google?: typeof google };
      if (acRef.current && g.google?.maps?.event) {
        g.google.maps.event.clearInstanceListeners(acRef.current);
      }
      acRef.current = null;
    };
  }, [hasKey, useTextarea]);

  if (useTextarea) {
    return (
      <>
        {hasKey && loadError ? (
          <p className="mb-2 font-sans text-[11px] text-amber-800 dark:text-amber-200/90">
            Address suggestions could not load. You can still type your full
            address below.
          </p>
        ) : null}
        <textarea
          id={id}
          name={name}
          autoComplete="street-address"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={textareaClassName}
        />
        {hasKey && !loadError ? (
          <button
            type="button"
            onClick={() => {
              setManualMode(false);
              setLoadError(false);
            }}
            className="mt-2 font-sans text-[11px] font-medium text-order-brownInk underline decoration-order-line/70 underline-offset-4 hover:decoration-order-brown"
          >
            Use address search instead
          </button>
        ) : null}
      </>
    );
  }

  return (
    <>
      <p className="mb-2 font-sans text-[11px] text-order-taupe">
        Start typing and choose your address from the list for the most
        accurate delivery location.
      </p>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        className={inputClassName}
      />
      <button
        type="button"
        onClick={() => setManualMode(true)}
        className="mt-2 font-sans text-[11px] font-medium text-order-brownInk underline decoration-order-line/70 underline-offset-4 hover:decoration-order-brown"
      >
        Prefer to type the full address manually
      </button>
    </>
  );
}
