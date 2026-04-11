from sqlalchemy.orm import Session
from models.user import User
from core.security import hash_password

def create_user(db: Session, user):
    db_user = User(
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()