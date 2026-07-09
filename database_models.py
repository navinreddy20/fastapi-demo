from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, Float, String

Base = declarative_base()

class Product(Base):

    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index = True)
    name = Column(String)
    desc = Column(String)
    price = Column(Float)
    qty = Column(Integer)

