import * as SQLite from 'expo-sqlite';
import type { MonthlySnapshot } from '../types/fuel';

// Promise singleton — concurrent callers share one init; failure resets so
// the next caller retries rather than getting a permanently broken instance.
let _initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_initPromise) {
    _initPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('fuel-cache.db');
      // WAL mode: allows concurrent reads alongside writes, prevents SQLITE_BUSY
      // on the fire-and-forget cacheSnapshots() calls made from fuelApi.ts.
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS snapshots (
          month             TEXT    PRIMARY KEY NOT NULL,
          effective_date    TEXT    NOT NULL,
          price_95_ulp      INTEGER NOT NULL DEFAULT 0,
          price_93_ulp      INTEGER NOT NULL DEFAULT 0,
          price_diesel_in   INTEGER NOT NULL DEFAULT 0,
          price_diesel_co   INTEGER NOT NULL DEFAULT 0,
          is_fallback       INTEGER NOT NULL DEFAULT 0,
          cached_at         TEXT    NOT NULL
        );
      `);
      return db;
    })().catch(err => {
      _initPromise = null; // allow retry on next call
      throw err;
    });
  }
  return _initPromise;
}

interface SnapshotRow {
  month: string;
  effective_date: string;
  price_95_ulp: number;
  price_93_ulp: number;
  price_diesel_in: number;
  price_diesel_co: number;
  is_fallback: number;
  cached_at: string;
}

function rowToSnapshot(row: SnapshotRow): MonthlySnapshot {
  return {
    month: row.month,
    effectiveDate: row.effective_date,
    prices: {
      '95_ULP':        row.price_95_ulp,
      '93_ULP':        row.price_93_ulp,
      'DIESEL_INLAND': row.price_diesel_in,
      'DIESEL_COASTAL':row.price_diesel_co,
    },
    isFallback: row.is_fallback === 1,
  };
}

const INSERT_SQL = `
  INSERT OR REPLACE INTO snapshots
    (month, effective_date, price_95_ulp, price_93_ulp, price_diesel_in, price_diesel_co, is_fallback, cached_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
`;

export async function cacheSnapshots(snapshots: MonthlySnapshot[]): Promise<void> {
  const db = await getDb();
  if (snapshots.length === 1) {
    const s = snapshots[0];
    await db.runAsync(INSERT_SQL, [
      s.month, s.effectiveDate,
      s.prices['95_ULP'], s.prices['93_ULP'],
      s.prices['DIESEL_INLAND'], s.prices['DIESEL_COASTAL'],
      s.isFallback ? 1 : 0,
    ]);
  } else {
    await db.withTransactionAsync(async () => {
      for (const s of snapshots) {
        await db.runAsync(INSERT_SQL, [
          s.month, s.effectiveDate,
          s.prices['95_ULP'], s.prices['93_ULP'],
          s.prices['DIESEL_INLAND'], s.prices['DIESEL_COASTAL'],
          s.isFallback ? 1 : 0,
        ]);
      }
    });
  }
}

export async function loadCachedCurrent(): Promise<MonthlySnapshot | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<SnapshotRow>(
    'SELECT * FROM snapshots ORDER BY month DESC LIMIT 1',
  );
  return row ? rowToSnapshot(row) : null;
}

export async function loadCachedHistory(from: string): Promise<MonthlySnapshot[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<SnapshotRow>(
    'SELECT * FROM snapshots WHERE month >= ? ORDER BY month ASC',
    [from],
  );
  return rows.map(rowToSnapshot);
}
