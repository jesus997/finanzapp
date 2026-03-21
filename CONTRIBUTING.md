# Contribuir a FinanzApp

¡Gracias por tu interés en contribuir! Este documento te guía para empezar.

## Primeros pasos

1. Haz fork del repositorio
2. Clona tu fork: `git clone https://github.com/tu-usuario/finanzapp.git`
3. Sigue las instrucciones de instalación en el [README](./README.md)
4. Lee las [convenciones del proyecto](./CONVENTIONS.md) — es lectura obligatoria

## Flujo de trabajo

1. Crea una rama desde `main`:
   ```bash
   git checkout -b feat/nombre-del-feature
   ```
2. Haz tus cambios siguiendo las [convenciones](./CONVENTIONS.md)
3. Escribe tests para tu código nuevo
4. Verifica que todo pase:
   ```bash
   npm run test:run    # Tests
   npm run build       # Build de producción
   ```
5. Haz commit siguiendo [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add loan CRUD"
   ```
6. Push y abre un Pull Request

## Checklist para Pull Requests

- [ ] El código sigue las [convenciones](./CONVENTIONS.md) (inglés en código, español en UI)
- [ ] Se agregaron tests para el código nuevo
- [ ] `npm run test:run` pasa sin errores
- [ ] `npm run build` compila sin errores
- [ ] Se actualizó la documentación si aplica (DESIGN.md, README.md)
- [ ] Se agregaron `error.tsx` y `loading.tsx` para rutas nuevas

## Estructura para nuevos módulos

Al agregar un nuevo módulo (ej: préstamos), crear:

```
src/
├── app/prestamos/
│   ├── page.tsx              # Listado
│   ├── error.tsx             # Error boundary
│   ├── loading.tsx           # Loading state
│   ├── nuevo/page.tsx        # Crear
│   └── [id]/editar/page.tsx  # Editar
├── components/loan/
│   └── loan-form.tsx         # Formulario (crear/editar)
└── lib/
    ├── actions/loan.ts       # Server Actions
    └── validations/
        ├── loan.ts           # Schema Zod
        └── loan.test.ts      # Tests del schema
```

Además:
- Agregar labels en español a `src/lib/constants.ts`
- Agregar link en `src/components/navbar.tsx`
- Agregar acceso rápido en `src/app/page.tsx`
- Actualizar `DESIGN.md` con el estado de la nueva página

## Reportar bugs

Abre un issue con:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si aplica

## Proponer features

Abre un issue describiendo:
- Qué problema resuelve
- Cómo debería funcionar
- Mockups o ejemplos si los tienes
