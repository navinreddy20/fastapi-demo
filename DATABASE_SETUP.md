# PostgreSQL Docker Setup Guide

## Starting the Database

Run the following command from the project root directory:

```bash
docker-compose up -d
```

This will start a PostgreSQL container with:
- **Container Name**: telusko_db
- **Username**: postgres
- **Password**: 12345678
- **Database**: telusko
- **Port**: 5432

## Accessing the Database

### Method 1: Using psql (Command Line)

```bash
# Connect to the database
docker exec -it telusko_db psql -U postgres -d telusko
```

Once connected, you can run SQL commands:
```sql
-- List all tables
\dt

-- List all schemas
\dn

-- Show table structure
\d table_name

-- Run a query
SELECT * FROM table_name;

-- Exit
\q
```

### Method 2: Using Python (SQLAlchemy)

Your FastAPI application already has the connection configured. You can use:

```python
from database import SessionLocal, engine
from database_models import Base

# Create all tables
Base.metadata.create_all(bind=engine)

# Get a session
db = SessionLocal()

# Query data
from models import YourModel
results = db.query(YourModel).all()
```

### Method 3: Using DBeaver or pgAdmin (GUI Tools)

**Connection Details:**
- Host: localhost
- Port: 5432
- Database: telusko
- Username: postgres
- Password: 12345678

## Common Docker Commands

```bash
# Stop the database
docker-compose down

# View logs
docker-compose logs -f postgres

# Remove container and volumes (careful!)
docker-compose down -v

# Check container status
docker ps

# Access container shell
docker exec -it telusko_db bash
```

## Verify Connection

Once running, verify the connection works:

```bash
docker exec -it telusko_db psql -U postgres -d telusko -c "\dt"
```

This will list all tables in your database.
