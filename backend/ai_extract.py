import anthropic, json, os

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

PROMPTS = {
    "passport": """Ты извлекаешь данные из фото паспорта Узбекистана.
Верни JSON со следующими полями (пустая строка если не найдено):
{
  "landlord_full_name_latin": "ФИО латиницей ЗАГЛАВНЫМИ (как в паспорте)",
  "landlord_fio_ru": "Фамилия И.О. на кириллице",
  "landlord_birth_date": "дата рождения ДД.ММ.ГГГГ",
  "landlord_passport": "серия и номер паспорта (напр. AB 1234567)",
  "landlord_passport_by": "кем выдан паспорт",
  "landlord_passport_date": "дата выдачи паспорта ДД.ММ.ГГГГ",
  "landlord_pinfl": "ПИНФЛ (14 цифр)",
  "landlord_address_ru": "адрес прописки на кириллице"
}
Верни ТОЛЬКО JSON, без пояснений.""",

    "ip_cert": """Ты извлекаешь данные из свидетельства о регистрации ИП Узбекистана.
Верни JSON:
{
  "partner_legal_name": "полное название ИП с кавычками (напр. ИП \"IVANOV IVAN\")",
  "partner_reg_date": "дата регистрации ДД.ММ.ГГГГ",
  "partner_reg_number": "номер регистрации",
  "partner_pinfl": "ПИНФЛ владельца (14 цифр)",
  "partner_address": "юридический адрес"
}
Верни ТОЛЬКО JSON, без пояснений.""",

    "premise": """Ты извлекаешь данные о помещении из документа.
Верни JSON:
{
  "cadastral_number": "кадастровый номер",
  "premise_address": "адрес помещения на латинице (как в e-ijara)",
  "premise_area": "площадь в кв.м."
}
Верни ТОЛЬКО JSON, без пояснений.""",

    "text": """Ты извлекаешь данные из текста (скопированного из ТГ чата).
Определи какие данные есть и верни JSON с любыми из этих полей:
partner_legal_name, partner_fio_ru, partner_reg_date, partner_reg_number,
partner_pinfl, partner_address, partner_email,
landlord_full_name_latin, landlord_fio_ru, landlord_birth_date,
landlord_passport, landlord_passport_by, landlord_passport_date,
landlord_pinfl, landlord_address_ru, landlord_address_ejara,
bank_account, bank_mfo, bank_inn, bank_name,
cadastral_number, premise_address, sublease_amount.
Верни ТОЛЬКО JSON с найденными полями, без пояснений."""
}


def extract_from_image(b64_image: str, media_type: str, doc_type: str) -> dict:
    prompt = PROMPTS.get(doc_type, PROMPTS["text"])
    
    resp = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": b64_image}},
                {"type": "text", "text": prompt}
            ]
        }]
    )
    
    text = resp.content[0].text.strip()
    # Убираем markdown блоки если есть
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    
    try:
        return json.loads(text)
    except:
        return {"error": "Не удалось распознать документ", "raw": text}


def extract_from_text(text: str, doc_type: str = "text") -> dict:
    prompt = PROMPTS.get(doc_type, PROMPTS["text"])
    
    resp = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"{prompt}\n\nТекст для анализа:\n{text}"
        }]
    )
    
    raw = resp.content[0].text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    
    try:
        return json.loads(raw)
    except:
        return {"error": "Не удалось распознать текст", "raw": raw}
