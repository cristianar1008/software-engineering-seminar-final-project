import pytest
from pydantic import ValidationError
from app.api.v1.academico import (
    _intervals_overlap,
    ScheduleBase,
    ClaseTipo,
    CourseBase,
    CourseUpdate,
)


def test_intervals_overlap():
    assert _intervals_overlap("08:00", "09:00", "08:30", "08:45") is True
    assert _intervals_overlap("08:00", "09:00", "09:00", "10:00") is False
    assert _intervals_overlap("08:00", "09:00", "07:00", "08:00") is False


def test_intervals_overlap_identical_interval():
    assert _intervals_overlap("08:00", "09:00", "08:00", "09:00") is True


def test_intervals_overlap_partial_at_start():
    assert _intervals_overlap("08:00", "09:00", "07:30", "08:30") is True


def test_intervals_no_overlap_far_apart():
    assert _intervals_overlap("06:00", "07:00", "08:00", "09:00") is False


def test_schedule_valid_creation():
    s = ScheduleBase(
        curso_id=1,
        dia_semana=1,
        hora_inicio="08:00",
        hora_fin="09:00",
        aula="A1",
        tipo=ClaseTipo.teorica,
    )
    assert s.dia_semana == 1 and s.hora_inicio == "08:00"


def test_schedule_invalid_time_format():
    with pytest.raises(ValidationError):
        ScheduleBase(
            curso_id=1,
            dia_semana=1,
            hora_inicio="08-00",
            hora_fin="09:00",
            aula="A1",
            tipo=ClaseTipo.teorica,
        )


def test_schedule_end_before_start():
    with pytest.raises(ValidationError):
        ScheduleBase(
            curso_id=1,
            dia_semana=1,
            hora_inicio="09:00",
            hora_fin="08:00",
            aula="A1",
            tipo=ClaseTipo.practica,
        )


def test_schedule_invalid_day():
    with pytest.raises(ValidationError):
        ScheduleBase(
            curso_id=1,
            dia_semana=7,
            hora_inicio="08:00",
            hora_fin="09:00",
            aula="A1",
            tipo=ClaseTipo.teorica,
        )


def test_coursebase_vehiculo_id_validation():
    with pytest.raises(ValidationError):
        CourseBase(
            codigo="MAT101",
            nombre="Matemáticas",
            creditos=3,
            vehiculo_id=0,
        )


def test_coursebase_creditos_non_negative():
    with pytest.raises(ValidationError):
        CourseBase(
            codigo="HIS200",
            nombre="Historia",
            creditos=-1,
        )


def test_courseupdate_creditos_invalid():
    with pytest.raises(ValidationError):
        CourseUpdate(creditos=-5)


def test_courseupdate_valid_empty():
    cu = CourseUpdate()
    assert isinstance(cu, CourseUpdate)


def test_schedule_tipo_invalid_enum():
    with pytest.raises(ValidationError):
        ScheduleBase(
            curso_id=1,
            dia_semana=1,
            hora_inicio="08:00",
            hora_fin="09:00",
            aula="A1",
            tipo="laboratorio",
        )