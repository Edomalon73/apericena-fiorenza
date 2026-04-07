// ============================================================
//  APERICENA FIORENZA — App React per StackBlitz
//  File: App.jsx  (sostituisci il contenuto di App.jsx)
//
//  IMPORTANTE: sostituisci SCRIPT_URL con il tuo URL Apps Script!
// ============================================================

import { useState, useEffect, useCallback } from "react";

// 🔴 CAMBIA QUESTO CON IL TUO URL APPS SCRIPT DOPO LA PUBBLICAZIONE
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzNJVTeG_nI5SEZlzu1hiGB3TNH1_NE-IuVuAUGsw3VYyp2D-84CJfWjcs02Y9OM_4n/exec";

const CATEGORIE = [
  { label: "🥂 Aperitivo",    value: "Aperitivo",      emoji: "🥂", color: "#f59e0b" },
  { label: "🍝 Primo",        value: "Primo",           emoji: "🍝", color: "#ef4444" },
  { label: "🥩 Secondo",      value: "Secondo",         emoji: "🥩", color: "#8b5cf6" },
  { label: "🥗 Contorno",     value: "Contorno",        emoji: "🥗", color: "#22c55e" },
  { label: "🎂 Dolce",        value: "Dolce",           emoji: "🎂", color: "#ec4899" },
  { label: "🍷 Vino e Bibite", value: "Vino e Bibite",  emoji: "🍷", color: "#3b82f6" },
];

// ---------- Helpers ----------

function api(params) {
  const url = new URL(SCRIPT_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return fetch(url.toString()).then(r => r.json());
}

function Bar({ label, value, max, color, emoji }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13, fontWeight: 600 }}>
        <span>{emoji} {label}</span>
        <span style={{ color }}>{value} {value === 1 ? "persona" : "persone"}</span>
      </div>
      <div style={{ background: "#ffffff22", borderRadius: 999, height: 10, overflow: "hidden" }}>
        <div
          style={{
            background: color,
            width: pct + "%",
            height: "100%",
            borderRadius: 999,
            transition: "width 0.8s cubic-bezier(.4,0,.2,1)"
          }}
        />
      </div>
    </div>
  );
}

function Confetti() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100 }}>
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: Math.random() * 100 + "%",
          top: "-20px",
          fontSize: 20,
          animation: `fall ${1.2 + Math.random()}s ease-in forwards`,
          animationDelay: Math.random() * 0.5 + "s"
        }}>
          {["🎉","✨","🥂","🍾","🎊"][i % 5]}
        </div>
      ))}
    </div>
  );
}

// ---------- Componente principale ----------

