"use client";

import { useEffect, useRef } from "react";
import { track } from "@vercel/analytics";
import { mountStageWorld } from "@/lib/scroll-world/stage-engine";
import type { WorldConfig } from "@/lib/scroll-world/sections";
import "@/styles/scroll-world.css";

// El motor es vanilla JS framework-agnóstico: construye su propio DOM dentro
// del contenedor e inyecta su CSS. React solo aporta el punto de montaje y
// lo desmonta al salir de la home (el motor devuelve destroy()).
export function StageWorld({ config }: { config: WorldConfig }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // `onEvent` se engancha aquí y no en la config: esta viaja del servidor al
    // cliente y una función no cruza esa frontera. Los avisos cuentan qué
    // estación se ve y desde cuál se pulsa, que es lo que falta para saber
    // dónde se cae la gente dentro de una portada que es una sola página.
    const destroy = mountStageWorld(el, {
      ...config,
      onEvent: (name, data) => track(name, data),
    });
    return destroy;
  }, [config]);

  return (
    <div
      ref={ref}
      id="world"
      style={
        {
          // El motor trae ui-rounded/system; aquí manda la tipografía del sitio.
          "--sw-font-display": "var(--font-secondary), system-ui, sans-serif",
          "--sw-font-body": "var(--font-primary), system-ui, sans-serif",
        } as React.CSSProperties
      }
    />
  );
}
