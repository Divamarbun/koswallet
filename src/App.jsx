import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  Wallet, Home, BarChart2, Target, Sparkles, Plus, X,
  TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle,
  FileText, Loader2
} from "lucide-react";

// ── Data awal demo ──────────────────────────────────────────────
const DEMO_TXS = [
  { id: 1, type: "income",  desc: "Kiriman Ortu",      cat: "Kiriman",        amount: 1500000, date: "2025-01-01" },
  { id: 2, type: "expense", desc: "Bayar Kos",         cat: "Kos & Listrik",  amount: 600000,  date: "2025-01-02" },
  { id: 3, type: "expense", desc: "Makan Nasi Padang", cat: "Makan & Minum",  amount: 25000,   date: "2025-01-03" },
  { id: 4, type: "expense", desc: "Grab ke Kampus",    cat: "Transport",      amount: 18000,   date: "2025-01-04" },
  { id: 5, type: "expense", desc: "Netflix bareng",    cat: "Hiburan",        amount: 15000,   date: "2025-01-05" },
  { id: 6, type: "income",  desc: "Freelance Desain",  cat: "Lainnya",        amount: 350000,  date: "2025-01-06" },
  { id: 7, type: "expense", desc: "Mie goreng & teh",  cat: "Makan & Minum",  amount: 12000,   date: "2025-01-07" },
  { id: 8, type: "expense", desc: "Beli buku kuliah",  cat: "Pendidikan",     amount: 85000,   date: "2025-01-08" },
];

const DEMO_SAVINGS = [
  { id: 1, name: "Laptop Baru",    target: 5000000, current: 1200000, emoji: "💻" },
  { id: 2, name: "Mudik Lebaran",  target: 800000,  current: 320000,  emoji: "✈️" },
];

const MONTHLY_HISTORY = [
  { m: "Agu", inc: 1200000, exp: 980000 },
  { m: "Sep", inc: 1500000, exp: 1100000 },
  { m: "Okt", inc: 1300000, exp: 1050000 },
  { m: "Nov", inc: 1800000, exp: 1200000 },
  { m: "Des", inc: 1400000, exp: 1350000 },
];

const CATEGORIES = ["Makan & Minum","Kos & Listrik","Transport","Hiburan","Belanja","Pendidikan","Kiriman","Lainnya"];
const CAT_EMOJI  = { "Makan & Minum":"🍜","Kos & Listrik":"🏠","Transport":"🚌","Hiburan":"🎮","Belanja":"🛍️","Pendidikan":"📚","Kiriman":"💸","Lainnya":"📌" };
const CAT_COLOR  = { "Makan & Minum":"#f97066","Kos & Listrik":"#a78bfa","Transport":"#fbbf24","Hiburan":"#f472b6","Belanja":"#60a5fa","Pendidikan":"#34d399","Kiriman":"#4fd1a5","Lainnya":"#8884a8" };
const SAVING_EMOJIS = ["💻","✈️","🏠","📱","🎓","🏍️","💪","🎯"];

// ── Helpers ─────────────────────────────────────────────────────
const fmt = n => "Rp " + Math.round(n).toLocaleString("id-ID");

