from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import base64, json, os
from typing import Optional
from google_docs import create_documents
from ai_extract import extract_from_image, extract_from_text

app = FastAPI(title="PVZ Contract Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/extract")
async def extract_data(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    doc_type: str = Form("passport")  # passport | ip_cert | premise
):
    """ИИ извлекает данные из фото или текста"""
    if file:
        content = await file.read()
        b64 = base64.b64encode(content).decode()
        result = extract_from_image(b64, file.content_type, doc_type)
    elif text:
        result = extract_from_text(text, doc_type)
    else:
        raise HTTPException(400, "Нужен файл или текст")
    return result


@app.post("/api/generate")
async def generate_docs(data: dict):
    """Генерирует договоры через Google Docs API"""
    try:
        links = create_documents(data)
        return {"success": True, "links": links}
    except Exception as e:
        import traceback
        raise HTTPException(500, str(e) + "\n" + traceback.format_exc())


@app.post("/api/validate")
async def validate_fields(data: dict):
    """Валидация полей перед генерацией"""
    errors = {}
    
    pinfl = str(data.get("pinfl", "")).replace(" ", "")
    if pinfl and len(pinfl) != 14:
        errors["pinfl"] = f"ПИНФЛ должен быть 14 цифр (сейчас {len(pinfl)})"
    
    mfo = str(data.get("bank_mfo", "")).replace(" ", "")
    if mfo and len(mfo) != 5:
        errors["bank_mfo"] = f"МФО должен быть 5 цифр (сейчас {len(mfo)})"
    
    rs = str(data.get("bank_account", "")).replace(" ", "")
    if rs and len(rs) != 20:
        errors["bank_account"] = f"Расчётный счёт должен быть 20 цифр (сейчас {len(rs)})"

    return {"valid": len(errors) == 0, "errors": errors}
