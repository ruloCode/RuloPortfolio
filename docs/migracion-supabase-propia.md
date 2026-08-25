# Separar el portfolio de «hermes os» a su propia base de Supabase

Runbook para mover las tablas del AI Shift Challenge desde el proyecto compartido
`dqnsjlbwrcwuxmtxrwkj` («hermes os») a un proyecto de Supabase propio, y dejar
hermes limpio.

**Redactado:** 19 de agosto de 2026
**Estado del inventario:** verificado contra la base en producción ese mismo día.

---

## Por qué

Hoy el portfolio y hermes os comparten una sola base de datos. Eso ya está
causando daño concreto:

1. **`supabase db push` no funciona en este repo.** El historial de migraciones
   remoto tiene las entradas `001`–`023` de hermes. El CLI exige que local y
   remoto coincidan, y para lograrlo habría que borrar el historial de la otra
   app o meter 23 archivos ajenos en este repo. Por eso las 6 migraciones
   anteriores se aplicaron pegándolas a mano.
2. **Riesgo de colisión de nombres.** `profiles`, `sessions` y `transactions`
   son nombres genéricos. Las migraciones usan `create table if not exists`: si
   hermes hubiera creado un `profiles` primero, la del portfolio habría saltado
   **en silencio** y las policies se habrían aplicado sobre la tabla ajena.
3. **El radio de daño es doble.** Un `db reset` o una migración equivocada desde
   cualquiera de los dos lados afecta a los dos proyectos.

## Por qué ahora y no después

Evelyn (primera clienta de pago) **todavía no ha creado su cuenta**: está en
`waitlist` pero no tiene fila en `profiles` ni en `auth.users`. Una vez pague y
entre, migrar significa mover la cuenta de una clienta que ya pagó. Hoy son 2
usuarios internos y 21 filas.

---

## Inventario: qué es de quién

### Del portfolio (se mueve)

| Objeto | Tipo | Filas |
|---|---|---|
| `public.waitlist` | tabla | 4 |
| `public.profiles` | tabla | 2 |
| `public.lesson_progress` | tabla | 3 |
| `public.mentoring_sessions` | tabla | 2 |
| `public.session_actions` | tabla | 10 |
| `public.enrollments` | tabla | **aún no creada** |
| `private` | schema | — |
| `private.handle_new_user()` | función | — |
| `private.guard_profile_role()` | función | — |
| `private.is_admin()` | función | — |
| `private.touch_mentoring_session()` | función | — |
| `auth.users → on_auth_user_created` | trigger | — |

**Total de datos: 21 filas.** La migración de datos es trivial.

### Usuarios de auth (2, ambos internos)

| Email | UUID actual | Rol |
|---|---|---|
| `rulocode7@gmail.com` | `446bc858-11e8-437d-80a4-521b91918566` | `admin` |
| `andrescbc4@gmail.com` | `90f2f3bb-a793-42ef-b8fb-c01b82583ecb` | `waitlist` |

### De hermes os (se queda, no se toca)

Migraciones `001`–`023` y sus tablas: `agent_activity`, `agent_presence`,
`budgets`, `content_*`, `conversation_messages`, `english_sessions`,
`english_vocab`, `goals`, `habit_checkins`, `habits`, `meetings`, `memories`,
`preferences`, `projects_cache`, `remote_config`, `sessions`, `task_executions`,
`tasks`, `transactions`, `vault_docs`, `wallets`.

### El hallazgo que lo hace fácil

**Ninguna tabla de hermes tiene `user_id`, `owner_id` ni FK a `auth.users`.**
Hermes no usa Supabase Auth. Todo `auth.users` es del portfolio, así que
llevárselo no le rompe nada a la otra app.

---

## La única complicación real: los UUID de auth cambian

`profiles.id` y `lesson_progress.user_id` son claves foráneas a `auth.users.id`.
En un proyecto nuevo, esos usuarios se crean con **UUID distintos**.

Esto **no** se resuelve copiando las filas tal cual: reventarían contra la FK.

La buena noticia: el login es **magic link, sin contraseñas**. No hay hashes que
migrar. Los usuarios simplemente vuelven a entrar y se crean solos.

**Estrategia:** re-llavear por email.

