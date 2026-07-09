from pydantic import BaseModel

class Product(BaseModel):
    id: int
    name: str
    desc: str
    price: float
    qty: int

