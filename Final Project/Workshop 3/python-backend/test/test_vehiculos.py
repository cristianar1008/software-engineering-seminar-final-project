def crear_vehiculo(client, placa="ABC-123", modelo="Sedan", marca="MarcaX"):
    payload = {
        "placa": placa,
        "modelo": modelo,
        "marca": marca,
    }
    return client.post("/api/v1/vehiculos", json=payload)


def test_crear_listar_y_obtener_vehiculo(test_client):
    # Crear vehículo
    res = crear_vehiculo(test_client, placa="XYZ-999", modelo="SUV", marca="MarcaY")
    assert res.status_code == 201
    veh = res.json()
    assert veh["id"] == 1
    assert veh["placa"] == "XYZ-999"

    # Listar
    res_list = test_client.get("/api/v1/vehiculos")
    assert res_list.status_code == 200
    items = res_list.json()
    assert len(items) == 1

    # Obtener por id
    res_get = test_client.get("/api/v1/vehiculos/1")
    assert res_get.status_code == 200
    assert res_get.json()["placa"] == "XYZ-999"


def test_actualizar_vehiculo_conflicto_placa_unica(test_client):
    # Crear dos vehículos con placas distintas
    res1 = crear_vehiculo(test_client, placa="PLK-111", modelo="Hatch", marca="MarcaA")
    assert res1.status_code == 201
    id1 = res1.json()["id"]

    res2 = crear_vehiculo(test_client, placa="PLK-222", modelo="Coupe", marca="MarcaB")
    assert res2.status_code == 201
    id2 = res2.json()["id"]

    # Intentar actualizar el segundo con la placa del primero
    res_put = test_client.put(f"/api/v1/vehiculos/{id2}", json={"placa": "PLK-111"})
    assert res_put.status_code == 400
    assert res_put.json()["detail"] == "Placa ya existe"