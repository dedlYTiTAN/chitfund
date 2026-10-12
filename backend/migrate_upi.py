import sqlite3

def migrate():
    conn = sqlite3.connect('chitfund.db')
    cursor = conn.cursor()
    
    # Check existing columns
    cols = [c[1] for c in cursor.execute('PRAGMA table_info(users)').fetchall()]
    print("Existing columns in users table:", cols)
    
    if 'upi_id' not in cols:
        cursor.execute('ALTER TABLE users ADD COLUMN upi_id VARCHAR')
        print("Successfully added upi_id column to users table.")
    else:
        print("upi_id column already exists.")
        
    # Populate default UPI IDs for seeded accounts
    cursor.execute("UPDATE users SET upi_id = 'testinvestor@okhdfcbank' WHERE id = '00000000-0000-0000-0000-000000000000' AND (upi_id IS NULL OR upi_id = '')")
    cursor.execute("UPDATE users SET upi_id = 'admin@okhdfcbank' WHERE id = '11111111-1111-1111-1111-111111111111' AND (upi_id IS NULL OR upi_id = '')")
    cursor.execute("UPDATE users SET upi_id = 'investor@okhdfcbank' WHERE (upi_id IS NULL OR upi_id = '')")
    
    conn.commit()
    
    users = cursor.execute("SELECT id, full_name, phone_number, upi_id FROM users").fetchall()
    print("Current users with UPI IDs:")
    for u in users:
        print(f"  - {u[0][:8]}: {u[1]} -> UPI: {u[3]}")
    conn.close()

if __name__ == '__main__':
    migrate()
