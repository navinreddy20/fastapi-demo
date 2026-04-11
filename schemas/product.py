from pydantic import BaseModel

class ProductBase(BaseModel):
    product_name: str
    product_type: str
    quantity: int
    price: float

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: str

    class Config:
        from_attributes = True