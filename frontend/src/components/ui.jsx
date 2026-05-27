export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E5E0D8",
      borderRadius: 12, padding: "24px", marginBottom: 16, ...style
    }}>
      {children}
    </div>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display:"block", fontSize:11, color:"#888",
                      fontFamily:"system-ui", letterSpacing:0.5,
                      textTransform:"uppercase", marginBottom:5 }}>
        {label}
      </label>
      {children}
      {hint && !error && <div style={{ fontSize:11, color:"#AAA", marginTop:3, fontFamily:"system-ui" }}>{hint}</div>}
      {error && <div style={{ fontSize:11, color:"#C0392B", marginTop:3, fontFamily:"system-ui" }}>⚠ {error}</div>}
    </div>
  );
}

export function Input({ value, onChange, placeholder, style = {} }) {
  return (
    <input
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width:"100%", border:"1px solid #E0DDD8", borderRadius:7,
        padding:"9px 12px", fontSize:14, fontFamily:"Georgia, serif",
        color:"#1A1A1A", background:"#FAFAF8", boxSizing:"border-box",
        outline:"none", ...style
      }}
    />
  );
}

export function Select({ value, onChange, options }) {
  return (
    <select
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      style={{
        width:"100%", border:"1px solid #E0DDD8", borderRadius:7,
        padding:"9px 12px", fontSize:14, fontFamily:"Georgia, serif",
        color:"#1A1A1A", background:"#FAFAF8", boxSizing:"border-box",
        outline:"none", appearance:"none",
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Btn({ onClick, disabled, children, secondary, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "13px 24px",
        background: secondary ? "transparent" : (disabled ? "#C0B8AC" : "#1A1A1A"),
        color: secondary ? "#888" : "#E8D5A3",
        border: secondary ? "1px solid #C0B8AC" : "none",
        borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
        fontFamily:"Georgia, serif", fontSize:14, transition:"opacity .15s",
        ...style
      }}
    >
      {children}
    </button>
  );
}

export function ExtractBtn({ onClick, loading, children }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding:"8px 16px", background: loading ? "#E5E0D8" : "#F5F3EE",
        border:"1px solid #C0B8AC", borderRadius:6,
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily:"system-ui", fontSize:12, color:"#555",
        marginTop:8,
      }}
    >
      {loading ? "⟳ Извлекаю..." : children}
    </button>
  );
}

export function SectionTitle({ children }) {
  return (
    <h3 style={{ fontSize:13, fontFamily:"system-ui", letterSpacing:1,
                 textTransform:"uppercase", color:"#888", marginBottom:16, marginTop:0 }}>
      {children}
    </h3>
  );
}

export function Tag({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"7px 16px", borderRadius:20,
      border: active ? "1.5px solid #1A1A1A" : "1px solid #E0DDD8",
      background: active ? "#1A1A1A" : "#fff",
      color: active ? "#E8D5A3" : "#888",
      fontFamily:"system-ui", fontSize:13, cursor:"pointer", marginRight:8, marginBottom:8,
    }}>{label}</button>
  );
}
