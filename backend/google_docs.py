import json, time, base64, requests, os
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
from cryptography.hazmat.backends import default_backend

# ─── CONFIG ───────────────────────────────────────────────
FOLDER_ID = '1sl5-3fuMNJmPLVafM_bWWgfUUKmyX_8z'

TEMPLATES = {
    "ACCEPT": {
        "ИП":  "1hw1giH2lTNHmz6QL3Bl5gOYHnBJjVn3nwD34FnAvCXM",
        "ООО": "14DlZRlDljhF3pQchQq4c-rm2QUR0liOnhO2pksBndos",
        "СП":  "1hMsx2qbmMSNPuI-wduLuRWOtkNWt48PbvL4SG3x_SZw",
    },
    "SUBLEASE": {
        "ИП":  "1VrEzspA2jeBqUoWI01o7wemznAji_OFB9V83I_qpF-Q",
        "ООО": "1vYihKJOwzmBGlrmfZopcIWZm-O2QIAA9JIgBmsmFPGU",
        "СП":  "1InI8CwwsMlWX_o5fJivnB2iIOPb4n94MjpWkLlwFyW8",
    },
    "LEASE": {
        "ФИЗ-ИП":          "1uCPw3X-wkKix5wiAEYcsdYdVtBhOPgFyoTg6gJK5XSk",
        "ФИЗ-ООО":         "1sEyonkgCB0HGpipVBx9Az08aSpalaD9zuyTAgdAzw6E",
        "ФИЗ-СП":          "16BqRtz-c2PXG13ByQBYlo6JDYxbuPnDIlItfwgYcIMI",
        "ООО-ИП":          "1oYnRtxalZ46d_7eaMzBKasI3RJYjQW4MYYonzDr6nl4",
        "ООО-ООО":         "1pTceUj4izLkpJDLqJE6flquyrRYqEu9AKWHkCvDgOy0",
        "Собственник-ИП":  "1_WjMmSwNvXgwWj-HJkUSJzq6FIlTaDD1NzZgLV8lOo0",
        "Собственник-ООО": "1YDDouNpbYAO7ztiNjd0_t2eoAyLyjkPGTMmReiOm6wI",
    },
    "AGREEMENT": "1YAbnW1qORdakyLrc5nPbNmbVSZdbPieuCgqFcmh3RC4",
}

# ─── AUTH ─────────────────────────────────────────────────
SA_PATH = os.getenv("SA_PATH", "service_account.json")

def _get_token():
    sa_json = os.getenv("GOOGLE_SA_JSON")
    if sa_json:
        sa = json.loads(sa_json)
    else:
        sa_path = os.getenv("SA_PATH", "service_account.json")
        with open(sa_path) as f:
            sa = json.load(f)
    now = int(time.time())
    header  = base64.urlsafe_b64encode(json.dumps({"alg":"RS256","typ":"JWT"}).encode()).rstrip(b'=')
    payload = base64.urlsafe_b64encode(json.dumps({
        "iss":  sa['client_email'],
        "scope": "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents",
        "aud":  "https://oauth2.googleapis.com/token",
        "exp":  now + 3600,
        "iat":  now,
    }).encode()).rstrip(b'=')
    msg = header + b'.' + payload
    key = serialization.load_pem_private_key(sa['private_key'].encode(), password=None, backend=default_backend())
    sig = key.sign(msg, asym_padding.PKCS1v15(), hashes.SHA256())
    jwt = msg + b'.' + base64.urlsafe_b64encode(sig).rstrip(b'=')
    resp = requests.post("https://oauth2.googleapis.com/token",
        data={"grant_type":"urn:ietf:params:oauth:grant-type:jwt-bearer","assertion":jwt.decode()})
    resp.raise_for_status()
    return resp.json()['access_token']

