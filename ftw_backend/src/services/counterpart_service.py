from sqlalchemy.orm import Session
from models.counterpart import Counterpart
from database.schemas import CounterpartSchema
class CounterpartService():
    def __init__(self):
        pass

    def get_all_counterparts(self, db: Session) -> list[Counterpart]:
        counterparts = db.query(CounterpartSchema).all()

        response = [Counterpart(id=counterpart.id, name=counterpart.name, category_id=counterpart.category_id) for counterpart in counterparts if counterpart.category_id is not None]

        return response