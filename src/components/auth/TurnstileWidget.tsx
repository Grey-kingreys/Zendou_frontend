"use client";

import Script from "next/script";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

/** Surface (partielle) exposée par le script officiel `api.js` de Cloudflare Turnstile. */
interface TurnstileGlobal {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileGlobal;
  }
}

export interface TurnstileWidgetHandle {
  /**
   * Un jeton Turnstile est à usage unique : à appeler après tout échec
   * (widget expiré/en erreur, ou backend ayant rejeté le jeton) pour que
   * l'utilisateur reparte sur un jeton neuf plutôt que de rejouer l'ancien.
   */
  reset: () => void;
}

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire: () => void;
  onError: () => void;
}

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ siteKey, onVerify, onExpire, onError }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [scriptReady, setScriptReady] = useState(false);

    // Les callbacks les plus récentes vivent dans des refs : l'effet de
    // rendu ci-dessous ne doit se relancer que si le script vient de charger
    // ou si la clé de site change — pas à chaque re-render du formulaire
    // parent (qui recrée ces fonctions à chaque frappe).
    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);
    useEffect(() => {
      onVerifyRef.current = onVerify;
      onExpireRef.current = onExpire;
      onErrorRef.current = onError;
    });

    useImperativeHandle(ref, () => ({
      reset() {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      if (!scriptReady || !containerRef.current || !window.turnstile) {
        return;
      }

      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token) => onVerifyRef.current(token),
        "expired-callback": () => onExpireRef.current(),
        "error-callback": () => onErrorRef.current(),
      });
      widgetIdRef.current = widgetId;

      return () => {
        window.turnstile?.remove(widgetId);
        widgetIdRef.current = null;
      };
    }, [scriptReady, siteKey]);

    return (
      <>
        <Script
          src={TURNSTILE_SCRIPT_SRC}
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
        />
        <div ref={containerRef} />
      </>
    );
  }
);

export default TurnstileWidget;
