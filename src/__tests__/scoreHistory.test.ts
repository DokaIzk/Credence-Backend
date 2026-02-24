import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { runMigrations } from '../db/migrations.js'
import { IdentitiesRepository } from '../repositories/identities.repository.js'
import { ScoreHistoryRepository } from '../repositories/scoreHistory.repository.js'

describe('ScoreHistoryRepository', () => {
  let db: Database.Database
  let identities: IdentitiesRepository
  let scoreHistory: ScoreHistoryRepository
  let identityId: number

  beforeEach(() => {
    db = new Database(':memory:')
    db.pragma('foreign_keys = ON')
    runMigrations(db)
    identities = new IdentitiesRepository(db)
    scoreHistory = new ScoreHistoryRepository(db)
    const identity = identities.create({ address: '0xABCDEF1234567890' })
    identityId = identity.id
  })

  afterEach(() => {
    db.close()
  })

  it('should create a score history record with defaults', () => {
    const record = scoreHistory.create({
      identity_id: identityId,
      score: 85.5,
    })
    expect(record.id).toBe(1)
    expect(record.identity_id).toBe(identityId)
    expect(record.score).toBe(85.5)
    expect(record.bond_snapshot).toBe('0')
    expect(record.snapshot_at).toBeDefined()
    expect(record.created_at).toBeDefined()
  })

  it('should create a score history record with custom snapshot_at and bond_snapshot', () => {
    const record = scoreHistory.create({
      identity_id: identityId,
      score: 92.0,
      snapshot_at: '2025-06-01 12:00:00',
      bond_snapshot: '5000000000000000000',
    })
    expect(record.score).toBe(92.0)
    expect(record.snapshot_at).toBe('2025-06-01 12:00:00')
    expect(record.bond_snapshot).toBe('5000000000000000000')
  })

  it('should find a score history record by ID', () => {
    const created = scoreHistory.create({
      identity_id: identityId,
      score: 50.0,
    })
    const found = scoreHistory.findById(created.id)
    expect(found).toBeDefined()
    expect(found!.score).toBe(50.0)
  })

  it('should return undefined for non-existent score history ID', () => {
    const found = scoreHistory.findById(999)
    expect(found).toBeUndefined()
  })

  it('should find all records by identity ID ordered by snapshot_at', () => {
    scoreHistory.create({
      identity_id: identityId,
      score: 10,
      snapshot_at: '2025-01-03 00:00:00',
    })
    scoreHistory.create({
      identity_id: identityId,
      score: 20,
      snapshot_at: '2025-01-01 00:00:00',
    })
    scoreHistory.create({
      identity_id: identityId,
      score: 30,
      snapshot_at: '2025-01-02 00:00:00',
    })
    const results = scoreHistory.findByIdentityId(identityId)
    expect(results).toHaveLength(3)
    expect(results[0].score).toBe(20)
    expect(results[1].score).toBe(30)
    expect(results[2].score).toBe(10)
  })

  it('should return empty array for identity with no score history', () => {
    const results = scoreHistory.findByIdentityId(identityId)
    expect(results).toHaveLength(0)
  })

  it('should query by identity and time range (inclusive)', () => {
    scoreHistory.create({
      identity_id: identityId,
      score: 10,
      snapshot_at: '2025-01-01 00:00:00',
    })
    scoreHistory.create({
      identity_id: identityId,
      score: 20,
      snapshot_at: '2025-02-01 00:00:00',
    })
    scoreHistory.create({
      identity_id: identityId,
      score: 30,
      snapshot_at: '2025-03-01 00:00:00',
    })
    scoreHistory.create({
      identity_id: identityId,
      score: 40,
      snapshot_at: '2025-04-01 00:00:00',
    })

    const results = scoreHistory.findByIdentityIdAndTimeRange(
      identityId,
      '2025-02-01 00:00:00',
      '2025-03-01 00:00:00'
    )
    expect(results).toHaveLength(2)
    expect(results[0].score).toBe(20)
    expect(results[1].score).toBe(30)
  })

  it('should return empty array for time range with no records', () => {
    scoreHistory.create({
      identity_id: identityId,
      score: 10,
      snapshot_at: '2025-01-01 00:00:00',
    })
    const results = scoreHistory.findByIdentityIdAndTimeRange(
      identityId,
      '2026-01-01 00:00:00',
      '2026-12-31 00:00:00'
    )
    expect(results).toHaveLength(0)
  })

  it('should return the latest score history record for an identity', () => {
    scoreHistory.create({
      identity_id: identityId,
      score: 10,
      snapshot_at: '2025-01-01 00:00:00',
    })
    scoreHistory.create({
      identity_id: identityId,
      score: 99,
      snapshot_at: '2025-12-31 23:59:59',
    })
    scoreHistory.create({
      identity_id: identityId,
      score: 50,
      snapshot_at: '2025-06-15 12:00:00',
    })
    const latest = scoreHistory.findLatestByIdentityId(identityId)
    expect(latest).toBeDefined()
    expect(latest!.score).toBe(99)
  })

  it('should return undefined for latest when identity has no history', () => {
    const latest = scoreHistory.findLatestByIdentityId(identityId)
    expect(latest).toBeUndefined()
  })

  it('should list all score history records', () => {
    scoreHistory.create({ identity_id: identityId, score: 10, snapshot_at: '2025-01-01 00:00:00' })
    scoreHistory.create({ identity_id: identityId, score: 20, snapshot_at: '2025-02-01 00:00:00' })
    const all = scoreHistory.findAll()
    expect(all).toHaveLength(2)
  })

  it('should enforce foreign key constraint on identity_id', () => {
    expect(() =>
      scoreHistory.create({
        identity_id: 9999,
        score: 50,
      })
    ).toThrow()
  })

  it('should cascade delete score history when identity is deleted', () => {
    scoreHistory.create({ identity_id: identityId, score: 75 })
    expect(scoreHistory.findByIdentityId(identityId)).toHaveLength(1)
    db.prepare('DELETE FROM identities WHERE id = ?').run(identityId)
    expect(scoreHistory.findByIdentityId(identityId)).toHaveLength(0)
  })

  it('should isolate records between different identities', () => {
    const identity2 = identities.create({ address: '0xSECOND' })
    scoreHistory.create({ identity_id: identityId, score: 10, snapshot_at: '2025-01-01 00:00:00' })
    scoreHistory.create({ identity_id: identity2.id, score: 90, snapshot_at: '2025-01-01 00:00:00' })
    const results1 = scoreHistory.findByIdentityId(identityId)
    const results2 = scoreHistory.findByIdentityId(identity2.id)
    expect(results1).toHaveLength(1)
    expect(results1[0].score).toBe(10)
    expect(results2).toHaveLength(1)
    expect(results2[0].score).toBe(90)
  })

  it('should handle time range query scoped to correct identity', () => {
    const identity2 = identities.create({ address: '0xOTHER' })
    scoreHistory.create({ identity_id: identityId, score: 10, snapshot_at: '2025-06-01 00:00:00' })
    scoreHistory.create({ identity_id: identity2.id, score: 99, snapshot_at: '2025-06-01 00:00:00' })
    const results = scoreHistory.findByIdentityIdAndTimeRange(
      identityId,
      '2025-01-01 00:00:00',
      '2025-12-31 00:00:00'
    )
    expect(results).toHaveLength(1)
    expect(results[0].score).toBe(10)
  })
})
