import { useState, useRef } from "react";
import { Card, Field, Input, Btn, ExtractBtn, SectionTitle } from "../components/ui";

function amountToWords(n) {
  const units = ["","один","два","три","четыре","пять","шесть","семь","восемь","девять"];
  const teens = ["десять","одиннадцать","двенадцать","тринадцать","четырнадцать",
                 "пятнадцать","шестнадцать","семнадцать","восемнадцать","девятнадцать"];
  const tens  = ["","","двадцать","тридцать","сорок","пятьдесят",
                 "шестьдесят","семьдесят","восемьдесят","девяносто"];
  const hunds = ["","сто","двести","триста","четыреста","пятьсот",
                 "шестьсот","семьсот","восемьсот","девятьсот"];
  function chunk(x) {
    const p = [];
    if (x>=100) p.push(hunds[Math.floor(x/100)]);
    x%=100;
    if (x>=10&&x<20) p.push(teens[x-10]);
    else { if(Math.floor(x/10)) p.push(tens[Math.floor(x/10)]); if(x%10) p.push(units[x%10]); }
    return p.join(" ");
  }
  n = parseInt(n)||0;
  if (!n) return "";
  const parts=[];
  const t=Math.floor(n/1000);
  if (t) {
    parts.push(chunk(t));
    const l=t%10;
    if (l===1&&t%100!==11) parts.push("тысяча");
    else if ([2,3,4].includes(l)&&![12,13,14].includes(t%100)) parts.push("тысячи");
    else parts.push("тысяч");
  }
  if (n%1000) parts.push(chunk(n%1000));
  return parts.join(" ");
}

export default function Step3Premise({ formData, update, extractFromFile, onNext, onBack }) {
  const [extracting, setExtracting] = useState(false);
  const fileRef = useRef();
  const fd = formData;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExtracting(true);
    const result = await extractFromFile(file, "premise");
    if (!result.error) update(result);
    setExtracting(false);
  };

  const handleAmountChange = (v) => {
    const clean = v.replace(/\D/g, "");
    update({ sublease_amount: clean, sublease_amount_words: amountToWords(clean) });
  };

  return (
    <div>
      <h2 style={{ fontSize:26, fontWeight:"normal", marginBottom:6, color:"#1A1A1A" }}>Данные помещения</h2>
      <p style={{ color:"#888", fontFamily:"system-ui", fontSize:14, marginBottom:24 }}>
        Адрес и условия субаренды
      </p>

      <Card style={{ background:"#FFFBF0", border:"1px solid #E8D5A3" }}>
        <SectionTitle>🤖 Автозаполнение из документа</SectionTitle>
        <ExtractBtn onClick={() => fileRef.current.click()} loading={extracting}>
          📎 Загрузить документ на помещение
        </ExtractBtn>
        <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display:"none" }} onChange={handleFile} />
      </Card>

      <Card>
        <SectionTitle>Идентификация помещения</SectionTitle>
        <Field label="Кадастровый номер">
          <Input value={fd.cadastral_number} onChange={v => update({ cadastral_number: v })}
                 placeholder="10:04:40:02:03:0083/0002" />
        </Field>
        <Field label="Адрес помещения по e-ijara (латиница)">
          <Input value={fd.premise_address} onChange={v => update({ premise_address: v })}
                 placeholder="Toshkent shahri, Yashnobod tumani, ..." />
        </Field>
      </Card>

      <Card>
        <SectionTitle>Сроки и сумма</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Field label="Аренда с">
            <Input value={fd.lease_from} onChange={v => update({ lease_from: v })} placeholder="«01» января 2026 г." />
          </Field>
          <Field label="Аренда по">
            <Input value={fd.lease_to} onChange={v => update({ lease_to: v })} placeholder="«31» декабря 2028 г." />
          </Field>
        </div>
        <Field label="Дата окончания субаренды (на 1 день раньше e-ijara)">
          <Input value={fd.sublease_end_date} onChange={v => update({ sublease_end_date: v })} placeholder="«31» декабря 2028 г." />
        </Field>
        <Field label="Сумма субаренды (сум/мес)" hint="Введите цифрами — пропись заполнится автоматически">
          <Input value={fd.sublease_amount} onChange={handleAmountChange} placeholder="64000" />
        </Field>
        {fd.sublease_amount_words && (
          <div style={{ background:"#F0F8F0", border:"1px solid #C0DDB8", borderRadius:7,
                        padding:"10px 14px", fontFamily:"system-ui", fontSize:13, color:"#2E7D32", marginTop:-8 }}>
            Прописью: <strong>{fd.sublease_amount_words}</strong>
          </div>
        )}
      </Card>

      <div style={{ display:"flex", gap:12 }}>
        <Btn secondary onClick={onBack}>← Назад</Btn>
        <Btn onClick={onNext} style={{ flex:1 }}>Проверка →</Btn>
      </div>
    </div>
  );
}
