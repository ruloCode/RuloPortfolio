"use client";

import { useEffect, useState } from "react";
import styles from "@/components/BrandSplash.module.scss";

const EXIT_MS = 1900;

/**
 * El velo de entrada: la marca se dibuja sola sobre el papel y se va.
 *
 * El velo se pinta en el HTML del servidor, así que existe desde el primer
 * frame y no espera a la hidratación. Toda la coreografía vive en CSS; este
 * componente solo lo desmonta al final para no dejar un <div> fijo colgado
 * en el árbol el resto de la visita.
 *
 * Quién decide que NO aparezca: el script en línea del layout, que marca
 * <html data-splash="seen"> cuando ya se vio en esta sesión. Esa decisión no
 * puede vivir aquí — en React solo podría tomarla después de hidratar, y para
 * entonces el velo ya habría parpadeado.
 */
export function BrandSplash() {
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.splash} aria-hidden="true">
      <div className={styles.stack}>
        <svg className={styles.mark} viewBox="0 0 64 64" role="presentation" focusable="false">
          <path
            className={styles.tail}
            d="M49 15C41 21 39.5 28 39.5 37"
            fill="none"
            stroke="#111110"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            className={styles.loop}
            d="M39.5 37A12.5 12.5 0 1 1 22.7 25.3"
            fill="none"
            stroke="#08533C"
            strokeWidth="10.5"
            strokeLinecap="round"
          />
        </svg>
        <p className={styles.word}>rulocode</p>
      </div>
    </div>
  );
}
