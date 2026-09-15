"use client";

import { useEffect, useRef } from "react";
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
    // El diorama es crema: un visitante con el toggle en oscuro vería las
    // secciones de abajo en una paleta que nadie diseñó. Se fuerza claro
    // mientras dura la home y se devuelve lo que hubiera al salir.
    const root = document.documentElement;
    const prevTheme = root.getAttribute("data-theme");
    root.setAttribute("data-theme", "light");
    const destroy = mountStageWorld(el, config);
    return () => {
      destroy();
      if (prevTheme) root.setAttribute("data-theme", prevTheme);
    };
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
