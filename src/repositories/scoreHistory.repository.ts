import type Database from 'better-sqlite3'

/** Row shape for the score_history table. */
export interface ScoreHistory {
  id: number
  identity_id: number
  score: number
  snapshot_at: string
  bond_snapshot: string
  created_at: string
}

/** Input for creating a new score history record. */
export interface CreateScoreHistoryInput {
  identity_id: number
  score: number
  snapshot_at?: string
  bond_snapshot?: string
}

/**
 * Repository for the `score_history` table.
 * Provides create, read, and time-range query operations for score history records.
 */
export class ScoreHistoryRepository {
  private db: Database.Database

  /**
   * @param db - A better-sqlite3 Database instance with migrations already applied.
   */
  constructor(db: Database.Database) {
    this.db = db
  }

  /**
   * Create a new score history snapshot.
   *
   * @param input - The score history data to insert.
   * @returns The newly created score history record.
   */
  create(input: CreateScoreHistoryInput): ScoreHistory {
    const snapshotAt = input.snapshot_at ?? new Date().toISOString().replace('T', ' ').slice(0, 19)
    const bondSnapshot = input.bond_snapshot ?? '0'
    const stmt = this.db.prepare(
      'INSERT INTO score_history (identity_id, score, snapshot_at, bond_snapshot) VALUES (@identity_id, @score, @snapshot_at, @bond_snapshot)'
    )
    const result = stmt.run({
      identity_id: input.identity_id,
      score: input.score,
      snapshot_at: snapshotAt,
      bond_snapshot: bondSnapshot,
    })
    return this.findById(result.lastInsertRowid as number)!
  }

  /**
   * Find a score history record by its ID.
   *
   * @param id - The score history record ID.
   * @returns The score history record, or undefined if not found.
   */
  findById(id: number): ScoreHistory | undefined {
    const stmt = this.db.prepare('SELECT * FROM score_history WHERE id = ?')
    return stmt.get(id) as ScoreHistory | undefined
  }

  /**
   * Find all score history records for a given identity, ordered by snapshot time ascending.
   *
   * @param identityId - The identity ID to look up.
   * @returns An array of score history records.
   */
  findByIdentityId(identityId: number): ScoreHistory[] {
    const stmt = this.db.prepare(
      'SELECT * FROM score_history WHERE identity_id = ? ORDER BY snapshot_at ASC'
    )
    return stmt.all(identityId) as ScoreHistory[]
  }

  /**
   * Find score history records for an identity within a time range.
   *
   * @param identityId - The identity ID to look up.
   * @param from - ISO 8601 start datetime (inclusive).
   * @param to - ISO 8601 end datetime (inclusive).
   * @returns An array of score history records within the specified range.
   */
  findByIdentityIdAndTimeRange(
    identityId: number,
    from: string,
    to: string
  ): ScoreHistory[] {
    const stmt = this.db.prepare(
      'SELECT * FROM score_history WHERE identity_id = ? AND snapshot_at >= ? AND snapshot_at <= ? ORDER BY snapshot_at ASC'
    )
    return stmt.all(identityId, from, to) as ScoreHistory[]
  }

  /**
   * Get the latest score history record for an identity.
   *
   * @param identityId - The identity ID to look up.
   * @returns The most recent score history record, or undefined if none exist.
   */
  findLatestByIdentityId(identityId: number): ScoreHistory | undefined {
    const stmt = this.db.prepare(
      'SELECT * FROM score_history WHERE identity_id = ? ORDER BY snapshot_at DESC LIMIT 1'
    )
    return stmt.get(identityId) as ScoreHistory | undefined
  }

  /**
   * List all score history records.
   *
   * @returns An array of all score history records.
   */
  findAll(): ScoreHistory[] {
    const stmt = this.db.prepare('SELECT * FROM score_history ORDER BY snapshot_at ASC')
    return stmt.all() as ScoreHistory[]
  }
}
