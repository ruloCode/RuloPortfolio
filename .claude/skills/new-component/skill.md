# Crear Nuevo Componente

## Estructura
```
src/components/
├── NombreComponente/
│   ├── NombreComponente.tsx
│   ├── NombreComponente.module.scss
│   └── index.ts
```

## Template TSX
```tsx
import React from 'react';
import styles from './NombreComponente.module.scss';

interface NombreComponenteProps {
  // props
}

export const NombreComponente: React.FC<NombreComponenteProps> = ({ }) => {
  return (
    <div className={styles.container}>
      {/* contenido */}
    </div>
  );
};
```

## Template SCSS
```scss
.container {
  // estilos base
}
```

## Export
```ts
export { NombreComponente } from './NombreComponente';
```
