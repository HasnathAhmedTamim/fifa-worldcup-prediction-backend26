CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user',

  total_points INT DEFAULT 0,
  exact_scores INT DEFAULT 0,
  correct_winners INT DEFAULT 0,
  champion_correct BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS predictions (
  id SERIAL PRIMARY KEY,

  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  match_id INT REFERENCES matches(id) ON DELETE CASCADE,

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

CREATE TABLE IF NOT EXISTS bonus_predictions (
  id SERIAL PRIMARY KEY,

  user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  champion VARCHAR(100),
  runner_up VARCHAR(100),
  top_scorer VARCHAR(100),

  champion_point INT DEFAULT 0,
  runner_up_point INT DEFAULT 0,
  top_scorer_point INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);