1. Cada usuario entra al proyecto nuevo → `handle_new_user()` le crea su fila en
   `profiles` con el UUID nuevo y rol `waitlist`.
2. Se restauran rol, progreso y sesiones **buscando por email**, no por UUID.

Con 2 usuarios y 3 filas de progreso, esto es un puñado de `update`.

---

## Hueco conocido: `waitlist` no tiene migración

`supabase/migrations/` **no incluye** la creación de `public.waitlist`. La primera
migración (`20260715190000_profiles.sql`) ya la referencia como existente. Se
creó fuera del repo.

Sin ese archivo, el proyecto nuevo no se puede levantar desde migraciones.
La Fase 1 lo resuelve sacando el DDL real, no adivinándolo.

Estructura observada (de la spec de PostgREST):

```
id                     uuid, primary key
email                  text, UNIQUE   (el código usa on_conflict=email)
locale                 text
source                 text
full_name              text
welcome_email_sent_at  timestamptz
created_at             timestamptz
```

---

## Antes de empezar

- [ ] La factura de Evelyn **no ha sido enviada todavía**, o ya se resolvió por
      completo. No hagas esto con un pago en vuelo.
- [ ] Tienes a mano las credenciales de Resend (SMTP y API key).
- [ ] Docker corriendo, si vas a usar `supabase db dump` (opcional).
- [ ] Avisa a Andrés (`andrescbc4@gmail.com`) que va a tener que volver a entrar.

---

## Fase 1 — Sacar el esquema real del proyecto viejo

**No reconstruyas el DDL de memoria.** Sácalo de la base.

### Opción A — CLI (necesita Docker corriendo)

```bash
supabase db dump --linked -f schema-viejo.sql --schema public
```

Del archivo resultante, extrae únicamente los bloques de `waitlist`, `profiles`,
`lesson_progress`, `mentoring_sessions` y `session_actions`.

### Opción B — SQL editor (sin Docker)

Pega esto en el SQL editor del proyecto viejo para ver la definición exacta de
`waitlist`, que es la única que no está en el repo:

```sql
select
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
from information_schema.columns c
where c.table_schema = 'public' and c.table_name = 'waitlist'
order by c.ordinal_position;

-- Restricciones (PK, UNIQUE, CHECK)
select con.conname, pg_get_constraintdef(con.oid)
from pg_constraint con
join pg_class rel on rel.oid = con.conrelid
join pg_namespace ns on ns.oid = rel.relnamespace
where ns.nspname = 'public' and rel.relname = 'waitlist';

-- Policies de RLS
select policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'waitlist';
```

### Resultado de la fase

Un archivo nuevo en el repo:

```
supabase/migrations/20260715180000_waitlist.sql
```

Con timestamp **anterior** a `20260715190000_profiles.sql`, porque `profiles`
tiene una FK hacia `waitlist` y el orden importa.

---

## Fase 2 — Crear el proyecto nuevo

1. https://supabase.com/dashboard → **New project**
2. Nombre: `rulocode-portfolio` (algo que no se confunda con hermes)
3. Región: **West US (Oregon)**, la misma que hermes — tus usuarios están en
   LatAm y ya sabes que la latencia funciona
4. Guarda la contraseña de la base en tu gestor de contraseñas
5. Anota el nuevo `project ref`

### Aplicar el esquema

Ahora sí, desde cero y con el CLI funcionando, porque el historial del proyecto
nuevo está vacío:

```bash
# Desanclar del viejo
rm -rf supabase/.temp

supabase link --project-ref <REF_NUEVO>
supabase db push          # aplica las 8 migraciones en orden
supabase migration list   # local y remoto deben coincidir en todo
```

Las 8 migraciones son:

```
20260715180000_waitlist.sql          ← nueva, de la Fase 1
20260715190000_profiles.sql
20260715190100_lesson_progress.sql
20260715210000_waitlist_full_name.sql
20260726120000_admin_role.sql
20260726190000_mentoring_sessions.sql
20260727210000_session_status.sql
20260819120000_enrollments.sql       ← nunca se aplicó al viejo
```

> **Esto es lo que se gana con la separación.** En el proyecto nuevo `db push`
> funciona, y de aquí en adelante nunca más hay que pegar SQL a mano.