export default function App() {
  const [tab, setTab] = useState("form"); // "form" | "dashboard"
  const [dati, setDati] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(null);

  // form
  const [nome, setNome] = useState("");
  const [scelta, setScelta] = useState("");
  const [cosaPorta, setCosaPorta] = useState("");
  const [invio, setInvio] = useState(null); // null | "loading" | "ok" | "error"
  const [msgInvio, setMsgInvio] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchDati = useCallback(async () => {
    if (SCRIPT_URL === "INCOLLA_QUI_IL_TUO_URL_APPS_SCRIPT") {
      setDati({ partecipanti: [], totale: 0, conteggio: {}, aggiornato: null });
      setLoading(false);
      return;
    }
    try {
      const res = await api({ action: "read" });
      if (res.error) throw new Error(res.error);
      setDati(res);
      setErrore(null);
    } catch (e) {
      setErrore("Errore connessione: " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDati();
    const id = setInterval(fetchDati, 15000);
    return () => clearInterval(id);
  }, [fetchDati]);

  async function handleSubmit() {
    if (!nome.trim() || !scelta) return;
    setInvio("loading");
    try {
      const res = await api({ action: "write", nome: nome.trim(), scelta, cosa_porta: cosaPorta.trim() });
      if (res.error) throw new Error(res.error);
      setMsgInvio(res.azione === "aggiornato"
        ? `✅ La tua scelta è stata aggiornata, ${res.nome}!`
        : `🎉 Benvenuto/a ${res.nome}! Non vediamo l'ora!`);
      setInvio("ok");
      if (res.azione === "aggiunto") { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 2500); }
      await fetchDati();
      setTimeout(() => { setTab("dashboard"); setInvio(null); }, 2000);
    } catch (e) {
      setMsgInvio("❌ " + e.message);
      setInvio("error");
      setTimeout(() => setInvio(null), 3000);
    }
  }

  const totale = dati?.totale ?? 0;
  const conteggio = dati?.conteggio ?? {};
  const maxCat = Math.max(1, ...Object.values(conteggio));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a0a2e; font-family: 'Lato', sans-serif; color: #fff; min-height: 100vh; }
        @keyframes fall { to { transform: translateY(110vh) rotate(360deg); opacity: 0; } }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .page { animation: fadeIn .4s ease; }
        input, select, textarea { outline: none; }
        input::placeholder, textarea::placeholder { color: #ffffff55; }
      `}</style>

      {showConfetti && <Confetti />}

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
        padding: "28px 20px 20px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ fontSize: 48, lineHeight: 1, marginBottom: 6 }}>🍽️</div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(26px, 6vw, 40px)",
          fontWeight: 900,
          letterSpacing: 1,
          textShadow: "0 2px 20px #0008"
        }}>
          Apericena da Fiorenza
        </h1>
        <p style={{ fontSize: 14, opacity: 0.8, marginTop: 6 }}>
          Organizza la serata perfetta insieme ✨
        </p>

        {/* Badge partecipanti */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "#ffffff18",
          borderRadius: 999,
          padding: "6px 18px",
          marginTop: 14,
          fontSize: 15,
          fontWeight: 700,
          animation: "pulse 3s ease-in-out infinite"
        }}>
          👥 {totale} {totale === 1 ? "partecipante" : "partecipanti"}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 18 }}>
          {[["form","✍️ Iscriviti"], ["dashboard","📊 Dashboard"]].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 22px",
              borderRadius: 999,
              border: "2px solid " + (tab === t ? "#fff" : "#ffffff44"),
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#1a0a2e" : "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "all .2s"
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* === FORM TAB === */}
        {tab === "form" && (
          <div className="page">
            <div style={{
              background: "#ffffff0d",
              backdropFilter: "blur(10px)",
              borderRadius: 20,
              border: "1px solid #ffffff22",
              padding: 28
            }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 24 }}>
                Partecipa alla serata 🎉
              </h2>

              {/* Nome */}
              <label style={{ display: "block", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Il tuo nome *</div>
                <input
                  type="text"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Es. Mario Rossi"
                  style={{
                    width: "100%",
                    background: "#ffffff14",
                    border: "1.5px solid #ffffff33",
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontSize: 16,
                    color: "#fff",
                    transition: "border .2s"
                  }}
                  onFocus={e => e.target.style.borderColor = "#a78bfa"}
                  onBlur={e => e.target.style.borderColor = "#ffffff33"}
                />
              </label>

              {/* Categoria */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Cosa porti? *</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                  {CATEGORIE.map(c => (
                    <button key={c.value} onClick={() => setScelta(c.value)} style={{
                      padding: "12px 8px",
                      borderRadius: 14,
                      border: "2px solid " + (scelta === c.value ? c.color : "#ffffff22"),
                      background: scelta === c.value ? c.color + "33" : "#ffffff0a",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: scelta === c.value ? 700 : 400,
                      cursor: "pointer",
                      transition: "all .2s",
                      transform: scelta === c.value ? "scale(1.04)" : "none"
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 4 }}>{c.emoji}</div>
                      {c.label.replace(c.emoji + " ", "")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dettaglio cosa porta */}
              <label style={{ display: "block", marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.7, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Dettaglio (opzionale)</div>
                <textarea
                  value={cosaPorta}
                  onChange={e => setCosaPorta(e.target.value)}
                  placeholder="Es. Tiramisù della nonna, Prosecco Valdobbiadene..."
                  rows={2}
                  style={{
                    width: "100%",
                    background: "#ffffff14",
                    border: "1.5px solid #ffffff33",
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontSize: 15,
                    color: "#fff",
                    resize: "vertical"
                  }}
                />
              </label>

              {/* Messaggio di risposta */}
              {invio === "ok" && (
                <div style={{ background: "#22c55e22", border: "1px solid #22c55e55", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 14 }}>
                  {msgInvio}
                </div>
              )}
              {invio === "error" && (
                <div style={{ background: "#ef444422", border: "1px solid #ef444455", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 14 }}>
                  {msgInvio}
                </div>
              )}

              {/* Bottone */}
              <button
                onClick={handleSubmit}
                disabled={!nome.trim() || !scelta || invio === "loading"}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 14,
                  border: "none",
                  background: (!nome.trim() || !scelta || invio === "loading")
                    ? "#ffffff22"
                    : "linear-gradient(135deg, #a78bfa, #ec4899)",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: (!nome.trim() || !scelta || invio === "loading") ? "not-allowed" : "pointer",
                  transition: "all .2s",
                  letterSpacing: 0.5
                }}
              >
                {invio === "loading" ? "⏳ Invio in corso..." : "🎊 Confermo la mia partecipazione!"}
              </button>

              {SCRIPT_URL === "INCOLLA_QUI_IL_TUO_URL_APPS_SCRIPT" && (
                <div style={{ marginTop: 16, padding: 12, background: "#f59e0b22", border: "1px solid #f59e0b55", borderRadius: 10, fontSize: 13, color: "#fcd34d" }}>
                  ⚠️ <strong>Configura l'URL Apps Script!</strong> Apri App.jsx e sostituisci <code>SCRIPT_URL</code> con il tuo URL generato da Google Apps Script.
                </div>
              )}
            </div>
          </div>
        )}

        {/* === DASHBOARD TAB === */}
        {tab === "dashboard" && (
          <div className="page">

            {/* Contatore principale */}
            <div style={{
              background: "linear-gradient(135deg, #7c3aed22, #ec489922)",
              border: "1px solid #a78bfa44",
              borderRadius: 20,
              padding: 24,
              textAlign: "center",
              marginBottom: 20
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(52px, 12vw, 80px)",
                fontWeight: 900,
                lineHeight: 1,
                background: "linear-gradient(135deg, #a78bfa, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                {totale}
              </div>
              <div style={{ fontSize: 16, opacity: 0.8, marginTop: 6 }}>
                {totale === 0 ? "nessun partecipante ancora" : totale === 1 ? "partecipante confermato" : "partecipanti confermati"}
              </div>
              {dati?.aggiornato && (
                <div style={{ fontSize: 11, opacity: 0.4, marginTop: 8 }}>
                  aggiornato {new Date(dati.aggiornato).toLocaleTimeString("it-IT")}
                </div>
              )}
            </div>

            {/* Istogramma categorie */}
            <div style={{
              background: "#ffffff0d",
              border: "1px solid #ffffff1a",
              borderRadius: 20,
              padding: 24,
              marginBottom: 20
            }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 20 }}>
                📊 Cosa si porta
              </h3>
              {CATEGORIE.map(c => (
                <Bar
                  key={c.value}
                  label={c.value}
                  emoji={c.emoji}
                  value={conteggio[c.value] ?? 0}
                  max={maxCat}
                  color={c.color}
                />
              ))}
            </div>

            {/* Lista partecipanti */}
            <div style={{
              background: "#ffffff0d",
              border: "1px solid #ffffff1a",
              borderRadius: 20,
              padding: 24
            }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16 }}>
                👥 Chi partecipa
              </h3>

              {loading && <div style={{ opacity: 0.5, fontSize: 14 }}>Caricamento...</div>}
              {errore && <div style={{ color: "#f87171", fontSize: 14 }}>{errore}</div>}

              {!loading && dati?.partecipanti?.length === 0 && (
                <div style={{ opacity: 0.5, fontSize: 14, textAlign: "center", padding: 20 }}>
                  Ancora nessuno! Sii il primo a iscriverti 🎉
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {dati?.partecipanti?.map((p, i) => {
                  const cat = CATEGORIE.find(c => c.value === p.scelta) || {};
                  return (
                    <div key={i} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "#ffffff0a",
                      borderRadius: 12,
                      padding: "10px 14px",
                      border: "1px solid " + (cat.color || "#fff") + "33"
                    }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 999,
                        background: (cat.color || "#888") + "33",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        flexShrink: 0
                      }}>
                        {cat.emoji || "👤"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{p.nome}</div>
                        <div style={{ fontSize: 12, opacity: 0.6 }}>
                          {p.scelta}{p.cosa_porta ? " · " + p.cosa_porta : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aggiorna manuale */}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button onClick={() => { setLoading(true); fetchDati(); }} style={{
                background: "transparent",
                border: "1px solid #ffffff33",
                color: "#ffffff88",
                borderRadius: 999,
                padding: "8px 20px",
                fontSize: 13,
                cursor: "pointer"
              }}>
                🔄 Aggiorna ora
              </button>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
