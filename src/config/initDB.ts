import { pool } from "./db";

export const initDB = async () => {
  // 1. Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      total_points INT DEFAULT 0,
      exact_scores INT DEFAULT 0,
      correct_winners INT DEFAULT 0,
      wrong_predictions INT DEFAULT 0,
      missed_predictions INT DEFAULT 0,
      champion_correct BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Add missing columns safely if users table already existed before
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS total_points INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS exact_scores INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS correct_winners INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS wrong_predictions INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS missed_predictions INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS champion_correct BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
  `);

  // 2. Matches / fixtures table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      match_no INT UNIQUE,
      team_a VARCHAR(100),
      team_b VARCHAR(100),
      team_a_placeholder VARCHAR(150),
      team_b_placeholder VARCHAR(150),
      match_date DATE NOT NULL,
      match_time TIME NOT NULL,
      kickoff_at TIMESTAMPTZ NOT NULL,
      stage VARCHAR(30) NOT NULL,
      round_name VARCHAR(50),
      group_name VARCHAR(50),
      venue VARCHAR(150),
      status VARCHAR(20) DEFAULT 'upcoming',
      actual_team_a_score INT,
      actual_team_b_score INT,
      actual_qualifier VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Add missing columns safely if matches table already existed before
  await pool.query(`
    ALTER TABLE matches
    ADD COLUMN IF NOT EXISTS match_no INT UNIQUE,
    ADD COLUMN IF NOT EXISTS team_a VARCHAR(100),
    ADD COLUMN IF NOT EXISTS team_b VARCHAR(100),
    ADD COLUMN IF NOT EXISTS team_a_placeholder VARCHAR(150),
    ADD COLUMN IF NOT EXISTS team_b_placeholder VARCHAR(150),
    ADD COLUMN IF NOT EXISTS match_date DATE,
    ADD COLUMN IF NOT EXISTS match_time TIME,
    ADD COLUMN IF NOT EXISTS kickoff_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS stage VARCHAR(30),
    ADD COLUMN IF NOT EXISTS round_name VARCHAR(50),
    ADD COLUMN IF NOT EXISTS group_name VARCHAR(50),
    ADD COLUMN IF NOT EXISTS venue VARCHAR(150),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'upcoming',
    ADD COLUMN IF NOT EXISTS actual_team_a_score INT,
    ADD COLUMN IF NOT EXISTS actual_team_b_score INT,
    ADD COLUMN IF NOT EXISTS actual_qualifier VARCHAR(100),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
  `);

  // 3. Predictions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS predictions (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      predicted_team_a_score INT NOT NULL,
      predicted_team_b_score INT NOT NULL,
      predicted_qualifier VARCHAR(100),
      points INT DEFAULT 0,
      is_exact_score BOOLEAN DEFAULT false,
      is_correct_winner BOOLEAN DEFAULT false,
      is_correct_qualifier BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),

      UNIQUE(user_id, match_id)
    );
  `);

  // Add missing columns safely if predictions table already existed before
  await pool.query(`
    ALTER TABLE predictions
    ADD COLUMN IF NOT EXISTS predicted_qualifier VARCHAR(100),
    ADD COLUMN IF NOT EXISTS points INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS is_exact_score BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_correct_winner BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_correct_qualifier BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
  `);

  // 4. Missed predictions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS missed_predictions (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      points INT DEFAULT -1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(user_id, match_id)
    );
  `);

  // Useful indexes
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_predictions_user_id
    ON predictions(user_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_predictions_match_id
    ON predictions(match_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_missed_predictions_user_id
    ON missed_predictions(user_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_missed_predictions_match_id
    ON missed_predictions(match_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_matches_status
    ON matches(status);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_matches_match_date
    ON matches(match_date);
  `);

  console.log("Database tables checked/created successfully");
};