# ─── HELPERS ──────────────────────────────────────────────
def _copy_template(token, template_id, name):
    resp = requests.post(
        f"https://www.googleapis.com/drive/v3/files/{template_id}/copy",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"name": name, "parents": [FOLDER_ID]}
    )
    resp.raise_for_status()
    return resp.json()['id']
    
    # Загружаем как новый файл в папку
    from io import BytesIO
    metadata = json.dumps({"name": name, "parents": [FOLDER_ID]})
    upload_resp = requests.post(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        headers={"Authorization": f"Bearer {token}"},
        files={
            "metadata": ("metadata", metadata, "application/json"),
            "file": (name + ".docx", BytesIO(resp.content), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        }
    )
    upload_resp.raise_for_status()
    return upload_resp.json()['id']
def _replace_placeholders(token, doc_id, replacements):
    requests_body = [
        {"replaceAllText": {
            "containsText": {"text": key, "matchCase": True},
            "replaceText": str(val)
        }}
        for key, val in replacements.items()
    ]
    resp = requests.post(
        f"https://docs.googleapis.com/v1/documents/{doc_id}:batchUpdate",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"requests": requests_body}
    )
    resp.raise_for_status()

def _doc_url(doc_id):
    return f"https://docs.google.com/document/d/{doc_id}/edit"

# ─── AMOUNT TO WORDS ──────────────────────────────────────
def amount_to_words(n):
    units   = ["","один","два","три","четыре","пять","шесть","семь","восемь","девять"]
    teens   = ["десять","одиннадцать","двенадцать","тринадцать","четырнадцать",
               "пятнадцать","шестнадцать","семнадцать","восемнадцать","девятнадцать"]
    tens_w  = ["","","двадцать","тридцать","сорок","пятьдесят",
               "шестьдесят","семьдесят","восемьдесят","девяносто"]
    hundreds_w = ["","сто","двести","триста","четыреста","пятьсот",
                  "шестьсот","семьсот","восемьсот","девятьсот"]

    def _chunk(x):
        parts = []
        if x // 100: parts.append(hundreds_w[x // 100])
        x %= 100
        if 10 <= x < 20: parts.append(teens[x-10])
        else:
            if x // 10: parts.append(tens_w[x // 10])
            if x % 10:  parts.append(units[x % 10])
        return " ".join(parts)

    n = int(n)
    if n == 0: return "ноль"
    result = []
    t = n // 1000
    if t:
        result.append(_chunk(t))
        last = t % 10
        if   last == 1 and t % 100 != 11: result.append("тысяча")
        elif last in (2,3,4) and t%100 not in (12,13,14): result.append("тысячи")
        else: result.append("тысяч")
    rem = n % 1000
    if rem: result.append(_chunk(rem))
    return " ".join(result)

