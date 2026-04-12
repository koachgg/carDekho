CREATE TABLE IF NOT EXISTS cars (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT NOT NULL,
  price_lakh REAL NOT NULL,
  fuel_type TEXT NOT NULL,
  transmission TEXT NOT NULL,
  body_type TEXT NOT NULL,
  seating INTEGER NOT NULL,
  mileage_kmpl REAL,
  engine_cc INTEGER,
  power_bhp REAL,
  torque_nm REAL,
  boot_liters INTEGER,
  safety_rating REAL,
  running_cost_per_km REAL,
  image_url TEXT NOT NULL,
  image_url_2 TEXT,
  image_url_3 TEXT,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id INTEGER NOT NULL REFERENCES cars(id),
  reviewer_name TEXT NOT NULL,
  reviewer_type TEXT NOT NULL,
  rating INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  ownership_months INTEGER,
  pros TEXT,
  cons TEXT,
  helpful_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  preference_vector TEXT,
  conversation_history TEXT,
  confidence_score INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_summaries (
  car_id INTEGER PRIMARY KEY REFERENCES cars(id),
  summary TEXT NOT NULL,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
