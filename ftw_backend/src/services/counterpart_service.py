from sqlalchemy.orm import Session, joinedload  # type: ignore
from models.counterpart import Counterpart
from database.schemas import CounterpartSchema

class CounterpartService():
    def __init__(self):
        pass

    """
    GET FUNCTIONS
    """

    def get_all_counterparts(self, db: Session, as_schema: bool = False, owner_id: int = None) -> list[Counterpart]:
        if owner_id is not None:
           counterparts = db.query(CounterpartSchema).options(joinedload(CounterpartSchema.category)).filter(CounterpartSchema.owner_id==owner_id).all()
        else:
           counterparts = db.query(CounterpartSchema).options(joinedload(CounterpartSchema.category)).all()
        

        if as_schema:
            return counterparts
        else:
            return [Counterpart.model_validate(counterpart) for counterpart in counterparts]
        
    def get_empty_counterparts(self, db: Session, as_schema: bool = False, owner_id: int = None) -> list[Counterpart]:
        if owner_id is not None:
           counterparts = db.query(CounterpartSchema).options(joinedload(CounterpartSchema.category)).filter(CounterpartSchema.owner_id==owner_id, CounterpartSchema.category_id == None).all()
        else:
           counterparts = db.query(CounterpartSchema).options(joinedload(CounterpartSchema.category)).filter(CounterpartSchema.category_id == None).all()
        

        if as_schema:
            return counterparts
        else:
            return [Counterpart.model_validate(counterpart) for counterpart in counterparts]
    
    def get_counterpart_names(self, db: Session, owner_id: int = None) -> list[str]:
        if owner_id is not None:
           counterparts = db.query(CounterpartSchema).options(joinedload(CounterpartSchema.category)).filter(CounterpartSchema.owner_id==owner_id).all()
        else:
           counterparts = db.query(CounterpartSchema).options(joinedload(CounterpartSchema.category)).all()
        
        return [cp.name for cp in counterparts]

    def get_counterpart_by_name(self, db: Session, name: str, owner_id: int = None) -> CounterpartSchema | None:
        query = db.query(CounterpartSchema).filter(CounterpartSchema.name == name)
        
        if owner_id is not None:
            query = query.filter(CounterpartSchema.owner_id == owner_id)

        counterpart = query.first()
        return counterpart
    
    """
    CREATE FUNCTIONS
    """

    def create_counterpart(self, new_counterpart: Counterpart, db: Session, owner_id: int) -> CounterpartSchema:
        # Check if counterpart with the same name already exists for the owner
        existing_cp = self.get_counterpart_by_name(db=db, name=new_counterpart.name, owner_id=owner_id)
        if existing_cp:
            return existing_cp

        cp = CounterpartSchema(
            name=new_counterpart.name,
            owner_id=owner_id,
            category_id=getattr(new_counterpart, "category_id", None)
        )
        db.add(cp)
        db.commit()
        
        return cp