def crear_curso(client, codigo="CURS-1", nombre="Curso 1", creditos=3, vehiculo_id=None):
    payload = {
        "codigo": codigo,
        "nombre": nombre,
        "creditos": creditos,
        "vehiculo_id": vehiculo_id,
    }
    return client.post("/api/v1/academico/cursos", json=payload)


def crear_horario(client, curso_id, dia_semana=1, hora_inicio="09:00", hora_fin="10:00", aula="A1", tipo="teorica", vehiculo_id=None):
    payload = {
        "curso_id": curso_id,
        "dia_semana": dia_semana,
        "hora_inicio": hora_inicio,
        "hora_fin": hora_fin,
        "aula": aula,
        "tipo": tipo,
        "vehiculo_id": vehiculo_id,
    }
    return client.post("/api/v1/academico/horarios", json=payload)


def test_crear_listar_curso_y_duplicado_codigo(test_client):
    # Crear curso
    res = crear_curso(test_client, codigo="CURS-100", nombre="Intro", creditos=4)
    assert res.status_code == 201
    curso = res.json()
    assert curso["id"] == 1
    assert curso["codigo"] == "CURS-100"

    # Listar cursos
    res_list = test_client.get("/api/v1/academico/cursos")
    assert res_list.status_code == 200
    assert len(res_list.json()) == 1

    # Intentar crear otro con el mismo código
    res_dup = crear_curso(test_client, codigo="CURS-100", nombre="Otro", creditos=2)
    assert res_dup.status_code == 400
    assert res_dup.json()["detail"] == "Código de curso ya existe"


def test_crear_horario_y_validar_solapamiento(test_client):
    # Crear curso base
    res_curso = crear_curso(test_client, codigo="CURS-200", nombre="Algoritmos", creditos=5)
    curso_id = res_curso.json()["id"]

    # Crear horario 09:00-10:00
    res_h1 = crear_horario(test_client, curso_id=curso_id, dia_semana=2, hora_inicio="09:00", hora_fin="10:00", aula="Lab", tipo="practica")
    assert res_h1.status_code == 201

    # Intentar crear solapado 09:30-10:30 mismo curso/día
    res_h2 = crear_horario(test_client, curso_id=curso_id, dia_semana=2, hora_inicio="09:30", hora_fin="10:30", aula="Aula X", tipo="teorica")
    assert res_h2.status_code == 400
    assert res_h2.json()["detail"] == "Horario solapa con otro del mismo curso y día"


def test_horario_con_vehiculo_id_opcional_en_teorica(test_client):
    # Crear curso
    res_curso = crear_curso(test_client, codigo="CURS-300", nombre="Bases", creditos=3)
    curso_id = res_curso.json()["id"]

    # Crear horario teórico con vehiculo_id
    res_h = crear_horario(test_client, curso_id=curso_id, dia_semana=1, hora_inicio="10:00", hora_fin="11:00", aula="A2", tipo="teorica", vehiculo_id=77)
    assert res_h.status_code == 201
    horario = res_h.json()
    assert horario["vehiculo_id"] == 77


def test_actualizar_curso_asignar_vehiculo_id_libre(test_client):
    # Crear curso
    res_curso = crear_curso(test_client, codigo="CURS-400", nombre="POO", creditos=4)
    curso_id = res_curso.json()["id"]

    # Asignar vehiculo_id sin validar existencia
    res_put = test_client.put(f"/api/v1/academico/cursos/{curso_id}", json={"vehiculo_id": 99})
    assert res_put.status_code == 200
    actualizado = res_put.json()
    assert actualizado["vehiculo_id"] == 99