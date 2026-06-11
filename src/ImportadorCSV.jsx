// ============================================================
// IMPORTADOR CSV - PRONÓSTICOS DESDE GOOGLE SHEETS
// Archivo: ImportadorCSV.jsx
// Uso: Solo para el administrador, importación única
// ============================================================
// CONFIGURACIÓN: Pon las mismas credenciales que en Mundial2026App.jsx
// ============================================================

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bogdzfxngqxglwbmknpp.supabase.co";              // <-- CAMBIAR
const SUPABASE_ANON_KEY = "sb_publishable_zpIEYYN9X14VcH9LuympjQ_VbfWdgBp";   // <-- CAMBIAR

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// MAPA: encabezado del CSV → equipos local vs visita
// Formato esperado en el CSV: "Mexico vs. Sudafrica", "Corea del sur vs Rep.Checa", etc.
// Agrega aquí cualquier variación que tenga tu planilla
// ============================================================
const MAPA_PARTIDOS = {
  // Grupo A
  "mexico vs. sudafrica":         { local: "México",         visita: "Sudáfrica" },
  "corea del sur vs rep.checa":   { local: "Corea del Sur",  visita: "Chequia" },
  "corea del sur vs. rep.checa":  { local: "Corea del Sur",  visita: "Chequia" },
  "rep.checa vs sudafrica":       { local: "Chequia",        visita: "Sudáfrica" },
  "rep.checa vs. sudafrica":      { local: "Chequia",        visita: "Sudáfrica" },
  "mexico vs corea del sur":      { local: "México",         visita: "Corea del Sur" },
  "mexico vs. corea del sur":     { local: "México",         visita: "Corea del Sur" },
  "chequia vs sudafrica":         { local: "Chequia",        visita: "Sudáfrica" },
  "sudafrica vs corea del sur":   { local: "Sudáfrica",      visita: "Corea del Sur" },
  "chequia vs mexico":            { local: "Chequia",        visita: "México" },
  // Grupo B
  "canada vs. bosnia herz":       { local: "Canadá",         visita: "Bosnia y Herz." },
  "canada vs bosnia herz":        { local: "Canadá",         visita: "Bosnia y Herz." },
  "usa vs. paraguay":             { local: "Estados Unidos", visita: "Paraguay" },
  "usa vs paraguay":              { local: "Estados Unidos", visita: "Paraguay" },
  "qatar vs. suiza":              { local: "Qatar",          visita: "Suiza" },
  "qatar vs suiza":               { local: "Qatar",          visita: "Suiza" },
  "suiza vs. bosnia herz":        { local: "Suiza",          visita: "Bosnia y Herz." },
  "canada vs. qatar":             { local: "Canadá",         visita: "Qatar" },
  // Grupo C
  "brasil vs marruecos":          { local: "Brasil",         visita: "Marruecos" },
  "brasil vs. marruecos":         { local: "Brasil",         visita: "Marruecos" },
  "haiti vs escocia":             { local: "Haití",          visita: "Escocia" },
  "haiti vs. escocia":            { local: "Haití",          visita: "Escocia" },
  // Grupo D
  "australia vs turquia":         { local: "Australia",      visita: "Turquía" },
  "australia vs. turquia":        { local: "Australia",      visita: "Turquía" },
  // Grupo E
  "alemania vs curazao":          { local: "Alemania",       visita: "Curazao" },
  "alemania vs. curazao":         { local: "Alemania",       visita: "Curazao" },
  "paises bajos vs japon":        { local: "Países Bajos",   visita: "Japón" },
  "paises bajos vs. japon":       { local: "Países Bajos",   visita: "Japón" },
  "costa de marfil vs ecuador":   { local: "Costa de Marfil",visita: "Ecuador" },
  "costa de marfil vs. ecuador":  { local: "Costa de Marfil",visita: "Ecuador" },
  "suecia vs tunez":              { local: "Suecia",         visita: "Túnez" },
  "suecia vs. tunez":             { local: "Suecia",         visita: "Túnez" },
};

