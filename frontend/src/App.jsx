import { useState } from "react";
import Step0Role from "./steps/Step0Role";
import Step1Partner from "./steps/Step1Partner";
import Step2Landlord from "./steps/Step2Landlord";
import Step3Premise from "./steps/Step3Premise";
import Step4Preview from "./steps/Step4Preview";
import Step5Done from "./steps/Step5Done";

const STEPS = ["Роль", "Партнёр", "Арендодатель", "Помещение", "Проверка", "Готово"];

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    role: null,
    partner_type: "ИП",
    landlord_type: "ФИЗ",
    docs: ["accept", "sublease", "lease", "agreement"],
    contract_date: formatDate(new Date()),
  });
  const [links, setLinks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function formatDate(d) {
    const months = ["января","февраля","марта","апреля","мая","июня",
                    "июля","августа","сентября","октября","ноября","декабря"];
    return `«${d.getDate()}» ${months[d.getMonth()]} ${d.getFullYear()} г.`;
  }

  const update = (fields) => setFormData(f => ({ ...f, ...fields }));

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.detail || "Ошибка генерации");
      setLinks(data.links);
      setStep(5);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const extractFromFile = async (file, docType) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("doc_type", docType);
    const resp = await fetch(`${API}/api/extract`, { method: "POST", body: fd });
    return resp.json();
  };

  const extractFromText = async (text, docType = "text") => {
    const fd = new FormData();
    fd.append("text", text);
    fd.append("doc_type", docType);
    const resp = await fetch(`${API}/api/extract`, { method: "POST", body: fd });
    return resp.json();
  };

  const reset = () => {
    setStep(0);
    setFormData({ role: null, partner_type: "ИП", landlord_type: "ФИЗ",
                  docs: ["accept","sublease","lease","agreement"],
                  contract_date: formatDate(new Date()) });
    setLinks(null);
    setError(null);
  };

  const stepProps = { formData, update, api: API, extractFromFile, extractFromText };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F3EE", fontFamily: "Georgia, serif" }}>
      {/* Header */}
      <div style={{ background: "#1A1A1A", padding: "16px 40px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 36, height: 36, background: "#E8D5A3", borderRadius: 4, display:"flex",
                      alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize:18, color:"#1A1A1A" }}>У</div>
        <div>
          <div style={{ color: "#E8D5A3", fontSize: 14, fontWeight: "bold", letterSpacing: 1 }}>UZUM MARKET</div>
          <div style={{ color: "#888", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Генератор договоров ПВЗ</div>
        </div>
      </div>

      {/* Progress */}
      {step < 5 && (
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E0D8", padding: "0 40px" }}>
          <div style={{ display: "flex", maxWidth: 720, margin: "0 auto" }}>
            {STEPS.slice(0,5).map((s, i) => (
              <div key={s} style={{
                flex: 1, padding: "13px 0", textAlign: "center",
                borderBottom: i === step ? "2px solid #1A1A1A" : "2px solid transparent",
                color: i === step ? "#1A1A1A" : i < step ? "#888" : "#C0B8AC",
                fontSize: 11, letterSpacing: 1, textTransform: "uppercase",
                fontFamily: "system-ui, sans-serif",
              }}>
                <span style={{
                  display:"inline-block", width:18, height:18, borderRadius:"50%", marginRight:5,
                  background: i < step ? "#1A1A1A" : i===step ? "#E8D5A3" : "#E5E0D8",
                  color: i < step ? "#fff" : "#1A1A1A",
                  fontSize:10, lineHeight:"18px", textAlign:"center", fontWeight:"bold",
                }}>{i < step ? "✓" : i+1}</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 20px" }}>
        {error && (
          <div style={{ background:"#FFEBEB", border:"1px solid #F09595", borderRadius:10,
                        padding:"12px 16px", marginBottom:20, fontFamily:"system-ui", fontSize:13, color:"#A32D2D" }}>
            ⚠ {error}
          </div>
        )}

        {step === 0 && <Step0Role {...stepProps} onNext={() => setStep(1)} />}
        {step === 1 && <Step1Partner {...stepProps} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {step === 2 && <Step2Landlord {...stepProps} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step3Premise {...stepProps} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <Step4Preview {...stepProps} onGenerate={generate} onBack={() => setStep(3)} loading={loading} />}
        {step === 5 && <Step5Done links={links} onReset={reset} />}
      </div>
    </div>
  );
}