# ─── MAIN ─────────────────────────────────────────────────
def build_replacements(data: dict) -> dict:
    """Конвертирует данные формы в плейсхолдеры шаблона"""
    amount = data.get("sublease_amount", "")
    try:
        amount_words = amount_to_words(int(str(amount).replace(" ", "").replace("\u202f", "")))
    except:
        amount_words = ""

    return {
        "[[«число» месяц год]]":                   data.get("contract_date", ""),
        "[[номер договора акцепта]]":              data.get("accept_number", ""),
        "[[номер договора аренды]]":               data.get("sublease_number", ""),
        "[[Юридическое лицо]]":                    data.get("partner_legal_name", ""),
        "[[Фамилия И.О.]]":                        data.get("partner_fio_ru", ""),
        "[[дата регистрации]]":                    data.get("partner_reg_date", ""),
        "[[номер регистрации]]":                   data.get("partner_reg_number", ""),
        "[[Адрес юр лица]]":                       data.get("partner_address", ""),
        "[[ПИНФЛ]]":                               data.get("partner_pinfl", ""),
        "[[Электронная почта]]":                   data.get("partner_email", ""),
        "[[Название компании]]":                   data.get("company_name", ""),
        "[[ИНН компании]]":                        data.get("company_inn", ""),
        "[[Юридический адрес компании]]":          data.get("company_address", ""),
        "[[Физ лицо]]":                            data.get("landlord_full_name_latin", ""),
        "[[Расчетный счет]]":                      data.get("bank_account", ""),
        "[[МФО]]":                                 data.get("bank_mfo", ""),
        "[[ИНН банка]]":                           data.get("bank_inn", ""),
        "[[Адрес офиса банка]]":                   data.get("bank_name", ""),
        "[[Срок действия договора аренда с]]":     data.get("lease_from", ""),
        "[[Срок действия договора аренда по]]":    data.get("lease_to", ""),
        "[[кадастровый номер]]":                   data.get("cadastral_number", ""),
        "[[Адрес помещения]]":                     data.get("premise_address", ""),
        "[[сумма субаренды]]":                     amount,
        "[[сумма субаренды прописью]]":            amount_words,
        "[[«число» месяц год окончания субаренды]]": data.get("sublease_end_date", ""),
        "[[ФИО Арендодателя]]":                    data.get("landlord_full_name_latin", ""),
        "[[дата рождения арендотателя]]":          data.get("landlord_birth_date", ""),
        "[[Адрес проживания арендодателя]]":       data.get("landlord_address_ejara", ""),
        "[[серия паспорта арендодателя]]":         data.get("landlord_passport", ""),
        "[[парпорт выдан кем (арендодатель)]]":    data.get("landlord_passport_by", ""),
        "[[дата выдачи паспорта (арендодателя)]]": data.get("landlord_passport_date", ""),
        "[[ПИНФЛ арендодателя]]":                  data.get("landlord_pinfl", ""),
        "[[Адрес арендодателя]]":                  data.get("landlord_address_ru", ""),
        "[[Фамилия И.О. Арендодателя]]":           data.get("landlord_fio_ru", ""),
        "[[ИНН АРДД]]":                            data.get("landlord_inn", ""),
        "[[ЧП АРДД]]":                             data.get("landlord_company_name", ""),
        "[[Номер карты арендодателя]]":            data.get("landlord_card", ""),
        "[[Расчетный счет арендодателя]]":         data.get("landlord_bank_account", ""),
        "[[МФО арендодателя]]":                    data.get("landlord_bank_mfo", ""),
        "[[ИНН банка арендодателя]]":              data.get("landlord_bank_inn", ""),
        "[[Банк арендодателя]]":                   data.get("landlord_bank_name", ""),
    }


def create_documents(data: dict) -> dict:
    """Основная функция — создаёт все нужные договора"""
    token = _get_token()

    partner_type = data.get("partner_type", "ИП")   # ИП | ООО | СП
    landlord_type = data.get("landlord_type", "ФИЗ") # ФИЗ | ООО | ИП | Собственник
    fio = data.get("partner_fio_ru", "Без имени")
    docs_to_create = data.get("docs", ["accept", "sublease", "lease", "agreement"])

    replacements = build_replacements(data)
    links = {}

    # АКЦЕПТ
    if "accept" in docs_to_create:
        tmpl = TEMPLATES["ACCEPT"].get(partner_type)
        if tmpl:
            doc_id = _copy_template(token, tmpl, f"Акцепт — {fio}")
            _replace_placeholders(token, doc_id, replacements)
            links["accept"] = _doc_url(doc_id)

    # СУБАРЕНДА
    if "sublease" in docs_to_create:
        tmpl = TEMPLATES["SUBLEASE"].get(partner_type)
        if tmpl:
            doc_id = _copy_template(token, tmpl, f"Субаренда — {fio}")
            _replace_placeholders(token, doc_id, replacements)
            links["sublease"] = _doc_url(doc_id)

    # АРЕНДА (ключ: арендодатель-партнер, напр. "ФИЗ-ИП")
    if "lease" in docs_to_create and landlord_type != "Собственник":
        lease_key = f"{landlord_type}-{partner_type}"
        tmpl = TEMPLATES["LEASE"].get(lease_key)
        if tmpl:
            doc_id = _copy_template(token, tmpl, f"Аренда — {fio}")
            _replace_placeholders(token, doc_id, replacements)
            links["lease"] = _doc_url(doc_id)

    # СОГЛАШЕНИЕ
    if "agreement" in docs_to_create:
        tmpl = TEMPLATES["AGREEMENT"]
        doc_id = _copy_template(token, tmpl, f"Соглашение — {fio}")
        _replace_placeholders(token, doc_id, replacements)
        links["agreement"] = _doc_url(doc_id)

    return links
