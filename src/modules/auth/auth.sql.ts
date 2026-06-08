export const AuthSQL = {
  findUserByEmail: `
    SELECT id, name, email, password, role
    FROM users
    WHERE email = $1
  `,

  createUser: `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, total_points, exact_scores, correct_winners, created_at
  `,

  getMe: `
    SELECT id, name, email, role, total_points, exact_scores, correct_winners, champion_correct
    FROM users
    WHERE id = $1
  `,
};