---

## Fase 3 — Configurar Auth en el proyecto nuevo

Un proyecto nuevo **no hereda nada de esto**. Si te lo saltas, los magic links
no llegan.

- [ ] **SMTP** → `Authentication → Emails → SMTP Settings`. Vuelve a poner
      Resend. Sin esto, Supabase usa su SMTP por defecto, con un límite de envíos
      tan bajo que en la práctica no sirve.
- [ ] **Redirect URLs** → `Authentication → URL Configuration`. Agrega:
      - `https://rulocode.com/**`
      - `http://localhost:3000/**`
      - la URL de previews de Vercel, si la usas
- [ ] **Site URL** → `https://rulocode.com`
- [ ] **Plantilla del magic link** → si la personalizaste, cópiala del viejo.

---

## Fase 4 — Mover los datos (21 filas)

### 4.1 — Tablas sin dependencia de auth

`waitlist`, `mentoring_sessions` y `session_actions` **no** referencian
`auth.users`. Se copian tal cual, con sus UUID originales.

Exporta del viejo (SQL editor, `Download CSV`) e importa en el nuevo. O genera
los `insert` con:

```sql
-- En el proyecto VIEJO. Repite por tabla.
select 'insert into public.waitlist (id,email,locale,source,full_name,welcome_email_sent_at,created_at) values ('
  || quote_literal(id::text) || '::uuid,'
  || quote_literal(email) || ','
  || quote_nullable(locale) || ','
  || quote_nullable(source) || ','
  || quote_nullable(full_name) || ','
  || coalesce(quote_literal(welcome_email_sent_at::text)||'::timestamptz','null') || ','
  || quote_literal(created_at::text) || '::timestamptz);'
from public.waitlist;
```

Orden de inserción (respeta las FK):

1. `waitlist`
2. `mentoring_sessions`
3. `session_actions` (depende de `mentoring_sessions`)

### 4.2 — Recrear los usuarios

Cada uno entra a `https://rulocode.com/es/login` (o localhost, si aún no
cambiaste producción) con su correo y abre el magic link. Eso dispara
`handle_new_user()` y crea su `profiles` con UUID nuevo.

- `rulocode7@gmail.com`
- `andrescbc4@gmail.com`

### 4.3 — Restaurar roles por email

```sql
-- En el proyecto NUEVO, después de que ambos hayan entrado.
update public.profiles set role = 'admin'
where lower(email) = 'rulocode7@gmail.com';

-- andrescbc4@gmail.com se queda en 'waitlist': es su rol actual,
-- así que no hay nada que restaurar.

update public.profiles set full_name = 'Andres Bajonero'
where lower(email) = 'andrescbc4@gmail.com' and full_name is null;
```

### 4.4 — Restaurar el progreso de lecciones

Las 3 filas de `lesson_progress` están llaveadas por el UUID viejo. Se
re-llavean por email:

```sql
-- En el proyecto NUEVO. Reemplaza <slug> y las fechas con lo que exportaste
-- de la tabla vieja (select user_id, lesson_slug, completed_at ...).
insert into public.lesson_progress (user_id, lesson_slug, completed_at)
select p.id, '<slug>', '<completed_at>'::timestamptz
from public.profiles p
where lower(p.email) = '<email-del-dueño>'
on conflict (user_id, lesson_slug) do nothing;
```

Exporta primero del viejo, cruzando UUID → email:

```sql
-- En el proyecto VIEJO
select pr.email, lp.lesson_slug, lp.completed_at
from public.lesson_progress lp
join public.profiles pr on pr.id = lp.user_id
order by pr.email, lp.lesson_slug;
```

---

## Fase 5 — Repuntar la aplicación

Del proyecto nuevo, `Settings → API`, saca la URL y las llaves.

### Local — `.env.local`

