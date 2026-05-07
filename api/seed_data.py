#!/usr/bin/env python3
"""
Seed script to create default user.
This script runs after migrations to set up initial data.
"""
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from sqlalchemy.orm import Session
from src.core.db.pgsql.config import SessionLocal
from src.core.db.pgsql.models import User
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def seed_database():
    """Create default user"""
    db: Session = SessionLocal()
    
    try:
        # Check if default user already exists
        existing_user = db.query(User).filter(User.email == "test@test.com").first()
        if existing_user:
            print("Default user already exists, skipping seed data creation.")
            return
        
        # Create default user
        print("Creating default user...")
        default_user = User(
            email="test@test.com",
            username="test",
            hashed_password=hash_password("test100100"),
            is_active=True,
            is_verified=True
        )
        db.add(default_user)
        db.flush()  # Flush to get the user ID
        
        db.commit()
        print(f"Created user: {default_user.email} (ID: {default_user.id})")
        print("Seed data created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating seed data: {str(e)}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

