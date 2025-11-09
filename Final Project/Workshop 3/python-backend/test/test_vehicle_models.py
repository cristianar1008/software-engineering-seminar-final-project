from app.models.vehicle import Vehicle


def test_vehicle_from_mongo():
    doc = {
        "id": 1,
        "placa": "ABC123",
        "modelo": "2020",
        "marca": "Toyota",
        "estado": "activo",
        "fecha_registro": None,
        "tipo_licencia": "B",
        "fecha_salida": None,
    }
    v = Vehicle.from_mongo(doc)
    assert v.id == 1
    assert v.placa == "ABC123"
    assert v.marca == "Toyota"