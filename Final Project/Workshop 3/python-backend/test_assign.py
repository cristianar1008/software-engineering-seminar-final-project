import requests
import random

BASE = "http://127.0.0.1:8000/api/v1"

print("Crear curso...")
c = requests.post(
    f"{BASE}/academico/cursos",
    json={
        "codigo": f"CA-{random.randint(100000,999999)}",
        "nombre": "Curso Test",
        "creditos": 3,
    },
)
print("curso:", c.status_code, c.text)
cid = c.json()["id"]

print("Asignar clase teorica...")
payload = {
    "tipo": "teorica",
    "curso_id": cid,
    "profesor_id": random.randint(1, 99999),
    "estudiantes_ids": [random.randint(1, 99999), random.randint(1, 99999)],
    "dia_semana": 0,
    "hora_inicio": "08:00",
    "hora_fin": "09:00",
}
a = requests.post(f"{BASE}/academico/asignar-clase", json=payload)
print("asignar:", a.status_code, a.text)
