import { useState, useRef } from "react";
import { Card, Field, Input, Select, Btn, ExtractBtn, SectionTitle, Tag } from "../components/ui";

const PARTNER_TYPES = [
  { value:"ИП", label:"ИП — Индивидуальный предприниматель" },
  { value:"ООО", label:"ООО — Общество с ограниченной ответственностью" },
  { value:"СП", label:"СП — Семейное предприятие" },
];

const DOCS_OPTIONS = [
  { id:"accept", label:"Акцепт оферты" },
  { id:"sublease", label:"Субаренда" },
  { id:"lease", label:"Аренда" },
  { id:"agreement", label:"Соглашение" },
];

export default function Step1Partner({ formData, update, extractFromFile, extractFromText, onNext, onBack }) {
  const [extracting, setExtracting] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const fileRef = useRef();
  const fd = formData;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExtracting(true);
    const result = await extractFromFile(file, "ip_cert");
    if (!result.error) update(result);
    setExtracting(false);
  };

  const handleText = async () => {
    if (!textInput.trim()) return;
    setExtracting(true);
    const result = await extractFromText(textInput, "text");
    if (!result.error) update(result);
    setExtracting(false);
    setShowTextInput(false);
    setTextInput("");
  };

  const toggleDoc = (id) => {
    const docs = fd.docs || [];
    update({ docs: docs.includes(id) ? docs.filter(d => d !== id) : [...docs, id] });
  };

  const contractDate = fd.contract_date || "";

  return (
    <div>
      <h2 style={{ fontSize:26, fontWeight:"normal", marginBottom:6, color:"#1A1A1A" }}>Данные партнёра</h2>
      <p style={{ color:"#888", fontFamily:"system-ui", fontSize:14, marginBottom:24 }}>
        Загрузите свидетельство ИП или вставьте текст из ТГ-чата — ИИ заполнит поля автоматически
      </p>

      {/* AI extraction */}
      <Card style={{ background:"#FFFBF0", border:"1px solid #E8D5A3" }}>
        <SectionTitle>🤖 Автозаполнение через ИИ</SectionTitle>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <ExtractBtn onClick={() => fileRef.current.click()} loading={extracting}>
            📎 Загрузить свидетельство ИП
          </ExtractBtn>
          <ExtractBtn onClick={() => setShowTextInput(!showTextInput)} loading={false}>
            💬 Вставить текст из ТГ
          </ExtractBtn>
        </div>
        <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:"none" }} onChange={handleFile} />
        {showTextInput && (
          <div style={{ marginTop:12 }}>
            <textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="Вставьте текст из ТГ-чата с данными партнёра..."
              style={{
                width:"100%", height:100, border:"1px solid #E0DDD8", borderRadius:7,
                padding:10, fontSize:13, fontFamily:"system-ui", boxSizing:"border-box",
                resize:"vertical", outline:"none"
              }}
            />
            <ExtractBtn onClick={handleText} loading={extracting}>Извлечь данные →</ExtractBtn>
          </div>
        )}
      </Card>

      {/* Тип партнёра */}
      <Card>
        <SectionTitle>Тип партнёра и документы</SectionTitle>
        <Field label="Тип юридического лица">
          <Select value={fd.partner_type} onChange={v => update({ partner_type: v })} options={PARTNER_TYPES} />
        </Field>
        <Field label="Дата договора">
          <Input value={contractDate} onChange={v => update({ contract_date: v })}
                 placeholder="«01» января 2026 г." />
        </Field>
        <Field label="Какие документы формировать">
          <div style={{ marginTop:4 }}>
            {DOCS_OPTIONS.map(d => (
              <Tag key={d.id} label={d.label}
                   active={(fd.docs||[]).includes(d.id)}
                   onClick={() => toggleDoc(d.id)} />
            ))}
          </div>
        </Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="№ договора акцепта">
            <Input value={fd.accept_number} onChange={v => update({ accept_number: v })} placeholder="967" />
          </Field>
          <Field label="№ договора субаренды">
            <Input value={fd.sublease_number} onChange={v => update({ sublease_number: v })} placeholder="967" />
          </Field>
        </div>
      </Card>

      {/* Данные ИП / ООО */}
      <Card>
        <SectionTitle>Реквизиты партнёра</SectionTitle>
        {fd.partner_type === "ИП" ? (
          <>
            <Field label='ИП с "кавычками" (латиница)' hint='Пример: ИП "IVANOV IVAN IVANOVICH"'>
              <Input value={fd.partner_legal_name} onChange={v => update({ partner_legal_name: v })} />
            </Field>
            <Field label="ФИО на кириллице" hint="Иванов И.И.">
              <Input value={fd.partner_fio_ru} onChange={v => update({ partner_fio_ru: v })} />
            </Field>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="Дата регистрации ИП">
                <Input value={fd.partner_reg_date} onChange={v => update({ partner_reg_date: v })} placeholder="01.01.2024" />
              </Field>
              <Field label="Номер регистрации ИП">
                <Input value={fd.partner_reg_number} onChange={v => update({ partner_reg_number: v })} placeholder="7482740" />
              </Field>
            </div>
          </>
        ) : (
          <>
            <Field label='Название компании с "кавычками"'>
              <Input value={fd.company_name} onChange={v => update({ company_name: v })} placeholder='ООО "НАЗВАНИЕ"' />
            </Field>
            <Field label="ИНН компании">
              <Input value={fd.company_inn} onChange={v => update({ company_inn: v })} />
            </Field>
            <Field label="ФИО директора (кириллица)">
              <Input value={fd.partner_fio_ru} onChange={v => update({ partner_fio_ru: v })} />
            </Field>
          </>
        )}
        <Field label="Адрес юр. лица / прописки ИП">
          <Input value={fd.partner_address} onChange={v => update({ partner_address: v })} />
        </Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="ПИНФЛ партнёра" hint="14 цифр">
            <Input value={fd.partner_pinfl} onChange={v => update({ partner_pinfl: v })} placeholder="12345678901234" />
          </Field>
          <Field label="Email">
            <Input value={fd.partner_email} onChange={v => update({ partner_email: v })} placeholder="partner@gmail.com" />
          </Field>
        </div>
      </Card>

      {/* Банк партнёра */}
      <Card>
        <SectionTitle>Банковские реквизиты партнёра</SectionTitle>
        <Field label="Расчётный счёт" hint="20 цифр">
          <Input value={fd.bank_account} onChange={v => update({ bank_account: v })} placeholder="20218000807353717001" />
        </Field>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="МФО банка" hint="5 цифр">
            <Input value={fd.bank_mfo} onChange={v => update({ bank_mfo: v })} placeholder="01036" />
          </Field>
          <Field label="ИНН банка">
            <Input value={fd.bank_inn} onChange={v => update({ bank_inn: v })} />
          </Field>
        </div>
        <Field label="Полное название банка и адрес">
          <Input value={fd.bank_name} onChange={v => update({ bank_name: v })} placeholder='АКБ "Капиталбанк"' />
        </Field>
      </Card>

      <div style={{ display:"flex", gap:12 }}>
        <Btn secondary onClick={onBack}>← Назад</Btn>
        <Btn onClick={onNext} style={{ flex:1 }}>Данные арендодателя →</Btn>
      </div>
    </div>
  );
}