// Normalizar texto para comparación (sin tildes, minúsculas, sin puntos extra)
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Parsear CSV simple (maneja comas dentro de comillas)
function parsearCSV(texto) {
  const lineas = texto.trim().split("\n");
  const resultado = [];
  for (const linea of lineas) {
    const cols = [];
    let dentro = false, campo = "";
    for (let i = 0; i < linea.length; i++) {
      const c = linea[i];
      if (c === '"') { dentro = !dentro; }
      else if (c === "," && !dentro) { cols.push(campo.trim()); campo = ""; }
      else { campo += c; }
    }
    cols.push(campo.trim());
    resultado.push(cols);
  }
  return resultado;
}

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0f1e; color: #e8eaf0; font-family: 'Inter', system-ui, sans-serif; min-height: 100vh; padding: 2rem 1rem; }
  h1 { font-size: 1.6rem; color: #ffd600; margin-bottom: 0.25rem; }
  h2 { font-size: 1.1rem; color: #ffd600; margin-bottom: 0.75rem; }
  p { color: #8b99b5; font-size: 0.88rem; line-height: 1.5; }
  .wrap { max-width: 820px; margin: 0 auto; }
  .card { background: #111827; border: 1px solid #1e2a42; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.25rem; }
  .steps { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .step { padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: #1a2236; border: 1px solid #1e2a42; color: #8b99b5; }
  .step.active { background: #ffd600; color: #000; border-color: #ffd600; }
  .step.done { background: #00c853; color: #000; border-color: #00c853; }
  .drop-zone {
    border: 2px dashed #1e2a42; border-radius: 10px; padding: 2.5rem;
    text-align: center; cursor: pointer; transition: all 0.2s; margin: 1rem 0;
  }
  .drop-zone:hover, .drop-zone.drag { border-color: #ffd600; background: rgba(255,214,0,0.04); }
  .drop-zone input { display: none; }
  .drop-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
  .btn { padding: 0.65rem 1.4rem; border-radius: 8px; font-size: 0.9rem; font-weight: 700; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; }
  .btn-primary { background: #ffd600; color: #000; }
  .btn-primary:hover { background: #ffe033; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-outline { background: transparent; border: 1px solid #1e2a42; color: #e8eaf0; }
  .btn-outline:hover { border-color: #8b99b5; }
  .btn-danger { background: #d32f2f; color: #fff; }
  .table-wrap { overflow-x: auto; margin-top: 1rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
  th { padding: 0.5rem 0.75rem; color: #8b99b5; font-size: 0.75rem; border-bottom: 1px solid #1e2a42; text-align: left; white-space: nowrap; }
  td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #1e2a42; }
  tr:last-child td { border-bottom: none; }
  .tag { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
  .tag-ok { background: rgba(0,200,83,0.15); color: #00c853; border: 1px solid #00c853; }
  .tag-warn { background: rgba(255,214,0,0.15); color: #ffd600; border: 1px solid #ffd600; }
  .tag-err { background: rgba(211,47,47,0.15); color: #ef5350; border: 1px solid #ef5350; }
  .tag-L { background: rgba(0,200,83,0.15); color: #00c853; }
  .tag-E { background: rgba(255,214,0,0.15); color: #ffd600; }
  .tag-V { background: rgba(41,121,255,0.15); color: #2979ff; }
  .progress-bar { background: #1a2236; border-radius: 6px; height: 10px; margin: 0.5rem 0; overflow: hidden; }
  .progress-fill { height: 100%; background: #ffd600; border-radius: 6px; transition: width 0.3s; }
  .log { background: #0d1525; border: 1px solid #1e2a42; border-radius: 6px; padding: 1rem; max-height: 280px; overflow-y: auto; font-size: 0.78rem; font-family: monospace; }
  .log-line { padding: 0.15rem 0; border-bottom: 1px solid #0f1a2e; }
  .log-ok { color: #00c853; }
  .log-warn { color: #ffd600; }
  .log-err { color: #ef5350; }
  .log-info { color: #8b99b5; }
  .resumen-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.75rem; margin-top: 1rem; }
  .resumen-item { background: #1a2236; border-radius: 8px; padding: 0.85rem; text-align: center; }
  .resumen-num { font-size: 1.8rem; font-weight: 700; color: #ffd600; }
  .resumen-label { font-size: 0.75rem; color: #8b99b5; margin-top: 0.25rem; }
  .alert { padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; }
  .alert-info { background: rgba(41,121,255,0.1); border: 1px solid #2979ff; color: #90caf9; }
  .alert-warn { background: rgba(255,214,0,0.1); border: 1px solid #ffd600; color: #fff59d; }
  .alert-ok { background: rgba(0,200,83,0.1); border: 1px solid #00c853; color: #a5d6a7; }
`;

export default function ImportadorCSV() {
  const [paso, setPaso] = useState(1); // 1: subir, 2: previsualizar, 3: importando, 4: listo
  const [drag, setDrag] = useState(false);
  const [filas, setFilas] = useState([]);         // datos parseados del CSV
  const [encabezados, setEncabezados] = useState([]); // columnas del CSV
  const [preview, setPreview] = useState([]);     // datos procesados listos para importar
  const [warnings, setWarnings] = useState([]);   // columnas/usuarios no reconocidos
  const [progreso, setProgreso] = useState(0);
  const [logs, setLogs] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [partidosDB, setPartidosDB] = useState([]);
  const [perfilesDB, setPerfilesDB] = useState([]);
  const [cargandoDB, setCargandoDB] = useState(false);

  function addLog(tipo, msg) {
    setLogs(prev => [...prev, { tipo, msg }]);
  }

  // Cargar datos de Supabase para mapear
  async function cargarDB() {
    setCargandoDB(true);
    const [{ data: partidos }, { data: perfiles }] = await Promise.all([
      supabase.from("partidos").select(`
        id, numero_fecha, grupo_id, ronda,
        equipo_local:equipo_local_id(nombre),
        equipo_visita:equipo_visita_id(nombre)
      `).eq("ronda", "grupos"),
      supabase.from("profiles").select("id, username"),
    ]);
    setPartidosDB(partidos || []);
    setPerfilesDB(perfiles || []);
    setCargandoDB(false);
    return { partidos: partidos || [], perfiles: perfiles || [] };
  }

  function procesarCSV(texto) {
    const filas = parsearCSV(texto);
    if (filas.length < 2) { alert("El CSV parece estar vacío."); return; }

    const encabezados = filas[0];
    setEncabezados(encabezados);
    setFilas(filas.slice(1));
    return { encabezados, filas: filas.slice(1) };
  }

  async function handleArchivo(file) {
    if (!file) return;
    const texto = await file.text();
    const csv = procesarCSV(texto);
    if (!csv) return;

    const { partidos, perfiles } = await cargarDB();
    procesarDatos(csv.encabezados, csv.filas, partidos, perfiles);
    setPaso(2);
  }

  function procesarDatos(headers, rows, partidos, perfiles) {
    const warns = [];
    const processed = [];

    // Identificar columna de username y puntos
    const colUsername = headers.findIndex(h =>
      normalizar(h).includes("nombre") || normalizar(h).includes("usuario") || normalizar(h) === "nombre de usuario"
    );
    const colPuntos = headers.findIndex(h => normalizar(h).includes("punto"));

    if (colUsername === -1) {
      warns.push({ tipo: "err", msg: "No se encontró columna de nombre de usuario. Asegúrate que se llame 'Nombre de usuario'." });
    }

    // Mapear columnas de partidos
    const colsPartido = [];
    for (let i = 0; i < headers.length; i++) {
      if (i === colUsername || i === colPuntos) continue;
      const hNorm = normalizar(headers[i]);
      if (!hNorm || hNorm.length < 3) continue;

      // Buscar en MAPA_PARTIDOS primero
      let equipos = null;
      for (const [key, val] of Object.entries(MAPA_PARTIDOS)) {
        if (normalizar(key) === hNorm) { equipos = val; break; }
      }

      // Si no está en el mapa, intentar buscar por nombres en la DB
      if (!equipos) {
        // intentar parsear "X vs Y" o "X vs. Y"
        const match = hNorm.match(/^(.+?)\s+vs\.?\s+(.+)$/);
        if (match) {
          const loc = match[1].trim();
          const vis = match[2].trim();
          // buscar en partidos de la DB
          const partido = partidos.find(p => {
            const ln = normalizar(p.equipo_local?.nombre || "");
            const vn = normalizar(p.equipo_visita?.nombre || "");
            return (ln.includes(loc) || loc.includes(ln.substring(0,4))) &&
                   (vn.includes(vis) || vis.includes(vn.substring(0,4)));
          });
          if (partido) {
            equipos = { local: partido.equipo_local?.nombre, visita: partido.equipo_visita?.nombre };
          }
        }
      }

      if (equipos) {
        // Encontrar el partido en la DB
        const partido = partidos.find(p =>
          normalizar(p.equipo_local?.nombre || "") === normalizar(equipos.local) &&
          normalizar(p.equipo_visita?.nombre || "") === normalizar(equipos.visita)
        );
        if (partido) {
          colsPartido.push({ col: i, header: headers[i], equipos, partidoId: partido.id });
        } else {
          warns.push({ tipo: "warn", msg: `Columna "${headers[i]}": Partidos encontrados en mapa pero no en la base de datos.` });
        }
      } else {
        warns.push({ tipo: "warn", msg: `Columna "${headers[i]}": No se reconoció como partido (se omitirá).` });
      }
    }

    // Procesar filas de usuarios
    for (const fila of rows) {
      const username = fila[colUsername]?.trim();
      if (!username) continue;

      const perfil = perfiles.find(p =>
        normalizar(p.username) === normalizar(username)
      );

      const pronosticosUsuario = [];
      for (const col of colsPartido) {
        const val = fila[col.col]?.trim().toUpperCase();
        if (val === "L" || val === "E" || val === "V") {
          pronosticosUsuario.push({ partidoId: col.partidoId, pronostico: val, header: col.header });
        }
      }

      processed.push({
        username,
        userId: perfil?.id || null,
        encontrado: !!perfil,
        pronosticos: pronosticosUsuario,
      });

      if (!perfil) {
        warns.push({ tipo: "warn", msg: `Usuario "${username}" no está registrado en la app (sus pronósticos se omitirán).` });
      }
    }

    setPreview(processed);
    setWarnings(warns);
  }

  async function ejecutarImportacion() {
    setPaso(3);
    setLogs([]);
    setProgreso(0);

    const usuariosValidos = preview.filter(u => u.encontrado && u.pronosticos.length > 0);
    let totalInsertados = 0, totalOmitidos = 0, totalErrores = 0;
    let procesados = 0;

    addLog("info", `Iniciando importación de ${usuariosValidos.length} usuarios...`);

    for (const usuario of usuariosValidos) {
      addLog("info", `Procesando: ${usuario.username} (${usuario.pronosticos.length} pronósticos)`);

      const registros = usuario.pronosticos.map(p => ({
        user_id: usuario.userId,
        partido_id: p.partidoId,
        pronostico: p.pronostico,
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("pronosticos")
        .upsert(registros, { onConflict: "user_id,partido_id", ignoreDuplicates: false });

      if (error) {
        addLog("err", `  ❌ Error en ${usuario.username}: ${error.message}`);
        totalErrores += usuario.pronosticos.length;
      } else {
        addLog("ok", `  ✅ ${usuario.username}: ${usuario.pronosticos.length} pronósticos importados`);
        totalInsertados += usuario.pronosticos.length;
      }

      procesados++;
      setProgreso(Math.round((procesados / usuariosValidos.length) * 100));
    }

    addLog("info", "─────────────────────────────");
    addLog("ok", `✅ Importación completada`);
    addLog("ok", `   ${totalInsertados} pronósticos insertados/actualizados`);
    if (totalErrores > 0) addLog("err", `   ${totalErrores} errores`);

    setResumen({ totalInsertados, totalOmitidos, totalErrores, usuarios: usuariosValidos.length });
    setPaso(4);
  }

  const usuariosValidos = preview.filter(u => u.encontrado);
  const usuariosNoEncontrados = preview.filter(u => !u.encontrado);
  const totalPronosticos = usuariosValidos.reduce((s, u) => s + u.pronosticos.length, 0);

  return (
    <>
      <style>{CSS}</style>
      <div className="wrap">
        <div className="card">
          <h1>⚽ Importador de Pronósticos</h1>
          <p>Migra los pronósticos desde Google Sheets a la base de datos del Mundial 2026.</p>
          <div className="steps" style={{ marginTop: "1rem" }}>
            {["1. Subir CSV", "2. Previsualizar", "3. Importar", "4. Listo"].map((s, i) => (
              <div key={i} className={`step ${paso === i+1 ? "active" : paso > i+1 ? "done" : ""}`}>
                {paso > i+1 ? "✓ " : ""}{s}
              </div>
            ))}
          </div>
        </div>

        {/* PASO 1: SUBIR */}
        {paso === 1 && (
          <div className="card">
            <h2>Paso 1 — Exportar y subir el CSV</h2>
            <div className="alert alert-info">
              <strong>📋 Cómo exportar desde Google Sheets:</strong><br />
              Archivo → Descargar → Valores separados por comas (.csv)
            </div>
            <div className="alert alert-warn">
              <strong>⚠️ Formato esperado:</strong> La primera fila debe tener los encabezados. La columna con el nombre del usuario debe llamarse <strong>"Nombre de usuario"</strong>. Las columnas de partidos deben tener formato <strong>"Equipo1 vs. Equipo2"</strong>. Los valores deben ser <strong>L, E o V</strong>.
            </div>
            <div
              className={`drop-zone ${drag ? "drag" : ""}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); handleArchivo(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById("csv-input").click()}
            >
              <input id="csv-input" type="file" accept=".csv" onChange={e => handleArchivo(e.target.files[0])} />
              <div className="drop-icon">📂</div>
              <p style={{ color: "#e8eaf0", fontSize: "1rem", marginBottom: "0.25rem" }}>
                {cargandoDB ? "Cargando datos de Supabase..." : "Arrastra el CSV aquí o haz click para seleccionar"}
              </p>
              <p>Solo archivos .csv</p>
            </div>
          </div>
        )}

        {/* PASO 2: PREVISUALIZAR */}
        {paso === 2 && (
          <div>
            {warnings.length > 0 && (
              <div className="card">
                <h2>⚠️ Advertencias ({warnings.length})</h2>
                <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                  {warnings.map((w, i) => (
                    <div key={i} style={{ padding: "0.3rem 0", fontSize: "0.82rem", color: w.tipo === "err" ? "#ef5350" : "#fff59d", borderBottom: "1px solid #1e2a42" }}>
                      {w.tipo === "err" ? "❌" : "⚠️"} {w.msg}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <h2>Resumen de importación</h2>
              <div className="resumen-grid">
                <div className="resumen-item">
                  <div className="resumen-num">{preview.length}</div>
                  <div className="resumen-label">Usuarios en CSV</div>
                </div>
                <div className="resumen-item">
                  <div className="resumen-num" style={{ color: "#00c853" }}>{usuariosValidos.length}</div>
                  <div className="resumen-label">Usuarios encontrados</div>
                </div>
                <div className="resumen-item">
                  <div className="resumen-num" style={{ color: usuariosNoEncontrados.length > 0 ? "#ffd600" : "#00c853" }}>{usuariosNoEncontrados.length}</div>
                  <div className="resumen-label">No encontrados</div>
                </div>
                <div className="resumen-item">
                  <div className="resumen-num">{totalPronosticos}</div>
                  <div className="resumen-label">Pronósticos a importar</div>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Vista previa de usuarios</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Usuario CSV</th>
                      <th>Estado</th>
                      <th>Pronósticos</th>
                      <th>Muestra</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((u, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{u.username}</td>
                        <td>
                          <span className={`tag ${u.encontrado ? "tag-ok" : "tag-err"}`}>
                            {u.encontrado ? "✓ Encontrado" : "✗ No encontrado"}
                          </span>
                        </td>
                        <td>{u.pronosticos.length}</td>
                        <td>
                          {u.pronosticos.slice(0, 4).map((p, j) => (
                            <span key={j} className={`tag tag-${p.pronostico}`} style={{ marginRight: "3px" }}>
                              {p.pronostico}
                            </span>
                          ))}
                          {u.pronosticos.length > 4 && <span style={{ color: "#8b99b5", fontSize: "0.75rem" }}>+{u.pronosticos.length - 4}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {usuariosNoEncontrados.length > 0 && (
              <div className="card">
                <div className="alert alert-warn">
                  <strong>Usuarios no encontrados en la app:</strong> {usuariosNoEncontrados.map(u => u.username).join(", ")}<br />
                  Estos usuarios deben registrarse primero en la app y luego puedes volver a importar.
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button className="btn btn-outline" onClick={() => setPaso(1)}>← Volver</button>
              <button
                className="btn btn-primary"
                onClick={ejecutarImportacion}
                disabled={usuariosValidos.length === 0 || totalPronosticos === 0}
              >
                ✅ Importar {totalPronosticos} pronósticos de {usuariosValidos.length} usuarios
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: IMPORTANDO */}
        {paso === 3 && (
          <div className="card">
            <h2>Importando...</h2>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progreso}%` }} />
            </div>
            <p style={{ marginBottom: "0.75rem" }}>{progreso}% completado</p>
            <div className="log">
              {logs.map((l, i) => (
                <div key={i} className={`log-line log-${l.tipo}`}>{l.msg}</div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 4: LISTO */}
        {paso === 4 && resumen && (
          <div className="card">
            <div className="alert alert-ok">
              <strong>✅ ¡Importación completada!</strong>
            </div>
            <div className="resumen-grid">
              <div className="resumen-item">
                <div className="resumen-num" style={{ color: "#00c853" }}>{resumen.totalInsertados}</div>
                <div className="resumen-label">Pronósticos importados</div>
              </div>
              <div className="resumen-item">
                <div className="resumen-num">{resumen.usuarios}</div>
                <div className="resumen-label">Usuarios procesados</div>
              </div>
              {resumen.totalErrores > 0 && (
                <div className="resumen-item">
                  <div className="resumen-num" style={{ color: "#ef5350" }}>{resumen.totalErrores}</div>
                  <div className="resumen-label">Errores</div>
                </div>
              )}
            </div>
            <div className="log" style={{ marginTop: "1rem" }}>
              {logs.map((l, i) => (
                <div key={i} className={`log-line log-${l.tipo}`}>{l.msg}</div>
              ))}
            </div>
            <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
              <button className="btn btn-outline" onClick={() => { setPaso(1); setLogs([]); setPreview([]); setResumen(null); }}>
                Importar otro CSV
              </button>
              <button className="btn btn-primary" onClick={() => window.location.href = "/"}>
                Ir a la App
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
