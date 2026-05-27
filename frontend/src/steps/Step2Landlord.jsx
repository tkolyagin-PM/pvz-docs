import { useState, useRef } from "react";
import { Card, Field, Input, Select, Btn, ExtractBtn, SectionTitle } from "../components/ui";

const LANDLORD_TYPES = [
  { value:"ФИЗ", label:"Физическое лицо" },
  { value:"ООО", label:"ООО / Юридическое лицо" },
  { value:"ИП", label:"ИП" },
  { value:"Собственник", label:"Собственник (договор аренды не нужен)" },
];

export default function Step2Landlord({ formData, update, extractFromFile, extractFromText, onNext, onBack }) {
  const [extracting, setExtracting] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showText, setShowText] = useState(false);
  const fileRef = useRef();
  const fd = formData;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExtracting(true);
    const result = await extractFromFile(file, "passport");
    if (!result.error) update(result);
    setExtracting(false);
  };

  const handleText = async () => {
    if (!textInput.trim()) return;
    setExtracting(true);
    const result = await extractFromText(textInput, "text");
    if (!result.error) update(result);
    setExtracting(false);
    setShowText(false);
    setTextInput("");
  };

  const isOwner = fd.landlord_type === "Собственник";
  const isFiz = fd.landlord_type === "ФИЗ";

  return (
    <div>
      <h2 style={{ fontSize:26, fontWeight:"normal", marginBottom:6, color:"#1A1A1A" }}>Данные арендодателя</h2>
      <p style={{ color:"#888", fontFamily:"system-ui", fontSize:14, marginBottom:24 }}>
        Тот, кто сдаёт помещение партнёру
      </p>

      <Card>
        <SectionTitle>Тип арендодателя</SectionTitle>
        <Field label="Кем является арендодатель">
          <Select value={fd.landlord_type} onChange={v => update({ landlord_type: v })} options={LANDLORD_TYPES} />
        </Field>
        {isOwner && (
          <div style={{ background:"#E8F5E9", border:"1px solid #A5D6A7", borderRadius:8,
                        padding:"12px 16px", fontFamily:"system-ui", fontSize:13, color:"#2E7D32" }}>
            ✓ Партнёр является собственником помещения — договор аренды не формируется
          </div>
        )}
      </Card>

      {!isOwner && (
        <>
          {/* AI extraction */}
          <Card style={{ background:"#FFFBF0", border:"1px solid #E8D5A3" }}>
            <SectionTitle>🤖 Автозаполнение через ИИ</SectionTitle>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {isFiz && (
                <ExtractBtn onClick={() => fileRef.current.click()} loading={extracting}>
                  📎 Загрузить фото паспорта
                </ExtractBtn>
              )}
              <ExtractBtn onClick={() => setShowText(!showText)} loading={false}>
                💬 Вставить текст из ТГ
              </ExtractBtn>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
            {showText && (
              <div style={{ marginTop:12 }}>
                <textarea
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="Вставьте данные арендодателя из ТГ-чата..."
                  style={{ width:"100%", height:90, border:"1px solid #E0DDD8", borderRadius:7,
                           padding:10, fontSize:13, fontFamily:"system-ui", boxSizing:"border-box",
                           resize:"vertical", outline:"none" }}
                />
                <ExtractBtn onClick={handleText} loading={extracting}>Извлечь данные →</ExtractBtn>
              </div>
            )}
          </Card>

          {/* Физлицо */}
          {isFiz && (
            <Card>
              <SectionTitle>Паспортные данные арендодателя</SectionTitle>
              <Field label="ФИО (латиница, заглавными)" hint="Как в паспорте: IVANOV IVAN IVANOVICH">
                <Input value={fd.landlord_full_name_latin} onChange={v => update({ landlord_full_name_latin: v })} />
              </Field>
              <Field label="Фамилия И.О. (кириллица)">
                <Input value={fd.landlord_fio_ru} onChange={v => update({ landlord_fio_ru: v })} placeholder="Иванов И.И." />
              </Field>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Field label="Дата рождения">
                  <Input value={fd.landlord_birth_date} onChange={v => update({ landlord_birth_date: v })} placeholder="01.01.1980" />
                </Field>
                <Field label="Серия и номер паспорта">
                  <Input value={fd.landlord_passport} onChange={v => update({ landlord_passport: v })} placeholder="AB 1234567" />
                </Field>
              </div>
              <Field label="Кем выдан паспорт">
                <Input value={fd.landlord_passport_by} onChange={v => update({ landlord_passport_by: v })} placeholder="IIV XXXXX" />
              </Field>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Field label="Дата выдачи паспорта">
                  <Input value={fd.landlord_passport_date} onChange={v => update({ landlord_passport_date: v })} placeholder="01.01.2020" />
                </Field>
                <Field label="ПИНФЛ арендодателя" hint="14 цифр">
                  <Input value={fd.landlord_pinfl} onChange={v => update({ landlord_pinfl: v })} />
                </Field>
              </div>
              <Field label="Адрес прописки (кириллица)">
                <Input value={fd.landlord_address_ru} onChange={v => update({ landlord_address_ru: v })} />
              </Field>
              <Field label="Адрес по e-ijara (латиница)">
                <Input value={fd.landlord_address_ejara} onChange={v => update({ landlord_address_ejara: v })} />
              </Field>
            </Card>
          )}

          {/* ООО/ИП арендодатель */}
          {!isFiz && (
            <Card>
              <SectionTitle>Данные организации арендодателя</SectionTitle>
              <Field label="Название ЧП / ООО">
                <Input value={fd.landlord_company_name} onChange={v => update({ landlord_company_name: v })} />
              </Field>
              <Field label="ИНН организации">
                <Input value={fd.landlord_inn} onChange={v => update({ landlord_inn: v })} />
              </Field>
              <Field label="ФИО руководителя (латиница)">
                <Input value={fd.landlord_full_name_latin} onChange={v => update({ landlord_full_name_latin: v })} />
              </Field>
              <Field label="Фамилия И.О. (кириллица)">
                <Input value={fd.landlord_fio_ru} onChange={v => update({ landlord_fio_ru: v })} />
              </Field>
            </Card>
          )}

          {/* Банк арендодателя */}
          <Card>
            <SectionTitle>Банковские реквизиты арендодателя</SectionTitle>
            <Field label="Номер карты (если есть)">
              <Input value={fd.landlord_card} onChange={v => update({ landlord_card: v })} placeholder="8600 1234 5678 9012" />
            </Field>
            <Field label="Расчётный счёт" hint="20 цифр">
              <Input value={fd.landlord_bank_account} onChange={v => update({ landlord_bank_account: v })} />
            </Field>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Field label="МФО банка" hint="5 цифр">
                <Input value={fd.landlord_bank_mfo} onChange={v => update({ landlord_bank_mfo: v })} />
              </Field>
              <Field label="ИНН банка">
                <Input value={fd.landlord_bank_inn} onChange={v => update({ landlord_bank_inn: v })} />
              </Field>
            </div>
            <Field label="Полное название банка">
              <Input value={fd.landlord_bank_name} onChange={v => update({ landlord_bank_name: v })} />
            </Field>
          </Card>
        </>
      )}

      <div style={{ display:"flex", gap:12 }}>
        <Btn secondary onClick={onBack}>← Назад</Btn>
        <Btn onClick={onNext} style={{ flex:1 }}>Данные помещения →</Btn>
      </div>
    </div>
  );
}
