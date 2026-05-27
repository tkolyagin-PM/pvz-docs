import { Card, Btn, SectionTitle } from "../components/ui";

const LABELS = {
  contract_date: "Дата договора",
  accept_number: "№ акцепта",
  sublease_number: "№ субаренды",
  partner_type: "Тип партнёра",
  landlord_type: "Тип арендодателя",
  partner_legal_name: "Наименование ИП",
  partner_fio_ru: "ФИО партнёра",
  partner_reg_date: "Дата регистрации ИП",
  partner_reg_number: "Номер регистрации ИП",
  partner_pinfl: "ПИНФЛ партнёра",
  partner_email: "Email",
  partner_address: "Адрес юр. лица",
  bank_account: "Р/С партнёра",
  bank_mfo: "МФО банка",
  bank_inn: "ИНН банка",
  bank_name: "Банк партнёра",
  landlord_full_name_latin: "ФИО арендодателя (латиница)",
  landlord_fio_ru: "ФИО арендодателя (кириллица)",
  landlord_birth_date: "Дата рождения АРДД",
  landlord_passport: "Паспорт АРДД",
  landlord_passport_by: "Кем выдан",
  landlord_passport_date: "Дата выдачи",
  landlord_pinfl: "ПИНФЛ АРДД",
  landlord_address_ru: "Адрес АРДД",
  landlord_bank_account: "Р/С арендодателя",
  landlord_bank_mfo: "МФО банка АРДД",
  landlord_bank_inn: "ИНН банка АРДД",
  landlord_bank_name: "Банк арендодателя",
  cadastral_number: "Кадастровый номер",
  premise_address: "Адрес помещения",
  sublease_amount: "Сумма субаренды",
  sublease_amount_words: "Прописью",
  lease_from: "Аренда с",
  lease_to: "Аренда по",
};

const DOC_NAMES = { accept:"Акцепт оферты", sublease:"Субаренда", lease:"Аренда", agreement:"Соглашение" };

export default function Step4Preview({ formData, onGenerate, onBack, loading }) {
  const fd = formData;
  const docs = fd.docs || [];

  return (
    <div>
      <h2 style={{ fontSize:26, fontWeight:"normal", marginBottom:6, color:"#1A1A1A" }}>Проверка данных</h2>
      <p style={{ color:"#888", fontFamily:"system-ui", fontSize:14, marginBottom:24 }}>
        Убедитесь что всё верно перед генерацией
      </p>

      {/* Документы которые будут сформированы */}
      <div style={{ background:"#FFF9EE", border:"1px solid #E8D5A3", borderRadius:10,
                    padding:"16px 20px", marginBottom:20 }}>
        <div style={{ fontSize:13, fontFamily:"system-ui", color:"#7D6008", fontWeight:"bold", marginBottom:8 }}>
          📄 Будет сформировано {docs.length} документа:
        </div>
        {docs.map(d => (
          <div key={d} style={{ fontSize:13, fontFamily:"system-ui", color:"#7D6008", padding:"2px 0" }}>
            ✓ {DOC_NAMES[d]}
          </div>
        ))}
        <div style={{ fontSize:12, color:"#999", marginTop:6, fontFamily:"system-ui" }}>
          Партнёр: <strong>{fd.partner_type}</strong> · Арендодатель: <strong>{fd.landlord_type}</strong>
        </div>
      </div>

      {/* Все данные */}
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div style={{ background:"#1A1A1A", color:"#E8D5A3", padding:"12px 20px",
                      fontSize:12, letterSpacing:1, fontFamily:"system-ui" }}>
          ВСЕ ДАННЫЕ
        </div>
        {Object.entries(LABELS).map(([key, label]) => {
          const val = fd[key];
          if (!val) return null;
          return (
            <div key={key} style={{
              display:"flex", padding:"10px 20px",
              borderBottom:"1px solid #F5F3EE", alignItems:"flex-start"
            }}>
              <div style={{ width:220, fontSize:12, color:"#888", fontFamily:"system-ui", flexShrink:0 }}>{label}</div>
              <div style={{ fontSize:13, color:"#1A1A1A", fontFamily:"Georgia, serif", wordBreak:"break-word" }}>{val}</div>
            </div>
          );
        })}
      </Card>

      <div style={{ display:"flex", gap:12, marginTop:24 }}>
        <Btn secondary onClick={onBack}>← Изменить</Btn>
        <Btn onClick={onGenerate} disabled={loading} style={{ flex:1, fontSize:15 }}>
          {loading ? "⟳ Формируем договоры..." : "Сформировать договоры →"}
        </Btn>
      </div>
    </div>
  );
}
