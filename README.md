# PVZ Contract Generator — Uzum Market

Веб-приложение для автоматической генерации договоров ПВЗ (аренда, субаренда, акцепт оферты).

## Что умеет

- Wizard-интерфейс с 5 шагами
- ИИ-распознавание паспортов, свидетельств ИП и документов на помещение
- Автоматический выбор нужного шаблона по типу партнёра (ИП/ООО/СП) и арендодателя (ФИЗ/ООО/ИП/Собственник)
- Генерация до 4 документов за раз (Акцепт, Субаренда, Аренда, Соглашение)
- Сумма прописью автоматически
- Валидация ПИНФЛ, МФО, расчётного счёта

## Быстрый запуск (без Docker)

### Бэкенд
```bash
cd backend
pip install -r requirements.txt

# Скопируйте service_account.json в папку backend/
cp /путь/к/service_account.json ./service_account.json

# Запуск
ANTHROPIC_API_KEY=sk-ant-... uvicorn main:app --reload --port 8000
```

### Фронтенд
```bash
cd frontend
npm install
npm run dev
# Открыть http://localhost:3000
```

## Запуск через Docker

```bash
# Скопируйте service_account.json в папку backend/
cp /путь/к/service_account.json backend/service_account.json

# Создайте .env файл
echo "ANTHROPIC_API_KEY=sk-ant-ваш-ключ" > .env

# Запуск
docker compose up -d
```

Приложение будет доступно на http://your-server:3000

## Структура проекта

```
pvz-docs/
├── backend/
│   ├── main.py           # FastAPI сервер
│   ├── google_docs.py    # Работа с Google Docs API
│   ├── ai_extract.py     # ИИ-извлечение данных через Claude
│   ├── requirements.txt
│   └── service_account.json  # ← положить сюда
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── steps/        # Шаги wizard
│   │   └── components/   # UI компоненты
│   └── ...
└── docker-compose.yml
```

## Где взять ANTHROPIC_API_KEY

1. Зайти на https://console.anthropic.com
2. API Keys → Create Key
3. Скопировать ключ

## Шаблоны договоров

Все шаблоны уже настроены в `backend/google_docs.py` → `TEMPLATES`.
Плейсхолдеры в шаблонах имеют вид `[[Название поля]]` — они автоматически
заменяются данными из формы.

## Добавление нового типа шаблона

В `backend/google_docs.py` в словарь `TEMPLATES["LEASE"]` добавьте:
```python
"НовыйТип-ИП": "Google_Doc_ID_шаблона"
```