// ── Styles (CSS-in-JS object) ────────────────────────────────────
const S = {
  app: { background: "#0f0f13", minHeight: "100vh", color: "#f0effe", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  header: { background: "#1a1a24", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 },
  logo: { display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: 16 },
  logoDot: { width: 32, height: 32, background: "linear-gradient(135deg,#7c6af7,#4fd1a5)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  nav: { display: "flex", gap: 4 },
  body: { maxWidth: 480, margin: "0 auto", padding: "20px 16px 80px" },
  balCard: { background: "linear-gradient(135deg,#4a3fcc,#6c5ce7,#a78bfa)", borderRadius: 18, padding: "22px 20px", marginBottom: 16 },
  balLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4 },
  balAmt: { fontSize: 32, fontWeight: 700, color: "#fff" },
  balRow: { display: "flex", gap: 10, marginTop: 14 },
  balSub: { flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "10px 12px" },
  balSubLabel: { fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 2 },
  balSubVal: { fontSize: 14, fontWeight: 600, color: "#fff" },
  statRow: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 },
  stat: { background: "#222230", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 12 },
  statLabel: { fontSize: 11, color: "#8884a8", marginBottom: 4 },
  sectionTitle: { fontSize: 11, fontWeight: 600, color: "#8884a8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 },
  txList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 },
  txCard: { background: "#222230", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 },
  txIcon: { width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 },
  addBtn: { width: "100%", padding: 13, background: "rgba(124,106,247,0.12)", border: "1.5px dashed rgba(124,106,247,0.4)", borderRadius: 14, color: "#7c6af7", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  card: { background: "#222230", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16, marginBottom: 12 },
  progressWrap: { height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden", marginBottom: 8 },
  aiCard: { background: "linear-gradient(135deg,rgba(124,106,247,0.12),rgba(79,209,165,0.08))", border: "1px solid rgba(124,106,247,0.25)", borderRadius: 14, padding: 16, marginBottom: 12 },
  aiBadge: { fontSize: 11, background: "rgba(124,106,247,0.2)", color: "#7c6af7", padding: "3px 9px", borderRadius: 999, fontWeight: 500 },
  aiBtn: { marginTop: 12, padding: "9px 16px", background: "rgba(124,106,247,0.15)", border: "1px solid rgba(124,106,247,0.3)", borderRadius: 10, color: "#7c6af7", fontSize: 13, fontWeight: 500, cursor: "pointer" },
  exportBtn: { width: "100%", padding: 13, background: "rgba(124,106,247,0.1)", border: "1px solid rgba(124,106,247,0.25)", borderRadius: 14, color: "#7c6af7", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#1a1a24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 24, width: "100%", maxWidth: 360 },
  input: { width: "100%", background: "#222230", border: "1px solid rgba(255,255,255,0.1)", color: "#f0effe", borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" },
  select: { width: "100%", background: "#222230", border: "1px solid rgba(255,255,255,0.1)", color: "#f0effe", borderRadius: 10, padding: "10px 12px", fontSize: 14, outline: "none" },
  label: { fontSize: 12, color: "#8884a8", display: "block", marginBottom: 5 },
  fGroup: { marginBottom: 12 },
  fRow: { display: "flex", gap: 10 },
  btnRow: { display: "flex", gap: 8, marginTop: 16 },
  btnCancel: { flex: 1, padding: 11, background: "#2a2a3a", border: "none", borderRadius: 10, color: "#8884a8", fontSize: 14, cursor: "pointer" },
  btnSave: { flex: 1, padding: 11, background: "#7c6af7", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#1a1a24", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-around", padding: "10px 0 14px" },
  navBtn: (active) => ({ background: "none", border: "none", color: active ? "#7c6af7" : "#8884a8", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 10, cursor: "pointer", fontWeight: active ? 600 : 400 }),
};

// ── Nav Button ───────────────────────────────────────────────────
function NavBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button style={S.navBtn(active)} onClick={onClick}>
      <Icon size={20} />
      {label}
    </button>
  );
}

// ── Modal Transaksi ──────────────────────────────────────────────
function TxModal({ onClose, onSave }) {
  const [form, setForm] = useState({ type: "expense", desc: "", amount: "", cat: CATEGORIES[0] });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const save = () => {
    if (!form.desc.trim() || !form.amount) return;
    onSave({ ...form, amount: parseFloat(form.amount), id: Date.now(), date: new Date().toISOString().split("T")[0] });
    onClose();
  };
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontWeight:600, fontSize:16 }}>Tambah Transaksi</span>
          <button style={{ background:"none", border:"none", color:"#8884a8", cursor:"pointer" }} onClick={onClose}><X size={18}/></button>
        </div>
        <div style={S.fGroup}>
          <label style={S.label}>Tipe</label>
          <select style={S.select} value={form.type} onChange={set("type")}>
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </div>
        <div style={S.fGroup}>
          <label style={S.label}>Deskripsi</label>
          <input style={S.input} placeholder="cth: Makan siang, Kiriman ortu..." value={form.desc} onChange={set("desc")} />
        </div>
        <div style={S.fRow}>
          <div style={{ ...S.fGroup, flex:1 }}>
            <label style={S.label}>Jumlah (Rp)</label>
            <input style={S.input} type="number" placeholder="50000" value={form.amount} onChange={set("amount")} />
          </div>
          <div style={{ ...S.fGroup, flex:1 }}>
            <label style={S.label}>Kategori</label>
            <select style={S.select} value={form.cat} onChange={set("cat")}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={S.btnRow}>
          <button style={S.btnCancel} onClick={onClose}>Batal</button>
          <button style={S.btnSave} onClick={save}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Target Tabungan ────────────────────────────────────────
function SavingModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name:"", target:"", current:"", emoji: SAVING_EMOJIS[0] });
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const save = () => {
    if (!form.name.trim() || !form.target) return;
    onSave({ ...form, target: parseFloat(form.target), current: parseFloat(form.current)||0, id: Date.now() });
    onClose();
  };
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontWeight:600, fontSize:16 }}>Target Tabungan Baru</span>
          <button style={{ background:"none", border:"none", color:"#8884a8", cursor:"pointer" }} onClick={onClose}><X size={18}/></button>
        </div>
        <div style={S.fGroup}>
          <label style={S.label}>Nama Target</label>
          <input style={S.input} placeholder="cth: Laptop baru, Mudik..." value={form.name} onChange={set("name")} />
        </div>
        <div style={S.fRow}>
          <div style={{ ...S.fGroup, flex:1 }}>
            <label style={S.label}>Target (Rp)</label>
            <input style={S.input} type="number" placeholder="2000000" value={form.target} onChange={set("target")} />
          </div>
          <div style={{ ...S.fGroup, flex:1 }}>
            <label style={S.label}>Sudah ada (Rp)</label>
            <input style={S.input} type="number" placeholder="0" value={form.current} onChange={set("current")} />
          </div>
        </div>
        <div style={S.fGroup}>
          <label style={S.label}>Emoji</label>
          <select style={S.select} value={form.emoji} onChange={set("emoji")}>
            {SAVING_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div style={S.btnRow}>
          <button style={S.btnCancel} onClick={onClose}>Batal</button>
          <button style={S.btnSave} onClick={save}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

// ── Halaman Home ─────────────────────────────────────────────────
function HomeView({ txs, onAdd }) {
  const inc = txs.filter(t => t.type === "income").reduce((a,t) => a+t.amount, 0);
  const exp = txs.filter(t => t.type === "expense").reduce((a,t) => a+t.amount, 0);
  const bal = inc - exp;
  const recent = [...txs].reverse().slice(0, 6);

  return (
    <>
      <div style={S.balCard}>
        <div style={S.balLabel}>Saldo Bulan Ini</div>
        <div style={S.balAmt}>{fmt(bal)}</div>
        <div style={S.balRow}>
          <div style={S.balSub}>
            <div style={S.balSubLabel}><ArrowDownCircle size={11} style={{verticalAlign:-1}}/> Pemasukan</div>
            <div style={S.balSubVal}>{fmt(inc)}</div>
          </div>
          <div style={S.balSub}>
            <div style={S.balSubLabel}><ArrowUpCircle size={11} style={{verticalAlign:-1}}/> Pengeluaran</div>
            <div style={S.balSubVal}>{fmt(exp)}</div>
          </div>
        </div>
      </div>

      <p style={S.sectionTitle}>Transaksi Terakhir</p>
      <div style={S.txList}>
        {recent.map(t => (
          <div key={t.id} style={S.txCard}>
            <div style={{ ...S.txIcon, background: t.type==="income" ? "rgba(79,209,165,0.15)" : "rgba(249,112,102,0.15)" }}>
              {CAT_EMOJI[t.cat] || "📌"}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500 }}>{t.desc}</div>
              <div style={{ fontSize:12, color:"#8884a8", marginTop:2 }}>{t.cat}</div>
            </div>
            <div style={{ fontSize:14, fontWeight:600, color: t.type==="income" ? "#4fd1a5" : "#f97066" }}>
              {t.type==="income" ? "+" : "-"}{fmt(t.amount)}
            </div>
          </div>
        ))}
      </div>
      <button style={S.addBtn} onClick={onAdd}>
        <Plus size={16}/> Tambah Transaksi
      </button>
    </>
  );
}