```
SUPABASE_URL=https://<REF_NUEVO>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
NEXT_PUBLIC_SUPABASE_URL=https://<REF_NUEVO>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### Vercel — `Settings → Environment Variables`

Las mismas cuatro. **Redeploy después**, o siguen valiendo las viejas.

> Esta es la trampa que ya te mordió con Resend: la app compila perfecto sin
> variables correctas y solo falla cuando alguien intenta usarla.

### `.mcp.json`

Cambia el `project_ref` al nuevo y genera un token de management del proyecto
nuevo. (El archivo está gitignored — verificado.)

### Otros

- [ ] `scripts/backfill-welcome-emails.ts` usa las mismas env vars, no necesita
      cambios de código.

---

## Fase 6 — Verificar antes de tocar hermes

**No borres nada del proyecto viejo hasta que todo esto pase.**

- [ ] `supabase migration list` muestra las 8 migraciones alineadas
- [ ] Login con magic link funciona en producción
- [ ] `/dashboard` carga y muestra la Semana 0
- [ ] Marcar una lección como completada persiste tras recargar
- [ ] `/dashboard/admin` carga con tu cuenta admin
- [ ] El roster muestra los 4 registros de waitlist
- [ ] Las 2 sesiones de mentoría y sus 10 accionables aparecen en la ficha de Evelyn
- [ ] Un registro nuevo en el formulario de waitlist inserta fila **y** manda correo
- [ ] La tabla `enrollments` existe (no existía en el viejo)

**Deja el proyecto viejo intacto una semana.** Es tu rollback: si algo falla,
revertir es volver a poner las 4 env vars anteriores y hacer redeploy.

---

## Fase 7 — Limpiar hermes os

> ⛔ **Destructivo e irreversible.** Solo después de que la Fase 6 pase entera y
> haya pasado la semana de gracia. Saca un backup del proyecto viejo antes
> (`Database → Backups`).

```sql
-- 1. El trigger sobre auth.users (primero: depende de la función)
drop trigger if exists on_auth_user_created on auth.users;

-- 2. Tablas, en orden inverso a sus dependencias
drop table if exists public.session_actions;
drop table if exists public.mentoring_sessions;
drop table if exists public.lesson_progress;
drop table if exists public.profiles;      -- FK → waitlist, va antes que ella
drop table if exists public.waitlist;

-- 3. Funciones del portfolio
drop function if exists private.handle_new_user();
drop function if exists private.guard_profile_role();
drop function if exists private.is_admin();
drop function if exists private.touch_mentoring_session();

-- 4. El schema `private`, SOLO si quedó vacío.
--    Revisa primero — si hermes puso algo ahí, no lo borres.
select p.proname
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'private';
-- Si no devuelve nada:
-- drop schema if exists private;

-- 5. Historial de migraciones del portfolio
delete from supabase_migrations.schema_migrations
where version in (
  '20260715190000','20260715190100','20260715210000',
  '20260726120000','20260726190000','20260727210000'
);
```

### Los usuarios de auth

Hermes no usa Supabase Auth (ninguna de sus tablas referencia `auth.users`), así
que los 2 usuarios se pueden borrar desde
`Authentication → Users` del proyecto viejo.

### Verificar que hermes quedó bien

- [ ] `supabase migration list` desde el repo de hermes muestra `001`–`023` sin
      entradas ajenas
- [ ] Hermes os arranca y funciona igual que antes
- [ ] `select tablename from pg_tables where schemaname='public'` no lista
      ninguna tabla del portfolio

---

## Rollback

**Antes de la Fase 7** es barato: pon las 4 env vars viejas en Vercel y en
`.env.local`, redeploy, y `supabase link` de vuelta al ref viejo. Los datos
nunca se movieron, se copiaron.

**Después de la Fase 7** solo queda el backup del proyecto viejo. Por eso la
semana de gracia no es opcional.

---

## Resumen del esfuerzo

| Fase | Tiempo estimado | Riesgo |
|---|---|---|
| 1 · Sacar el DDL real | 20 min | ninguno (solo lectura) |
| 2 · Proyecto nuevo + migraciones | 15 min | bajo |
| 3 · Auth y SMTP | 20 min | medio (si se olvida, no llegan correos) |
| 4 · Mover 21 filas | 30 min | bajo |
| 5 · Repuntar la app | 15 min | medio (env vars en Vercel) |
| 6 · Verificar | 30 min | — |
| 7 · Limpiar hermes | 15 min | **alto, irreversible** |

Unas 2h30 de trabajo, más una semana de espera antes de la Fase 7.
