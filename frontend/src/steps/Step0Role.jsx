export default function Step0Role({ update, onNext }) {
  const choose = (role) => { update({ role }); onNext(); };
  return (
    <div>
      <h2 style={{ fontSize:28, fontWeight:"normal", marginBottom:6, color:"#1A1A1A" }}>Кто вы?</h2>
      <p style={{ color:"#888", fontFamily:"system-ui", fontSize:14, marginBottom:32 }}>
        Выберите роль — от этого зависит интерфейс заполнения
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {[
          { id:"manager", icon:"🏢", title:"Менеджер", desc:"Заполняю данные на основе документов из ТГ-чата с партнёром" },
          { id:"partner", icon:"🤝", title:"Партнёр / Франчайзи", desc:"Самостоятельно загружаю свои документы и заполняю данные" },
        ].map(r => (
          <div key={r.id} onClick={() => choose(r.id)} style={{
            background:"#fff", border:"1.5px solid #E5E0D8", borderRadius:12,
            padding:"28px 24px", cursor:"pointer", transition:"border-color .15s",
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#1A1A1A"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#E5E0D8"}
          >
            <div style={{ fontSize:36, marginBottom:12 }}>{r.icon}</div>
            <div style={{ fontSize:16, fontWeight:"bold", color:"#1A1A1A", marginBottom:8 }}>{r.title}</div>
            <div style={{ fontSize:13, color:"#888", fontFamily:"system-ui", lineHeight:1.5 }}>{r.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
