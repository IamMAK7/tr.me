// Database utility functions for Trivia App
import { D1Database } from '@cloudflare/workers-types';

export interface Theme {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Question {
  id: number;
  theme_id: number | null;
  question_text: string;
  answer_text: string;
  difficulty: number;
  created_at: string;
}

export interface Room {
  id: number;
  room_code: string;
  name: string;
  is_active: boolean;
  current_question_id: number | null;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  display_name: string;
  is_host: boolean;
  created_at: string;
}

export interface RoomUser {
  id: number;
  room_id: number;
  user_id: number;
  joined_at: string;
}

export interface BuzzerEvent {
  id: number;
  room_id: number;
  user_id: number;
  question_id: number;
  buzz_time: string;
}

export interface Score {
  id: number;
  room_id: number;
  user_id: number;
  question_id: number;
  points: number;
  scored_at: string;
}

// Theme functions
export async function getThemes(db: D1Database): Promise<Theme[]> {
  const { results } = await db.prepare('SELECT * FROM themes ORDER BY name').all();
  return results as Theme[];
}

export async function getThemeById(db: D1Database, id: number): Promise<Theme | null> {
  const theme = await db.prepare('SELECT * FROM themes WHERE id = ?').bind(id).first();
  return theme as Theme | null;
}

export async function createTheme(db: D1Database, name: string, description: string | null): Promise<number> {
  const result = await db.prepare('INSERT INTO themes (name, description) VALUES (?, ?) RETURNING id')
    .bind(name, description)
    .first<{ id: number }>();
  return result?.id || 0;
}

// Question functions
export async function getQuestions(db: D1Database, themeId?: number): Promise<Question[]> {
  let query = 'SELECT * FROM questions';
  if (themeId) {
    query += ' WHERE theme_id = ?';
    const { results } = await db.prepare(query).bind(themeId).all();
    return results as Question[];
  } else {
    const { results } = await db.prepare(query).all();
    return results as Question[];
  }
}

export async function getQuestionById(db: D1Database, id: number): Promise<Question | null> {
  const question = await db.prepare('SELECT * FROM questions WHERE id = ?').bind(id).first();
  return question as Question | null;
}

export async function createQuestion(
  db: D1Database, 
  themeId: number | null, 
  questionText: string, 
  answerText: string, 
  difficulty: number
): Promise<number> {
  const result = await db.prepare(
    'INSERT INTO questions (theme_id, question_text, answer_text, difficulty) VALUES (?, ?, ?, ?) RETURNING id'
  ).bind(themeId, questionText, answerText, difficulty).first<{ id: number }>();
  return result?.id || 0;
}

// Room functions
export async function createRoom(db: D1Database, name: string): Promise<{ id: number; roomCode: string }> {
  // Generate a random 6-character room code
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const result = await db.prepare(
    'INSERT INTO rooms (room_code, name) VALUES (?, ?) RETURNING id, room_code'
  ).bind(roomCode, name).first<{ id: number; room_code: string }>();
  
  return { id: result?.id || 0, roomCode: result?.room_code || '' };
}

export async function getRoomByCode(db: D1Database, roomCode: string): Promise<Room | null> {
  const room = await db.prepare('SELECT * FROM rooms WHERE room_code = ?').bind(roomCode).first();
  return room as Room | null;
}

export async function updateRoomQuestion(db: D1Database, roomId: number, questionId: number | null): Promise<boolean> {
  const result = await db.prepare(
    'UPDATE rooms SET current_question_id = ? WHERE id = ?'
  ).bind(questionId, roomId).run();
  return result.success;
}

export async function getRoomWithCurrentQuestion(db: D1Database, roomId: number): Promise<{room: Room; question: Question | null}> {
  const room = await db.prepare('SELECT * FROM rooms WHERE id = ?').bind(roomId).first() as Room | null;
  
  if (!room) {
    throw new Error('Room not found');
  }
  
  let question = null;
  if (room.current_question_id) {
    question = await getQuestionById(db, room.current_question_id);
  }
  
  return { room, question };
}

// User functions
export async function createUser(db: D1Database, username: string, displayName: string, isHost: boolean): Promise<number> {
  const result = await db.prepare(
    'INSERT INTO users (username, display_name, is_host) VALUES (?, ?, ?) RETURNING id'
  ).bind(username, displayName, isHost ? 1 : 0).first<{ id: number }>();
  return result?.id || 0;
}

export async function getUserById(db: D1Database, id: number): Promise<User | null> {
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  return user as User | null;
}

// Room User functions
export async function addUserToRoom(db: D1Database, roomId: number, userId: number): Promise<number> {
  const result = await db.prepare(
    'INSERT INTO room_users (room_id, user_id) VALUES (?, ?) RETURNING id'
  ).bind(roomId, userId).first<{ id: number }>();
  return result?.id || 0;
}

export async function getUsersInRoom(db: D1Database, roomId: number): Promise<User[]> {
  const { results } = await db.prepare(`
    SELECT u.* FROM users u
    JOIN room_users ru ON u.id = ru.user_id
    WHERE ru.room_id = ?
    ORDER BY u.is_host DESC, u.display_name
  `).bind(roomId).all();
  return results as User[];
}

// Buzzer functions
export async function recordBuzz(db: D1Database, roomId: number, userId: number, questionId: number): Promise<number> {
  const result = await db.prepare(
    'INSERT INTO buzzer_events (room_id, user_id, question_id) VALUES (?, ?, ?) RETURNING id'
  ).bind(roomId, userId, questionId).first<{ id: number }>();
  return result?.id || 0;
}

export async function getBuzzerEventsForQuestion(db: D1Database, roomId: number, questionId: number): Promise<{user: User; event: BuzzerEvent}[]> {
  const { results } = await db.prepare(`
    SELECT u.*, be.* FROM buzzer_events be
    JOIN users u ON be.user_id = u.id
    WHERE be.room_id = ? AND be.question_id = ?
    ORDER BY be.buzz_time
  `).bind(roomId, questionId).all();
  
  return results.map((row: any) => ({
    user: {
      id: row.id,
      username: row.username,
      display_name: row.display_name,
      is_host: Boolean(row.is_host),
      created_at: row.created_at
    },
    event: {
      id: row.id_1, // The second id column from buzzer_events
      room_id: row.room_id,
      user_id: row.user_id,
      question_id: row.question_id,
      buzz_time: row.buzz_time
    }
  }));
}

// Score functions
export async function recordScore(db: D1Database, roomId: number, userId: number, questionId: number, points: number): Promise<number> {
  const result = await db.prepare(
    'INSERT INTO scores (room_id, user_id, question_id, points) VALUES (?, ?, ?, ?) RETURNING id'
  ).bind(roomId, userId, questionId, points).first<{ id: number }>();
  return result?.id || 0;
}

export async function getScoresForRoom(db: D1Database, roomId: number): Promise<{user: User; totalScore: number}[]> {
  const { results } = await db.prepare(`
    SELECT u.*, SUM(s.points) as total_score FROM scores s
    JOIN users u ON s.user_id = u.id
    WHERE s.room_id = ?
    GROUP BY s.user_id
    ORDER BY total_score DESC
  `).bind(roomId).all();
  
  return results.map((row: any) => ({
    user: {
      id: row.id,
      username: row.username,
      display_name: row.display_name,
      is_host: Boolean(row.is_host),
      created_at: row.created_at
    },
    totalScore: row.total_score
  }));
}
