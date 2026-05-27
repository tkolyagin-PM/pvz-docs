import { Btn } from "../components/ui";

const DOC_INFO = {
  accept:    { name:"Акцепт оферты",  icon:"📝" },
  sublease:  { name:"Субаренда",      icon:"🏪" },
  lease:     { name:"Аренда",         icon:"🏢" },
  agreement: { name:"Соглашение",     icon:"🤝" },
};

export default function Step5Done({ links, onReset }) {
  if (!links) return null;
  const docs = Object.entries(links);

  return (
    <div style={{ textAlign:"center", paddingTop:40 }}>
      <div style={{ fontSize:60, marginBottom:16 }}>✓</div>
      <h2 style={{ fontSize:30, fontWeight:"normal", color:"#1A1A1A", marginBottom:8 }}>
        Договоры готовы!
      </h2>
      <p style={{ color:"#888", fontFamily:"system-ui", fontSize:14, marginBottom:36 }}>
        {docs.length} документа сформированы в вашей папке Google Drive
      </p>

      <div style={{ display:"grid", gap:12, marginBottom:32, textAlign:"left" }}>
        {docs.map(([key, url]) => {
          const info = DOC_INFO[key] || { name:key, icon:"📄" };
          return (
            <div key={key} style={{
              background:"#fff", border:"1px solid #E5E0D8", borderRadius:10,
              padding:"16px 20px", display:"flex", alignItems:"center", gap:14
            }}>
              <div style={{ fontSize:28 }}>{info.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color:"#1A1A1A", fontWeight:"bold", marginBottom:2 }}>{info.name}</div>
                <div style={{ fontSize:11, color:"#AAA", fontFamily:"system-ui", wordBreak:"break-all" }}>{url}</div>
              </div>
              <a href={url} target="_blank" rel="noreferrer" style={{
                padding:"8px 18px", background:"#1A1A1A", color:"#E8D5A3",
                borderRadius:6, fontSize:12, textDecoration:"none",
                fontFamily:"system-ui", whiteSpace:"nowrap",
              }}>
                Открыть →
              </a>
            </div>
          );
        })}
      </div>

      <Btn onClick={onReset} style={{ background:"#E8D5A3", color:"#1A1A1A", border:"none" }}>
        ＋ Новая заявка
      </Btn>
    </div>
  );
}
