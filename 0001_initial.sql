-- Migration number: 0001 	 2025-04-07T13:14:00.000Z
-- Trivia App Database Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS buzzer_events;
DROP TABLE IF EXISTS room_users;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS themes;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS users;

-- Create themes table
CREATE TABLE themes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create questions table
CREATE TABLE questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme_id INTEGER,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1, -- 1: Easy, 2: Medium, 3: Hard
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (theme_id) REFERENCES themes(id) ON DELETE SET NULL
);

-- Create rooms table
CREATE TABLE rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  current_question_id INTEGER,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (current_question_id) REFERENCES questions(id) ON DELETE SET NULL
);

-- Create users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create room_users table (junction table for rooms and users)
CREATE TABLE room_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(room_id, user_id)
);

-- Create buzzer_events table
CREATE TABLE buzzer_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  buzz_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Create scores table
CREATE TABLE scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  scored_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_questions_theme_id ON questions(theme_id);
CREATE INDEX idx_rooms_room_code ON rooms(room_code);
CREATE INDEX idx_room_users_room_id ON room_users(room_id);
CREATE INDEX idx_room_users_user_id ON room_users(user_id);
CREATE INDEX idx_buzzer_events_room_id ON buzzer_events(room_id);
CREATE INDEX idx_buzzer_events_user_id ON buzzer_events(user_id);
CREATE INDEX idx_buzzer_events_question_id ON buzzer_events(question_id);
CREATE INDEX idx_scores_room_id ON scores(room_id);
CREATE INDEX idx_scores_user_id ON scores(user_id);

-- Insert sample themes
INSERT INTO themes (name, description) VALUES 
  ('General Knowledge', 'Questions about various general topics'),
  ('Science', 'Questions about scientific facts and discoveries'),
  ('History', 'Questions about historical events and figures'),
  ('Geography', 'Questions about countries, cities, and landmarks'),
  ('Entertainment', 'Questions about movies, music, and pop culture');

-- Insert sample questions
INSERT INTO questions (theme_id, question_text, answer_text, difficulty) VALUES
  (1, 'What is the capital of France?', 'Paris', 1),
  (1, 'Which planet is known as the Red Planet?', 'Mars', 1),
  (2, 'What is the chemical symbol for gold?', 'Au', 2),
  (2, 'What is the hardest natural substance on Earth?', 'Diamond', 2),
  (3, 'In which year did World War II end?', '1945', 2),
  (3, 'Who was the first President of the United States?', 'George Washington', 1),
  (4, 'What is the largest ocean on Earth?', 'Pacific Ocean', 1),
  (4, 'Which country has the largest population in the world?', 'China', 1),
  (5, 'Who played the character of Iron Man in the Marvel Cinematic Universe?', 'Robert Downey Jr.', 1),
  (5, 'Which band performed the song "Bohemian Rhapsody"?', 'Queen', 1);