// ── Halaman Grafik ───────────────────────────────────────────────
function ChartView({ txs }) {
  const inc = txs.filter(t => t.type==="income").reduce((a,t)=>a+t.amount,0);
  const exp = txs.filter(t => t.type==="expense").reduce((a,t)=>a+t.amount,0);
  const chartData = [...MONTHLY_HISTORY, { m:"Jan", inc, exp }];

  const cats = {};
  txs.filter(t=>t.type==="expense").forEach(t => { cats[t.cat]=(cats[t.cat]||0)+t.amount; });
  const total = Object.values(cats).reduce((a,v)=>a+v,0)||1;
  const sorted = Object.entries(cats).sort((a,b)=>b[1]-a[1]);

  const exportTxt = () => {
    const lines = [
      "RINGKASAN KEUANGAN — KOSWALLET",
      "=".repeat(38),
      `Pemasukan : ${fmt(inc)}`,
      `Pengeluaran: ${fmt(exp)}`,
      `Saldo      : ${fmt(inc-exp)}`,
      "",
      "TRANSAKSI:",
      ...txs.map(t=>`[${t.type==="income"?"IN":"OUT"}] ${t.desc} — ${fmt(t.amount)} | ${t.cat}`),
      "",
      `Digenerate: ${new Date().toLocaleString("id-ID")}`,
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([lines],{type:"text/plain"}));
    a.download = "KosWallet_Ringkasan.txt";
    a.click();
  };

  return (
    <>
      <p style={S.sectionTitle}>Arus Kas 6 Bulan</p>
      <div style={S.card}>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} barGap={2}>
            <XAxis dataKey="m" tick={{ fontSize:11, fill:"#8884a8" }} axisLine={false} tickLine={false}/>
            <YAxis hide />
            <Tooltip
              formatter={(v, name) => [fmt(v), name==="inc"?"Pemasukan":"Pengeluaran"]}
              contentStyle={{ background:"#1a1a24", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, fontSize:12 }}
              labelStyle={{ color:"#f0effe" }}
            />
            <Bar dataKey="inc" fill="#4fd1a5" radius={[4,4,0,0]} maxBarSize={24}/>
            <Bar dataKey="exp" fill="#f97066" radius={[4,4,0,0]} maxBarSize={24}/>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display:"flex", gap:16, justifyContent:"center", marginTop:4 }}>
          {[["#4fd1a5","Pemasukan"],["#f97066","Pengeluaran"]].map(([c,l])=>(
            <span key={l} style={{ fontSize:11, color:"#8884a8", display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ width:10, height:10, background:c, borderRadius:2, display:"inline-block"}}/>
              {l}
            </span>
          ))}
        </div>
      </div>

      <p style={S.sectionTitle}>Pengeluaran per Kategori</p>
      <div style={S.card}>
        {sorted.length === 0
          ? <div style={{ color:"#8884a8", fontSize:13 }}>Belum ada pengeluaran</div>
          : sorted.map(([name, amt]) => (
            <div key={name} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <div style={{ fontSize:13, width:110, flexShrink:0 }}>{CAT_EMOJI[name]} {name}</div>
              <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.07)", borderRadius:999, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.round(amt/total*100)}%`, background: CAT_COLOR[name]||"#8884a8", borderRadius:999 }}/>
              </div>
              <div style={{ fontSize:12, color:"#8884a8", width:32, textAlign:"right" }}>{Math.round(amt/total*100)}%</div>
            </div>
          ))
        }
      </div>

      <button style={S.exportBtn} onClick={exportTxt}>
        <FileText size={16}/> Export Ringkasan
      </button>
    </>
  );
}

