from  sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine


db_url = "postgresql://postgres:mypswd@localhost:5432/fastapi_db"
engine = create_engine(db_url)
session = sessionmaker(autoflush = False, bind = engine)