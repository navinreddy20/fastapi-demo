import uuid
from sqlalchemy import Column, String, Integer, Float
from core.database import Base

def generate_product_id():
    return f"PROD-{uuid.uuid4().hex[:8]}"

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=generate_product_id)
    product_name = Column(String(100))
    product_type = Column(String(100))
    quantity = Column(Integer)
    price = Column(Float)