// ── Halaman Tabungan ─────────────────────────────────────────────
function SavingView({ savings, onAdd }) {
  const colors = ["#7c6af7","#4fd1a5","#fbbf24","#f97066","#60a5fa"];
  return (
    <>
      <p style={S.sectionTitle}>Target Tabungan</p>
      {savings.map((s, i) => {
        const pct = Math.min(100, Math.round(s.current/s.target*100));
        const col = colors[i % colors.length];
        return (
          <div key={s.id} style={S.card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:600 }}>{s.emoji} {s.name}</div>
                <div style={{ fontSize:12, color:"#8884a8", marginTop:3 }}>{fmt(s.current)} dari {fmt(s.target)}</div>
              </div>
              <div style={{ fontSize:18, fontWeight:700, color:col }}>{pct}%</div>
            </div>
            <div style={S.progressWrap}>
              <div style={{ height:"100%", width:`${pct}%`, background:col, borderRadius:999, transition:"width 0.4s ease" }}/>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#8884a8" }}>
              <span>Kurang {fmt(s.target-s.current)}</span>
              <span>{pct === 100 ? "🎉 Tercapai!" : `${100-pct}% lagi`}</span>
            </div>
          </div>
        );
      })}
      <button style={S.addBtn} onClick={onAdd}>
        <Plus size={16}/> Tambah Target
      </button>
    </>
  );
}

