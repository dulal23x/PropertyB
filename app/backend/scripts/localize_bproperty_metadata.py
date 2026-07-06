import sqlite3
from pathlib import Path

DB_PATH = Path(r"C:\realestatesite\app\backend\realestate_mvp_v1.db")

metadata = [
    {"title": "Lake Placid | Luxurious Flat Sale in Gulshan", "price": 50000000, "area": "Gulshan 2"},
    {"title": "Spacious 4-bedroom Premium Apartment for Sale", "price": 45000000, "area": "North Gulshan"},
    {"title": "Luxury Flat for Sale in Bashundhara", "price": 32000000, "area": "Block I, Bashundhara"},
    {"title": "Luxury Banani Apartment for Sale by Signature 11", "price": 60000000, "area": "Banani"},
    {"title": "Premium Gulshan Apartment for Sale", "price": 55000000, "area": "Gulshan"},
    {"title": "Elite Apartment for Sale in Gulshan", "price": 75000000, "area": "Gulshan North"},
    {"title": "Plot - 2853, Block - I Bashundhara R/A, Dhaka", "price": 28000000, "area": "Block I, Bashundhara"},
    {"title": "REGENT PALACE | Exclusive Flat for Sale in Dhaka", "price": 18000000, "area": "Adabor 1, Mohammadpur"},
    {"title": "Modern Studio Apartment in Uttara", "price": 8500000, "area": "Sector 3, Uttara"},
    {"title": "Duplex Villa with Garden in Baridhara", "price": 120000000, "area": "Baridhara"},
    {"title": "Commercial Office Space in Motijheel", "price": 25000000, "area": "Motijheel"}
]

def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # Update first 11 listings
    cur.execute("SELECT id FROM property_listings ORDER BY id LIMIT 11")
    ids = [row[0] for row in cur.fetchall()]
    
    for i, lid in enumerate(ids):
        data = metadata[i]
        cur.execute("""
            UPDATE property_listings 
            SET title = ?, price_amount = ?, area_name = ?
            WHERE id = ?
        """, (data["title"], data["price"], data["area"], lid))
        print(f"Updated listing {lid}: {data['title']}")
        
    conn.commit()
    conn.close()

if __name__ == "__main__":
    main()
