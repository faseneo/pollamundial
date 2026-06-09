# ⚽ Mundial 2026 - App de Pronósticos
## Guía de Configuración Completa

---

## 1. CREAR EL PROYECTO EN SUPABASE (5 minutos)

1. Ve a **https://supabase.com** → "Start your project" → inicia sesión con GitHub o email
2. Haz click en **"New project"**
3. Completa:
   - **Name**: mundial2026
   - **Database Password**: elige una contraseña segura (guárdala)
   - **Region**: elige la más cercana (South America - São Paulo)
4. Espera 2 minutos mientras se crea el proyecto

---

## 2. CREAR LA BASE DE DATOS

1. En tu proyecto Supabase → menu izquierdo → **SQL Editor**
2. Click en **"New query"**
3. Copia todo el contenido del archivo **`supabase_schema.sql`**
4. Pégalo en el editor y haz click en **"Run"** (o F5)
5. Deberías ver: "Success. No rows returned"

✅ Esto crea:
- Todas las tablas (grupos, equipos, partidos, pronósticos, etc.)
- Los 12 grupos del Mundial
- Los 48 equipos con sus banderas
- Los 72 partidos de la fase de grupos con fechas, ciudades y estadios
- Las reglas de seguridad (RLS) para proteger los datos

---

## 3. OBTENER LAS CREDENCIALES

1. En Supabase → menu izquierdo → **Settings** → **API**
2. Copia estos dos valores:
   - **Project URL**: algo como `https://abcdefgh.supabase.co`
   - **anon public key**: una clave larga que empieza con `eyJ...`

VITE_SUPABASE_URL=https://bogdzfxngqxglwbmknpp.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_zpIEYYN9X14VcH9LuympjQ_VbfWdgBp
---

## 4. CONFIGURAR LA APP REACT

### Opción A: Con Vite (recomendado)
```bash
npm create vite@latest mundial2026 -- --template react
cd mundial2026
npm install
npm install @supabase/supabase-js
```

Copia el archivo `Mundial2026App.jsx` a la carpeta `src/`

Edita `src/App.jsx`:
```jsx
import Mundial2026App from './Mundial2026App'
export default function App() {
  return <Mundial2026App />
}
```

### Opción B: Con Create React App
```bash
npx create-react-app mundial2026
cd mundial2026
npm install @supabase/supabase-js
```

---

## 5. CONFIGURAR LAS CREDENCIALES EN EL CÓDIGO

Abre `Mundial2026App.jsx` y edita las líneas 12-13:

```javascript
const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";  // ← pega aquí tu URL
const SUPABASE_ANON_KEY = "TU_ANON_KEY_AQUI";             // ← pega aquí tu clave
```

---

## 6. EJECUTAR LA APP

```bash
npm run dev
```

Abre el navegador en **http://localhost:5173**

---

## 7. CONFIGURAR EL PRIMER ADMINISTRADOR

1. Regístrate en la app normalmente (crea una cuenta)
2. Vuelve a Supabase → **SQL Editor** → "New query"
3. Ejecuta (reemplaza 'tu_usuario' con el username que registraste):
```sql
UPDATE public.profiles SET is_admin = TRUE WHERE username = 'tu_usuario';
```
4. Recarga la app → aparecerá la pestaña "⚙️ Admin"

---

## 8. HABILITAR EMAIL DE CONFIRMACIÓN (opcional)

Por defecto Supabase pide confirmar email. Para desarrollo:
- Supabase → **Authentication** → **Providers** → Email
- Desactiva "Confirm email" para pruebas rápidas

---

## 9. PUBLICAR LA APP (opcional, gratis)

### Con Vercel (recomendado):
```bash
npm install -g vercel
vercel
```
Sigue las instrucciones. Vercel detecta Vite automáticamente.

### Con Netlify:
1. Ve a **netlify.com** → "Add new site" → "Import an existing project"
2. Conecta tu repositorio GitHub

---

## FUNCIONALIDADES DEL PANEL ADMIN

Una vez que seas admin, en la pestaña **⚙️ Admin** puedes:

- **Resultados**: Ingresar los goles de cada partido → los puntos se calculan automáticamente
- **Abrir/Cerrar pronósticos**: Controlar cuándo los usuarios pueden pronosticar
- **Campeón**: Ver todos los pronósticos de campeón de los usuarios
- **Equipos 2ª Ronda**: Marcar qué equipos clasificaron a la Ronda de 32

---

## CRONOGRAMA DE ACCIONES ADMIN

| Cuándo | Acción |
|--------|--------|
| Antes del primer partido | Cerrar pronósticos del campeón |
| 15 min antes de cada partido | Cerrar pronósticos de ese partido |
| Después de cada partido | Ingresar resultado → puntos automáticos |
| Al terminar la fase de grupos | Marcar equipos clasificados a 2ª Ronda |

---

## PREGUNTAS FRECUENTES

**¿Cuántos usuarios puede tener?**
El plan gratuito de Supabase soporta hasta 50,000 usuarios activos/mes, más que suficiente.

**¿Se pierden los datos?**
No, todo está guardado en la base de datos de Supabase que persiste aunque cierres el navegador.

**¿Cómo agrego partidos de 2ª ronda?**
Cuando se definan los cruces, el admin puede insertarlos directamente en Supabase SQL Editor:
```sql
INSERT INTO public.partidos (numero_fecha, grupo_id, equipo_local_id, equipo_visita_id, fecha_hora, ciudad, estadio, ronda)
VALUES (1, NULL, ID_LOCAL, ID_VISITA, '2026-06-28 23:00:00+00', 'Los Ángeles', 'Estadio Los Ángeles', 'segunda_ronda');
```

**¿Cómo reseteo todos los pronósticos?**
```sql
DELETE FROM public.pronosticos;
UPDATE public.profiles SET total_points = 0;
```
