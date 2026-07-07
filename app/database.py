from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app import settings


Base = declarative_base()

sqlalchemy_database_url = f"postgresql://{settings.database_username}:{settings.database_password}@{settings.database_hostname}:{settings.database_port}/{settings.database_name}"
engine = create_engine(sqlalchemy_database_url, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

