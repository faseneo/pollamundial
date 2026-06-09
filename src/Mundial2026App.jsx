// ============================================================
// MUNDIAL 2026 - APP DE PRONÓSTICOS
// Stack: React + Supabase
// Archivo: Mundial2026App.jsx
// ============================================================
// CONFIGURACIÓN: Reemplaza estos valores con los de tu proyecto Supabase
// Dashboard > Settings > API > Project URL y anon key
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bogdzfxngqxglwbmknpp.supabase.co";              // <-- CAMBIAR
const SUPABASE_ANON_KEY = "sb_publishable_zpIEYYN9X14VcH9LuympjQ_VbfWdgBp";   // <-- CAMBIAR

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// UTILIDADES
// ============================================================
const GRUPOS = ["A","B","C","D","E","F","G","H","I","J","K","L"];

function formatFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", timeZone: "America/Santiago"
  });
}

function calcularResultado(gl, gv) {
  if (gl === null || gv === null) return null;
  if (gl > gv) return "L";
  if (gl < gv) return "V";
  return "E";
}

// ============================================================
// ESTILOS GLOBALES (inyectados via <style>)
// ============================================================
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --verde: #00c853;
    --verde2: #1b5e20;
    --oro: #ffd600;
    --rojo: #d32f2f;
    --azul: #0d47a1;
    --fondo: #0a0f1e;
    --card: #111827;
    --card2: #1a2236;
    --texto: #e8eaf0;
    --muted: #8b99b5;
    --borde: #1e2a42;
    --L: #00c853;
    --E: #ffd600;
    --V: #2979ff;
    --r: 10px;
  }

  body { background: var(--fondo); color: var(--texto); font-family: 'Inter', sans-serif; min-height: 100vh; }

  h1, h2, h3 { font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; }

  /* Layout */
  .app { min-height: 100vh; display: flex; flex-direction: column; }

  /* Header */
  .header {
    background: linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%);
    border-bottom: 2px solid var(--oro);
    padding: 0 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100; height: 60px;
  }
  .header-logo { display: flex; align-items: center; gap: 0.6rem; }
  .header-logo h1 { font-size: 1.4rem; color: var(--oro); }
  .header-logo span { font-size: 1.6rem; }
  .header-right { display: flex; align-items: center; gap: 1rem; }
  .header-user { font-size: 0.8rem; color: var(--muted); }
  .btn-sm {
    padding: 0.35rem 0.9rem; border-radius: 6px; font-size: 0.8rem;
    cursor: pointer; border: none; font-family: inherit; font-weight: 600;
    transition: all 0.2s;
  }
  .btn-outline { background: transparent; border: 1px solid var(--borde); color: var(--texto); }
  .btn-outline:hover { border-color: var(--muted); }
  .btn-primary { background: var(--oro); color: #000; }
  .btn-primary:hover { background: #ffe033; }
  .btn-danger { background: var(--rojo); color: #fff; }
  .btn-danger:hover { background: #b71c1c; }
  .btn-verde { background: var(--verde); color: #000; }
  .btn-verde:hover { background: #00e676; }

  /* Nav */
  .nav {
    background: var(--card); border-bottom: 1px solid var(--borde);
    display: flex; padding: 0 1.5rem; gap: 0.25rem; overflow-x: auto;
  }
  .nav-btn {
    padding: 0.7rem 1rem; background: transparent; border: none;
    color: var(--muted); font-family: inherit; font-size: 0.85rem;
    cursor: pointer; border-bottom: 2px solid transparent;
    transition: all 0.2s; white-space: nowrap; font-weight: 500;
  }
  .nav-btn.active { color: var(--oro); border-bottom-color: var(--oro); }
  .nav-btn:hover:not(.active) { color: var(--texto); }

  /* Contenido */
  .content { flex: 1; padding: 1.5rem; max-width: 900px; margin: 0 auto; width: 100%; }

  /* Cards */
  .card { background: var(--card); border: 1px solid var(--borde); border-radius: var(--r); padding: 1.25rem; margin-bottom: 1rem; }
  .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .card-title { font-size: 1.1rem; color: var(--oro); }

  /* Partido card */
  .partido {
    background: var(--card); border: 1px solid var(--borde); border-radius: var(--r);
    padding: 1rem 1rem 0.85rem; margin-bottom: 0.75rem; transition: border-color 0.2s;
  }
  .partido:hover { border-color: #2a3a5c; }
  .partido-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
  .partido-meta { font-size: 0.72rem; color: var(--muted); }
  .partido-meta span { margin-right: 0.6rem; }
  .partido-equipos {
    display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
    gap: 0.5rem; margin-bottom: 0.75rem;
  }
  .equipo-local { text-align: center; display: flex; flex-direction: column; align-items: flex-end; }
  .equipo-visita { text-align: center; display: flex; flex-direction: column; align-items: flex-start; }
  .equipo-bloque { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; width: 90px; }
  .equipo-circulo {
    width: 66px; height: 50px; border-radius: 10px;
    background: var(--card2); border: 2px solid var(--borde);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
  }
  .equipo-nombre { font-size: 0.78rem; font-weight: 700; color: var(--texto); text-align: center; letter-spacing: 0.5px; text-transform: uppercase; }
  .partido-centro { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; min-width: 90px; }
  .partido-grupo-tag { font-size: 0.68rem; color: var(--muted); background: var(--card2); padding: 0.1rem 0.5rem; border-radius: 4px; border: 1px solid var(--borde); }
  .partido-fecha-box {
    background: var(--card2); border: 1px solid var(--borde); border-radius: 8px;
    padding: 0.35rem 0.6rem; text-align: center; min-width: 88px;
  }
  .partido-fecha-dia { font-size: 0.72rem; color: var(--muted); }
  .partido-fecha-hora { font-size: 1rem; font-family: 'Bebas Neue', sans-serif; color: var(--texto); letter-spacing: 1px; }
  .partido-estadio { font-size: 0.68rem; color: var(--muted); text-align: center; }
  .resultado-marcador { font-size: 1.6rem; font-family: 'Bebas Neue', sans-serif; color: var(--oro); text-align: center; letter-spacing: 2px; }

  /* Botones pronóstico */
  .pronostico-btns { display: flex; gap: 0.5rem; justify-content: center; }
  .btn-pro {
    padding: 0.45rem 1.2rem; border-radius: 6px; font-size: 0.85rem; font-weight: 700;
    cursor: pointer; border: 2px solid transparent; font-family: inherit; transition: all 0.2s;
    min-width: 60px;
  }
  .btn-pro.L { border-color: var(--L); color: var(--L); background: transparent; }
  .btn-pro.L.sel { background: var(--L); color: #000; }
  .btn-pro.E { border-color: var(--E); color: var(--E); background: transparent; }
  .btn-pro.E.sel { background: var(--E); color: #000; }
  .btn-pro.V { border-color: var(--V); color: var(--V); background: transparent; }
  .btn-pro.V.sel { background: var(--V); color: #fff; }
  .btn-pro:disabled { opacity: 0.4; cursor: not-allowed; }

  /* Badge resultado */
  .badge-res {
    display: inline-block; padding: 0.2rem 0.6rem; border-radius: 4px;
    font-size: 0.75rem; font-weight: 700;
  }
  .badge-L { background: rgba(0,200,83,0.15); color: var(--L); border: 1px solid var(--L); }
  .badge-E { background: rgba(255,214,0,0.15); color: var(--E); border: 1px solid var(--E); }
  .badge-V { background: rgba(41,121,255,0.15); color: var(--V); border: 1px solid var(--V); }
  .badge-ok { background: rgba(0,200,83,0.2); color: var(--L); border: 1px solid var(--L); font-size: 0.7rem; }
  .badge-fail { background: rgba(211,47,47,0.2); color: #ef5350; border: 1px solid #ef5350; font-size: 0.7rem; }

  /* Grupo header */
  .grupo-header {
    display: flex; align-items: center; gap: 0.75rem; margin: 1.5rem 0 0.75rem;
    padding-bottom: 0.5rem; border-bottom: 1px solid var(--borde);
  }
  .grupo-tag {
    background: var(--oro); color: #000; font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem; padding: 0.2rem 0.6rem; border-radius: 5px; min-width: 32px; text-align: center;
  }
  .jornada-tag {
    font-size: 0.75rem; color: var(--muted); background: var(--card2);
    padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px solid var(--borde);
  }

  /* Auth */
  .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--fondo); padding: 1rem; }
  .auth-card { background: var(--card); border: 1px solid var(--borde); border-radius: 16px; padding: 2rem; width: 100%; max-width: 420px; }
  .auth-logo { text-align: center; margin-bottom: 1.5rem; }
  .auth-logo h1 { font-size: 2.2rem; color: var(--oro); }
  .auth-logo p { color: var(--muted); font-size: 0.85rem; }
  .form-group { margin-bottom: 1rem; }
  .form-label { font-size: 0.8rem; color: var(--muted); margin-bottom: 0.35rem; display: block; font-weight: 500; }
  .form-input {
    width: 100%; padding: 0.65rem 0.85rem; background: var(--card2); border: 1px solid var(--borde);
    border-radius: 8px; color: var(--texto); font-family: inherit; font-size: 0.9rem;
    transition: border-color 0.2s; outline: none;
  }
  .form-input:focus { border-color: var(--oro); }
  .btn-full { width: 100%; padding: 0.75rem; border-radius: 8px; font-size: 0.95rem; font-weight: 700; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; }
  .auth-switch { text-align: center; margin-top: 1rem; font-size: 0.85rem; color: var(--muted); }
  .link-btn { background: none; border: none; color: var(--oro); cursor: pointer; font-family: inherit; font-size: inherit; text-decoration: underline; }
  .error-msg { background: rgba(211,47,47,0.15); border: 1px solid #d32f2f; color: #ef9a9a; padding: 0.6rem 0.85rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1rem; }
  .success-msg { background: rgba(0,200,83,0.15); border: 1px solid var(--verde); color: #a5d6a7; padding: 0.6rem 0.85rem; border-radius: 6px; font-size: 0.85rem; margin-bottom: 1rem; }

  /* Tabla de posiciones */
  .tabla { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  .tabla th { text-align: left; padding: 0.5rem 0.75rem; color: var(--muted); font-weight: 600; font-size: 0.75rem; border-bottom: 1px solid var(--borde); }
  .tabla td { padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--borde); }
  .tabla tr:last-child td { border-bottom: none; }
  .tabla tr:hover td { background: var(--card2); }
  .rank-num { font-family: 'Bebas Neue', sans-serif; font-size: 1rem; color: var(--muted); }
  .rank-1 { color: var(--oro); }
  .rank-2 { color: #90caf9; }
  .rank-3 { color: #bcaaa4; }

  /* Admin */
  .admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .input-goles { width: 50px; padding: 0.35rem 0.5rem; background: var(--card2); border: 1px solid var(--borde); border-radius: 6px; color: var(--texto); font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem; text-align: center; outline: none; }
  .input-goles:focus { border-color: var(--oro); }

  /* Toggle grupo */
  .grupos-tabs { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem; }
  .grupo-tab { padding: 0.3rem 0.7rem; border-radius: 5px; font-size: 0.8rem; font-weight: 700; cursor: pointer; border: 1px solid var(--borde); background: transparent; color: var(--muted); font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px; transition: all 0.2s; }
  .grupo-tab.active { background: var(--oro); color: #000; border-color: var(--oro); }
  .grupo-tab:hover:not(.active) { border-color: var(--muted); color: var(--texto); }

  /* Campeón */
  .campeon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.5rem; }
  .equipo-btn {
    padding: 0.6rem 0.5rem; border-radius: 8px; background: var(--card2); border: 1px solid var(--borde);
    color: var(--texto); cursor: pointer; font-family: inherit; font-size: 0.82rem; text-align: center;
    transition: all 0.2s; display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
  }
  .equipo-btn:hover { border-color: var(--muted); }
  .equipo-btn.sel { background: rgba(255,214,0,0.1); border-color: var(--oro); color: var(--oro); }
  .equipo-btn .flag { font-size: 1.5rem; }

  /* Spinner */
  .spinner { display: inline-block; width: 20px; height: 20px; border: 2px solid var(--borde); border-top-color: var(--oro); border-radius: 50%; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .center { text-align: center; }
  .mt-1 { margin-top: 0.5rem; }
  .mt-2 { margin-top: 1rem; }
  .flex-center { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
  .text-muted { color: var(--muted); font-size: 0.85rem; }
  .text-oro { color: var(--oro); }
  .separator { border: none; border-top: 1px solid var(--borde); margin: 1rem 0; }

  @media (max-width: 600px) {
    .content { padding: 1rem 0.75rem; }
    .header-logo h1 { font-size: 1.1rem; }
    .partido-equipos { gap: 0.5rem; }
    .equipo-nombre { font-size: 0.82rem; }
    .admin-grid { grid-template-columns: 1fr; }
  }
`;

// ============================================================
// COMPONENTE: LOGIN / REGISTRO
// ============================================================
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    onLogin(data.user);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    if (!username.trim()) { setError("El nombre de usuario es requerido."); setLoading(false); return; }
    const { data, error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { username: username.trim(), full_name: fullName.trim() } }
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.");
    setLoading(false);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: "3rem" }}>⚽</div>
          <h1>MUNDIAL 2026</h1>
          <p>Pronósticos USA • México • Canadá</p>
        </div>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        {!success && (
          <form onSubmit={mode === "login" ? handleLogin : handleRegister}>
            {mode === "register" && (
              <>
                <div className="form-group">
                  <label className="form-label">Nombre de usuario</label>
                  <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} required placeholder="ej: pele_pro" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre completo</label>
                  <input className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Opcional" />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="correo@ejemplo.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" minLength={6} />
            </div>
            <button className="btn-full btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : mode === "login" ? "Iniciar Sesión" : "Registrarse"}
            </button>
          </form>
        )}
        <div className="auth-switch">
          {mode === "login" ? (
            <>¿Sin cuenta? <button className="link-btn" onClick={() => { setMode("register"); setError(""); }}>Regístrate aquí</button></>
          ) : (
            <>¿Ya tienes cuenta? <button className="link-btn" onClick={() => { setMode("login"); setError(""); }}>Inicia sesión</button></>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE: TARJETA PARTIDO (con pronóstico)
// ============================================================
function PartidoCard({ partido, pronostico, onPronostico, mostrarResultado = false }) {
  const [saving, setSaving] = useState(false);
  const abierto = partido.pronostico_abierto && !partido.resultado_registrado;

  async function handlePro(tipo) {
    if (!abierto || saving) return;
    setSaving(true);
    await onPronostico(partido.id, tipo);
    setSaving(false);
  }

  const localNombre = partido.equipo_local?.nombre || "Local";
  const visitaNombre = partido.equipo_visita?.nombre || "Visita";

  // Mapa nombre → código ISO2 para banderas
  const ISO2 = {
    "México":"mx","Sudáfrica":"za","Corea del Sur":"kr","Chequia":"cz",
    "Canadá":"ca","Bosnia y Herz.":"ba","Qatar":"qa","Suiza":"ch",
    "Brasil":"br","Marruecos":"ma","Haití":"ht","Escocia":"gb-sct",
    "Estados Unidos":"us","Paraguay":"py","Australia":"au","Turquía":"tr",
    "Alemania":"de","Curazao":"cw","Costa de Marfil":"ci","Ecuador":"ec",
    "Países Bajos":"nl","Japón":"jp","Suecia":"se","Túnez":"tn",
    "Bélgica":"be","Egipto":"eg","Irán":"ir","Nueva Zelanda":"nz",
    "España":"es","Cabo Verde":"cv","Arabia Saudita":"sa","Uruguay":"uy",
    "Francia":"fr","Senegal":"sn","Iraq":"iq","Noruega":"no",
    "Argentina":"ar","Argelia":"dz","Austria":"at","Jordania":"jo",
    "Portugal":"pt","Congo DR":"cd","Uzbekistán":"uz","Colombia":"co",
    "Inglaterra":"gb-eng","Croacia":"hr","Ghana":"gh","Panamá":"pa",
  };

  const flagUrl = (nombre) => {
    const code = ISO2[nombre];
    if (!code) return null;
    return `https://flagcdn.com/64x48/${code}.png`;
  };

  // Nombre corto para mostrar
  const shortName = (nombre) => {
    const siglas = {
      "Estados Unidos":"USA","Países Bajos":"HOL","Arabia Saudita":"KSA",
      "Corea del Sur":"KOR","Nueva Zelanda":"NZL","Bosnia y Herz.":"BIH",
      "Costa de Marfil":"CIV","Congo DR":"COD","Cabo Verde":"CPV",
      "Sudáfrica":"RSA","Alemania":"GER","Francia":"FRA","Brasil":"BRA",
      "Argentina":"ARG","Portugal":"POR","España":"ESP","Inglaterra":"ENG",
      "México":"MEX","Canadá":"CAN","Japón":"JPN","Bélgica":"BEL",
      "Croacia":"CRO","Uruguay":"URU","Senegal":"SEN","Marruecos":"MAR",
      "Ecuador":"ECU","Suecia":"SWE","Noruega":"NOR","Austria":"AUT",
      "Suiza":"SUI","Turquía":"TUR","Australia":"AUS","Ghana":"GHA",
      "Escocia":"SCO","Haití":"HAI","Túnez":"TUN","Irán":"IRN",
      "Egipto":"EGY","Iraq":"IRQ","Jordania":"JOR","Argelia":"ALG",
      "Colombia":"COL","Uzbekistán":"UZB","Panamá":"PAN","Paraguay":"PAR",
      "Qatar":"QAT","Curazao":"CUW","Chequia":"CZE","Sudáfrica":"RSA",
    };
    return siglas[nombre] || nombre.substring(0, 3).toUpperCase();
  };

  const FlagCircle = ({ nombre }) => {
    const url = flagUrl(nombre);
    return (
      <div className="equipo-circulo">
        {url
          ? <img src={url} alt={nombre} style={{ width:"52px", height:"39px", borderRadius:"4px", objectFit:"cover" }} />
          : <span style={{ fontSize:"2rem" }}>🏳️</span>
        }
      </div>
    );
  };

  const d = new Date(partido.fecha_hora);
  const dia = d.toLocaleDateString("es-CL", { weekday:"short", day:"numeric", month:"short", timeZone:"America/Santiago" });
  const hora = d.toLocaleTimeString("es-CL", { hour:"2-digit", minute:"2-digit", timeZone:"America/Santiago" });

  return (
    <div className="partido">
      {/* Grupo tag arriba */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.5rem" }}>
        <span className="partido-grupo-tag">Grupo {GRUPOS[(partido.grupo_id || 1) - 1]}</span>
        {partido.resultado_registrado && (
          <span className={`badge-res badge-${partido.resultado}`}>
            {partido.resultado === "L" ? "Local" : partido.resultado === "E" ? "Empate" : "Visita"}
          </span>
        )}
      </div>

      {/* Equipos + centro */}
      <div className="partido-equipos">
        {/* Local */}
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <div className="equipo-bloque">
            <FlagCircle nombre={localNombre} />
            <span className="equipo-nombre">{shortName(localNombre)}</span>
          </div>
        </div>

        {/* Centro: fecha/hora o marcador */}
        <div className="partido-centro">
          {partido.resultado_registrado ? (
            <div className="resultado-marcador">{partido.goles_local} - {partido.goles_visita}</div>
          ) : (
            <div className="partido-fecha-box">
              <div className="partido-fecha-dia">{dia}</div>
              <div className="partido-fecha-hora">{hora} hs</div>
            </div>
          )}
          <div className="partido-estadio">🏟️ {partido.estadio}</div>
        </div>

        {/* Visita */}
        <div style={{ display:"flex", justifyContent:"flex-start" }}>
          <div className="equipo-bloque">
            <FlagCircle nombre={visitaNombre} />
            <span className="equipo-nombre">{shortName(visitaNombre)}</span>
          </div>
        </div>
      </div>

      {/* Botones pronóstico */}
      <div className="pronostico-btns">
        {[
          { tipo:"L", label:`${shortName(localNombre)} gana` },
          { tipo:"E", label:"Empate" },
          { tipo:"V", label:`${shortName(visitaNombre)} gana` },
        ].map(({ tipo, label }) => (
          <button
            key={tipo}
            className={`btn-pro ${tipo} ${pronostico === tipo ? "sel" : ""}`}
            onClick={() => handlePro(tipo)}
            disabled={!abierto || saving}
            title={label}
          >
            {saving && pronostico === tipo ? <span className="spinner" style={{ width:14, height:14 }} /> : tipo}
          </button>
        ))}
        {pronostico && partido.resultado_registrado && (
          <span className={`badge-res ${pronostico === partido.resultado ? "badge-ok" : "badge-fail"}`}>
            {pronostico === partido.resultado ? "✓ Acertaste" : "✗ Fallaste"}
          </span>
        )}
      </div>
      {!abierto && !partido.resultado_registrado && (
        <div className="text-muted center mt-1" style={{ fontSize:"0.75rem" }}>🔒 Pronósticos cerrados</div>
      )}
    </div>
  );
}

// ============================================================
// VISTA: PRONÓSTICOS (primera ronda)
// ============================================================
function VistaPrimera({ userId, partidos, equipos }) {
  const [pronosticos, setPronosticos] = useState({});
  const [grupoActivo, setGrupoActivo] = useState("A");

  useEffect(() => {
    cargarPronosticos();
  }, [userId]);

  async function cargarPronosticos() {
    const { data } = await supabase
      .from("pronosticos")
      .select("*")
      .eq("user_id", userId);
    if (data) {
      const map = {};
      data.forEach(p => { map[p.partido_id] = p.pronostico; });
      setPronosticos(map);
    }
  }

  async function handlePronostico(partidoId, tipo) {
    const { error } = await supabase.from("pronosticos").upsert(
      { user_id: userId, partido_id: partidoId, pronostico: tipo, updated_at: new Date().toISOString() },
      { onConflict: "user_id,partido_id" }
    );
    if (!error) {
      setPronosticos(prev => ({ ...prev, [partidoId]: tipo }));
    }
  }

  const grupoId = GRUPOS.indexOf(grupoActivo) + 1;
  const partidosGrupo = partidos
    .filter(p => p.grupo_id === grupoId && p.ronda === "grupos")
    .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));

  const porJornada = { 1: [], 2: [], 3: [] };
  partidosGrupo.forEach(p => {
    if (porJornada[p.numero_fecha]) porJornada[p.numero_fecha].push(p);
  });

  return (
    <div>
      <div className="grupos-tabs">
        {GRUPOS.map(g => (
          <button key={g} className={`grupo-tab ${grupoActivo === g ? "active" : ""}`} onClick={() => setGrupoActivo(g)}>
            {g}
          </button>
        ))}
      </div>
      {[1, 2, 3].map(j => (
        porJornada[j].length > 0 && (
          <div key={j}>
            <div className="grupo-header">
              <span className="grupo-tag">Grupo {grupoActivo}</span>
              <span className="jornada-tag">Jornada {j}</span>
            </div>
            {porJornada[j].map(p => (
              <PartidoCard
                key={p.id}
                partido={p}
                pronostico={pronosticos[p.id]}
                onPronostico={handlePronostico}
              />
            ))}
          </div>
        )
      ))}
      {partidosGrupo.length === 0 && (
        <div className="card center text-muted">No hay partidos en este grupo.</div>
      )}
    </div>
  );
}

// ============================================================
// VISTA: SEGUNDA RONDA (Ronda de 32)
// ============================================================
function VistaSegundaRonda({ userId, partidos }) {
  const [pronosticos, setPronosticos] = useState({});

  useEffect(() => {
    supabase.from("pronosticos").select("*").eq("user_id", userId).then(({ data }) => {
      if (data) {
        const map = {};
        data.forEach(p => { map[p.partido_id] = p.pronostico; });
        setPronosticos(map);
      }
    });
  }, [userId]);

  async function handlePronostico(partidoId, tipo) {
    const { error } = await supabase.from("pronosticos").upsert(
      { user_id: userId, partido_id: partidoId, pronostico: tipo, updated_at: new Date().toISOString() },
      { onConflict: "user_id,partido_id" }
    );
    if (!error) setPronosticos(prev => ({ ...prev, [partidoId]: tipo }));
  }

  const partidosSR = partidos
    .filter(p => p.ronda === "segunda_ronda")
    .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));

  if (partidosSR.length === 0) {
    return (
      <div className="card center">
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
        <h3 className="text-oro">Segunda Ronda no disponible aún</h3>
        <p className="text-muted mt-1">Los partidos de segunda ronda se habilitarán al finalizar la fase de grupos y clasificarse los equipos.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grupo-header">
        <span className="grupo-tag" style={{ background: "var(--azul)", color: "#fff" }}>32avos</span>
        <span className="jornada-tag">Ronda de 32</span>
      </div>
      {partidosSR.map(p => (
        <PartidoCard key={p.id} partido={p} pronostico={pronosticos[p.id]} onPronostico={handlePronostico} />
      ))}
    </div>
  );
}

// ============================================================
// VISTA: PRONÓSTICO CAMPEÓN
// ============================================================
function VistaCampeon({ userId, equipos }) {
  const [seleccion, setSeleccion] = useState(null);
  const [guardado, setGuardado] = useState(null);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({ abierto: true });

  useEffect(() => {
    supabase.from("pronostico_campeon").select("equipo_id").eq("user_id", userId).maybeSingle()
      .then(({ data }) => { if (data) { setSeleccion(data.equipo_id); setGuardado(data.equipo_id); } });
    supabase.from("configuracion").select("*").eq("clave", "pronostico_campeon_abierto").maybeSingle()
      .then(({ data }) => { if (data) setConfig({ abierto: data.valor === "true" }); });
  }, [userId]);

  async function guardar() {
    if (!seleccion || saving) return;
    setSaving(true);
    await supabase.from("pronostico_campeon").upsert(
      { user_id: userId, equipo_id: seleccion, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    setGuardado(seleccion);
    setSaving(false);
  }

  const equipoGuardado = equipos.find(e => e.id === guardado);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🏆 ¿Quién ganará el Mundial?</h2>
          {!config.abierto && <span className="jornada-tag" style={{ color: "var(--rojo)" }}>🔒 Cerrado</span>}
        </div>
        {equipoGuardado && (
          <div className="success-msg" style={{ marginBottom: "1rem" }}>
            Tu pronóstico actual: {equipoGuardado.bandera_emoji} <strong>{equipoGuardado.nombre}</strong>
          </div>
        )}
        {config.abierto && (
          <>
            <p className="text-muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
              Selecciona el equipo que crees que ganará el Mundial 2026.
            </p>
            <div className="campeon-grid">
              {equipos.map(eq => (
                <button
                  key={eq.id}
                  className={`equipo-btn ${seleccion === eq.id ? "sel" : ""}`}
                  onClick={() => setSeleccion(eq.id)}
                >
                  <span className="flag">{eq.bandera_emoji}</span>
                  <span>{eq.nombre}</span>
                </button>
              ))}
            </div>
            <div className="mt-2">
              <button
                className="btn-full btn-primary"
                onClick={guardar}
                disabled={!seleccion || saving || seleccion === guardado}
              >
                {saving ? <span className="spinner" /> : guardado ? "Actualizar pronóstico" : "Guardar pronóstico"}
              </button>
            </div>
          </>
        )}
        {!config.abierto && (
          <p className="text-muted center">Los pronósticos del campeón ya están cerrados.</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// VISTA: TABLA DE POSICIONES / RANKING
// ============================================================
function VistaRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("username, full_name, total_points")
      .order("total_points", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setRanking(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">🏅 Tabla de posiciones</h2>
          <button className="btn-sm btn-outline" onClick={() => window.location.reload()}>↺ Actualizar</button>
        </div>
        {loading ? (
          <div className="flex-center" style={{ padding: "2rem" }}><span className="spinner" /></div>
        ) : ranking.length === 0 ? (
          <p className="text-muted center">Aún no hay puntos registrados.</p>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th style={{ textAlign: "right" }}>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((u, i) => (
                <tr key={u.username}>
                  <td><span className={`rank-num ${i === 0 ? "rank-1" : i === 1 ? "rank-2" : i === 2 ? "rank-3" : ""}`}>{i + 1}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.username}</div>
                    {u.full_name && <div className="text-muted" style={{ fontSize: "0.75rem" }}>{u.full_name}</div>}
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "var(--oro)" }}>{u.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================================
// VISTA: ADMINISTRADOR
// ============================================================
function VistaAdmin({ partidos, equipos, onRefresh }) {
  const [grupoActivo, setGrupoActivo] = useState("A");
  const [goles, setGoles] = useState({});
  const [saving, setSaving] = useState(null);
  const [msg, setMsg] = useState("");
  const [tabAdmin, setTabAdmin] = useState("resultados");
  const [campeonInfo, setCampeonInfo] = useState([]);
  const [nuevoEquipo, setNuevoEquipo] = useState(null);

  const grupoId = GRUPOS.indexOf(grupoActivo) + 1;
  const partidosGrupo = partidos
    .filter(p => p.grupo_id === grupoId && p.ronda === "grupos")
    .sort((a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora));

  async function guardarResultado(partido) {
    const gl = parseInt(goles[`${partido.id}_l`] ?? (partido.goles_local ?? ""));
    const gv = parseInt(goles[`${partido.id}_v`] ?? (partido.goles_visita ?? ""));
    if (isNaN(gl) || isNaN(gv)) { setMsg("⚠️ Ingresa los goles de ambos equipos."); return; }
    setSaving(partido.id);
    setMsg("");
    const resultado = calcularResultado(gl, gv);

    // 1. Guardar resultado del partido
    const { error: errPartido } = await supabase.from("partidos").update({
      goles_local: gl, goles_visita: gv,
      resultado, resultado_registrado: true
    }).eq("id", partido.id);

    if (errPartido) {
      setMsg("❌ Error al guardar el resultado: " + errPartido.message);
      setSaving(null);
      return;
    }

    // 2. Obtener todos los pronósticos de este partido
    const { data: pronos, error: errPronos } = await supabase
      .from("pronosticos")
      .select("id, user_id, pronostico")
      .eq("partido_id", partido.id);

    if (errPronos || !pronos) {
      setMsg(`✅ Resultado guardado. (Sin pronósticos aún)`);
      setSaving(null);
      onRefresh();
      return;
    }

    // 3. Actualizar cada pronóstico: marcar correcto/incorrecto y puntos
    const actualizaciones = pronos.map(p => ({
      id: p.id,
      user_id: p.user_id,
      partido_id: partido.id,
      pronostico: p.pronostico,
      es_correcto: p.pronostico === resultado,
      puntos_ganados: p.pronostico === resultado ? 1 : 0,
      updated_at: new Date().toISOString()
    }));

    if (actualizaciones.length > 0) {
      await supabase.from("pronosticos").upsert(actualizaciones, { onConflict: "id" });
    }

    // 4. Recalcular total de puntos para cada usuario afectado
    const usuariosAfectados = [...new Set(pronos.map(p => p.user_id))];
    for (const uid of usuariosAfectados) {
      const { data: totalData } = await supabase
        .from("pronosticos")
        .select("puntos_ganados")
        .eq("user_id", uid);
      const total = (totalData || []).reduce((sum, r) => sum + (r.puntos_ganados || 0), 0);
      await supabase.from("profiles").update({ total_points: total }).eq("id", uid);
    }

    const acertaron = actualizaciones.filter(p => p.es_correcto).length;
    setMsg(`✅ Resultado guardado: ${partido.equipo_local?.nombre} ${gl}-${gv} ${partido.equipo_visita?.nombre} — ${acertaron} de ${pronos.length} usuarios acertaron`);
    setSaving(null);
    onRefresh();
  }

  async function cargarCampeon() {
    const { data } = await supabase
      .from("pronostico_campeon")
      .select("*, equipo:equipo_id(nombre, bandera_emoji), user:user_id(username)")
      .order("created_at");
    setCampeonInfo(data || []);
  }

  async function togglePeriodo(partido) {
    await supabase.from("partidos").update({ pronostico_abierto: !partido.pronostico_abierto }).eq("id", partido.id);
    onRefresh();
  }

  useEffect(() => {
    if (tabAdmin === "campeon") cargarCampeon();
  }, [tabAdmin]);

  return (
    <div>
      <div className="card" style={{ marginBottom: "0.5rem" }}>
        <h2 className="card-title" style={{ marginBottom: "0.75rem" }}>⚙️ Panel Administrador</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["resultados", "campeon", "equipos"].map(t => (
            <button key={t} className={`btn-sm ${tabAdmin === t ? "btn-primary" : "btn-outline"}`} onClick={() => setTabAdmin(t)}>
              {t === "resultados" ? "📋 Resultados" : t === "campeon" ? "🏆 Campeón" : "🌍 Equipos 2ª Ronda"}
            </button>
          ))}
        </div>
      </div>

      {msg && <div className={msg.startsWith("✅") ? "success-msg" : "error-msg"}>{msg}</div>}

      {tabAdmin === "resultados" && (
        <>
          <div className="grupos-tabs">
            {GRUPOS.map(g => (
              <button key={g} className={`grupo-tab ${grupoActivo === g ? "active" : ""}`} onClick={() => setGrupoActivo(g)}>{g}</button>
            ))}
          </div>
          {partidosGrupo.map(p => (
            <div key={p.id} className="partido">
              <div className="partido-meta" style={{ marginBottom: "0.75rem" }}>
                <span>📅 {formatFecha(p.fecha_hora)}</span>
                <span>📍 {p.ciudad}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ fontWeight: 600 }}>{p.equipo_local?.bandera_emoji} {p.equipo_local?.nombre}</span>
                <input
                  className="input-goles"
                  type="number" min="0" max="99"
                  defaultValue={p.goles_local ?? ""}
                  onChange={e => setGoles(prev => ({ ...prev, [`${p.id}_l`]: e.target.value }))}
                  placeholder="0"
                />
                <span style={{ color: "var(--muted)" }}>-</span>
                <input
                  className="input-goles"
                  type="number" min="0" max="99"
                  defaultValue={p.goles_visita ?? ""}
                  onChange={e => setGoles(prev => ({ ...prev, [`${p.id}_v`]: e.target.value }))}
                  placeholder="0"
                />
                <span style={{ fontWeight: 600 }}>{p.equipo_visita?.bandera_emoji} {p.equipo_visita?.nombre}</span>
                {p.resultado_registrado && <span className={`badge-res badge-${p.resultado}`}>{p.resultado}</span>}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  className="btn-sm btn-verde"
                  onClick={() => guardarResultado(p)}
                  disabled={saving === p.id}
                >
                  {saving === p.id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : "Guardar resultado"}
                </button>
                <button className="btn-sm btn-outline" onClick={() => togglePeriodo(p)}>
                  {p.pronostico_abierto ? "🔒 Cerrar pronósticos" : "🔓 Abrir pronósticos"}
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {tabAdmin === "campeon" && (
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--oro)" }}>Pronósticos del campeón</h3>
          {campeonInfo.length === 0 ? (
            <p className="text-muted">Aún no hay pronósticos registrados.</p>
          ) : (
            <table className="tabla">
              <thead><tr><th>Usuario</th><th>Equipo elegido</th></tr></thead>
              <tbody>
                {campeonInfo.map(c => (
                  <tr key={c.id}>
                    <td>{c.user?.username}</td>
                    <td>{c.equipo?.bandera_emoji} {c.equipo?.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tabAdmin === "equipos" && (
        <div className="card">
          <h3 style={{ marginBottom: "1rem", color: "var(--oro)" }}>Equipos clasificados a 2ª Ronda</h3>
          <p className="text-muted" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
            Marca los equipos que clasificaron (top 2 de cada grupo + 8 mejores terceros).
          </p>
          <div className="campeon-grid">
            {equipos.map(eq => (
              <button
                key={eq.id}
                className={`equipo-btn ${eq.pasa_segunda_ronda ? "sel" : ""}`}
                onClick={async () => {
                  await supabase.from("equipos").update({ pasa_segunda_ronda: !eq.pasa_segunda_ronda }).eq("id", eq.id);
                  onRefresh();
                }}
              >
                <span className="flag">{eq.bandera_emoji}</span>
                <span>{eq.nombre}</span>
                {eq.pasa_segunda_ronda && <span style={{ fontSize: "0.7rem", color: "var(--verde)" }}>✓ Clasif.</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// APP PRINCIPAL
// ============================================================
export default function Mundial2026App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("primera");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) inicializar(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) inicializar(session.user.id);
      else { setProfile(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const inicializar = useCallback(async (userId) => {
    setLoading(true);
    const [{ data: prof }, { data: eqs }, { data: pts }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("equipos").select("*").order("id"),
      supabase.from("partidos").select(`
        *,
        equipo_local:equipo_local_id(id, nombre, bandera_emoji),
        equipo_visita:equipo_visita_id(id, nombre, bandera_emoji)
      `).order("fecha_hora"),
    ]);
    setProfile(prof);
    setEquipos(eqs || []);
    setPartidos(pts || []);
    setLoading(false);
  }, []);

  async function handleLogin(user) {
    await inicializar(user.id);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (!session && !loading) {
    return (
      <>
        <style>{CSS}</style>
        <AuthScreen onLogin={handleLogin} />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="auth-wrap">
          <div style={{ textAlign: "center" }}>
            <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
            <p className="text-muted mt-2">Cargando...</p>
          </div>
        </div>
      </>
    );
  }

  const tabs = [
    { id: "primera", label: "1ª Ronda" },
    { id: "segunda", label: "2ª Ronda" },
    { id: "campeon", label: "🏆 Campeón" },
    { id: "ranking", label: "📊 Ranking" },
    ...(profile?.is_admin ? [{ id: "admin", label: "⚙️ Admin" }] : []),
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <header className="header">
          <div className="header-logo">
            <span>⚽</span>
            <h1>MUNDIAL 2026</h1>
          </div>
          <div className="header-right">
            <span className="header-user">👤 {profile?.username}</span>
            <span style={{ color: "var(--oro)", fontFamily: "'Bebas Neue', sans-serif", fontSize: "1rem" }}>
              {profile?.total_points ?? 0} pts
            </span>
            <button className="btn-sm btn-outline" onClick={handleLogout}>Salir</button>
          </div>
        </header>
        <nav className="nav">
          {tabs.map(t => (
            <button key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <main className="content">
          {tab === "primera" && <VistaPrimera userId={session.user.id} partidos={partidos} equipos={equipos} />}
          {tab === "segunda" && <VistaSegundaRonda userId={session.user.id} partidos={partidos} />}
          {tab === "campeon" && <VistaCampeon userId={session.user.id} equipos={equipos} />}
          {tab === "ranking" && <VistaRanking />}
          {tab === "admin" && profile?.is_admin && (
            <VistaAdmin
              partidos={partidos}
              equipos={equipos}
              onRefresh={() => inicializar(session.user.id)}
            />
          )}
        </main>
      </div>
    </>
  );
}
