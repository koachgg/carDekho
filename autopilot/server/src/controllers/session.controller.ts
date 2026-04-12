import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute } from '../db/database';
import { Session, PreferenceVector } from '../types';

export function create(_req: Request, res: Response): void {
  const id = uuidv4();
  const emptyPrefs: PreferenceVector = {
    budget_min_lakh: null,
    budget_max_lakh: null,
    body_types: null,
    fuel_types: null,
    transmission: null,
    seating_min: null,
    priority: null,
    usage: null,
    tags: null,
  };

  execute(
    `INSERT INTO sessions (id, preference_vector, conversation_history, confidence_score)
     VALUES (?, ?, ?, ?)`,
    [id, JSON.stringify(emptyPrefs), JSON.stringify([]), 0]
  );

  const session = queryOne<Session>('SELECT * FROM sessions WHERE id = ?', [id]);
  res.status(201).json(session);
}

export function getById(req: Request, res: Response): void {
  const session = queryOne<Session>('SELECT * FROM sessions WHERE id = ?', [req.params.id]);

  if (!session) {
    res.status(404).json({ error: { message: 'Session not found' } });
    return;
  }

  res.json({
    ...session,
    preference_vector: session.preference_vector ? JSON.parse(session.preference_vector) : null,
    conversation_history: session.conversation_history ? JSON.parse(session.conversation_history) : [],
  });
}

export function updatePreferences(req: Request, res: Response): void {
  const { id } = req.params;
  const { preference_vector, confidence_score } = req.body;

  const session = queryOne<Session>('SELECT * FROM sessions WHERE id = ?', [id]);
  if (!session) {
    res.status(404).json({ error: { message: 'Session not found' } });
    return;
  }

  if (preference_vector !== undefined && confidence_score !== undefined) {
    execute('UPDATE sessions SET preference_vector = ?, confidence_score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(preference_vector), confidence_score, id]);
  } else if (preference_vector !== undefined) {
    execute('UPDATE sessions SET preference_vector = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(preference_vector), id]);
  } else if (confidence_score !== undefined) {
    execute('UPDATE sessions SET confidence_score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [confidence_score, id]);
  }

  const updated = queryOne<Session>('SELECT * FROM sessions WHERE id = ?', [id]);
  res.json({
    ...updated,
    preference_vector: updated?.preference_vector ? JSON.parse(updated.preference_vector) : null,
    conversation_history: updated?.conversation_history ? JSON.parse(updated.conversation_history) : [],
  });
}
