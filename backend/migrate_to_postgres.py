import os
import csv
import io
import uuid
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import Base, ApprovedStudent

def main():
    print("Starting migration...")
    # Setup SQLite
    sqlite_engine = create_engine("sqlite:///./ite.db")
    
    # Setup Postgres
    pg_url = os.getenv("DATABASE_URL", "postgresql://ite_user:ite_password@db:5432/ite_db")
    pg_engine = create_engine(pg_url)
    
    # Create tables in Postgres
    print("Creating tables in PostgreSQL...")
    Base.metadata.create_all(bind=pg_engine)
    
    # 1. Migrate SQLite to Postgres
    print("Migrating SQLite to Postgres...")
    with sqlite_engine.connect() as sqlite_conn:
        # Get all tables
        tables = sqlite_engine.dialect.get_table_names(sqlite_conn)
        for table in tables:
            print(f"Migrating table: {table}")
            rows = sqlite_conn.execute(text(f"SELECT * FROM {table}")).fetchall()
            if not rows:
                print(f"  - No rows in {table}, skipping.")
                continue
            
            table_obj = Base.metadata.tables[table]
            bool_cols = [c.name for c in table_obj.columns if c.type.python_type == bool]

            with pg_engine.begin() as pg_conn:
                # clear existing
                pg_conn.execute(text(f"DELETE FROM {table}"))
                
                keys = rows[0]._mapping.keys()
                cols = ", ".join(keys)
                placeholders = ", ".join(f":{k}" for k in keys)
                insert_sql = text(f"INSERT INTO {table} ({cols}) VALUES ({placeholders})")
                
                data = []
                for row in rows:
                    row_dict = dict(row._mapping)
                    for k, v in row_dict.items():
                        if k in bool_cols:
                            row_dict[k] = bool(v)
                        elif isinstance(v, str) and (v.startswith('[') or v.startswith('{')):
                            try:
                                # Ensure valid JSON string is passed, or parse and let psycopg2 handle
                                row_dict[k] = json.dumps(json.loads(v))
                            except ValueError:
                                pass
                    data.append(row_dict)
                pg_conn.execute(insert_sql, data)
                print(f"  - Migrated {len(data)} rows.")

    print("Migration from SQLite complete.")

    # 2. Seed from CSV
    print("Seeding missing approved students from CSV...")
    csv_path = "../ITE_2026_Students.csv"
    PgSession = sessionmaker(bind=pg_engine)
    pg_db = PgSession()

    if os.path.exists(csv_path):
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            if reader.fieldnames:
                reader.fieldnames = [str(f).strip().lower() for f in reader.fieldnames]
            
            added = 0
            for row in reader:
                email = row.get("email", row.get("student email", "")).strip()
                if not email:
                    continue
                exists = pg_db.query(ApprovedStudent).filter(ApprovedStudent.email == email).first()
                if not exists:
                    name = row.get("name", row.get("student name", "")).strip()
                    roll_no = row.get("rollno", row.get("enrollment no.", "")).strip()
                    new_student = ApprovedStudent(
                        id=str(uuid.uuid4()),
                        name=name,
                        roll_no=roll_no,
                        email=email
                    )
                    pg_db.add(new_student)
                    added += 1
            pg_db.commit()
            print(f"Added {added} missing students from CSV.")
    else:
        print(f"CSV not found at {csv_path}")

    pg_db.close()
    print("All done!")

if __name__ == "__main__":
    main()