// ── Halaman AI Tips ──────────────────────────────────────────────
function AiView({ txs, savings }) {
  const [tip, setTip] = useState("");
  const [loading, setLoading] = useState(false);

  const getTip = async () => {
    const inc = txs.filter(t=>t.type==="income").reduce((a,t)=>a+t.amount,0);
    const exp = txs.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0);
    const cats = {};
    txs.filter(t=>t.type==="expense").forEach(t=>{ cats[t.cat]=(cats[t.cat]||0)+t.amount; });
    const topCat = Object.entries(cats).sort((a,b)=>b[1]-a[1])[0];
    const goals = savings.map(s=>`${s.emoji} ${s.name}: ${Math.round(s.current/s.target*100)}% terpenuhi`).join(", ");

    const prompt = `Kamu adalah asisten keuangan personal untuk mahasiswa/anak kos Indonesia. Berikan tips keuangan yang singkat, praktis, dan relevan berdasarkan data ini:

- Pemasukan bulan ini: Rp ${Math.round(inc).toLocaleString("id-ID")}
- Pengeluaran bulan ini: Rp ${Math.round(exp).toLocaleString("id-ID")}
- Saldo: Rp ${Math.round(inc-exp).toLocaleString("id-ID")}
- Pengeluaran terbesar: ${topCat ? topCat[0]+" (Rp "+Math.round(topCat[1]).toLocaleString("id-ID")+")" : "belum ada data"}
- Target tabungan: ${goals || "belum ada"}

Berikan 2-3 tips konkret dalam Bahasa Indonesia. Santai tapi informatif. Sertakan emoji. Maksimal 120 kata.`;

    setLoading(true);
    setTip("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{ role:"user", content:prompt }] }),
      });
      const data = await res.json();
      setTip(data.content?.find(c=>c.type==="text")?.text || "Tidak dapat memuat tips.");
    } catch {
      setTip("⚠️ Gagal memuat tips. Cek koneksi dan coba lagi.");
    }
    setLoading(false);
  };

  return (
    <>
      <p style={S.sectionTitle}>AI Financial Tips</p>
      <div style={S.aiCard}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <Sparkles size={16} color="#7c6af7"/>
          <span style={S.aiBadge}>AI Powered</span>
        </div>
        {loading
          ? <div style={{ display:"flex", alignItems:"center", gap:8, color:"#8884a8", fontSize:13 }}>
              <Loader2 size={16} style={{ animation:"spin 1s linear infinite" }}/> Menganalisis keuanganmu...
            </div>
          : tip
            ? <div style={{ fontSize:13, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{tip}</div>
            : <div style={{ fontSize:13, color:"#8884a8" }}>Klik tombol di bawah untuk mendapatkan tips personal berdasarkan data keuanganmu.</div>
        }
        <button style={S.aiBtn} onClick={getTip} disabled={loading}>
          ✨ {tip ? "Refresh Tips" : "Analisis & Beri Tips"}
        </button>
      </div>

      <div style={{ ...S.card, border:"1px solid rgba(79,209,165,0.2)" }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>💡 Tips Hemat Anak Kos</div>
        {[
          ["🍱","Masak sendiri bisa hemat hingga 60% pengeluaran makan"],
          ["🚶","Jalan kaki atau naik sepeda untuk jarak dekat"],
          ["📱","Manfaatkan promo & cashback aplikasi dompet digital"],
          ["☕","Kurangi jajan kopi, buat sendiri di kos"],
        ].map(([e,t])=>(
          <div key={t} style={{ display:"flex", gap:8, marginBottom:8, fontSize:13, lineHeight:1.5 }}>
            <span>{e}</span><span style={{ color:"#c9c7e8" }}>{t}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ── App Utama ────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");
  const [txs, setTxs] = useState(DEMO_TXS);
  const [savings, setSavings] = useState(DEMO_SAVINGS);
  const [showTxModal, setShowTxModal] = useState(false);
  const [showSvModal, setShowSvModal] = useState(false);

  const addTx = tx => setTxs(prev => [...prev, tx]);
  const addSaving = sv => setSavings(prev => [...prev, sv]);

  const TABS = [
    { id:"home",   Icon:Home,     label:"Beranda" },
    { id:"chart",  Icon:BarChart2,label:"Grafik"  },
    { id:"saving", Icon:Target,   label:"Tabungan"},
    { id:"ai",     Icon:Sparkles, label:"AI Tips" },
  ];

  return (
    <div style={S.app}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      <header style={S.header}>
        <div style={S.logo}>
          <div style={S.logoDot}><Wallet size={16} color="#fff"/></div>
          KosWallet
        </div>
        <div style={{ fontSize:12, color:"#8884a8" }}>Mei 2025</div>
      </header>

      <main style={S.body}>
        {tab==="home"   && <HomeView   txs={txs}     onAdd={()=>setShowTxModal(true)}/>}
        {tab==="chart"  && <ChartView  txs={txs}/>}
        {tab==="saving" && <SavingView savings={savings} onAdd={()=>setShowSvModal(true)}/>}
        {tab==="ai"     && <AiView     txs={txs} savings={savings}/>}
      </main>

      <nav style={S.bottomNav}>
        {TABS.map(({id,Icon,label})=>(
          <NavBtn key={id} icon={Icon} label={label} active={tab===id} onClick={()=>setTab(id)}/>
        ))}
      </nav>

      {showTxModal && <TxModal onClose={()=>setShowTxModal(false)} onSave={addTx}/>}
      {showSvModal && <SavingModal onClose={()=>setShowSvModal(false)} onSave={addSaving}/>}
    </div>
  );
}