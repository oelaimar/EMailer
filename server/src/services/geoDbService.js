const mysql = require('mysql2/promise');

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: 'localhost',
      port: 3307,
      user: 'root',
      password: 'password',
      database: 'vugex_v2',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  }
  return pool;
}

async function getSchemas() {
  const [rows] = await getPool().query(
    "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME NOT IN ('information_schema','mysql','performance_schema','sys','vugex_v2') ORDER BY SCHEMA_NAME"
  );
  return rows.map(r => r.SCHEMA_NAME);
}

async function getTables(schema) {
  const safe = schema.replace(/[^a-zA-Z0-9_]/g, '');
  const [rows] = await getPool().query(
    `SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA = '${safe}' ORDER BY TABLE_NAME`
  );
  return rows.map(r => ({ name: r.TABLE_NAME, rowCount: r.TABLE_ROWS || 0 }));
}

async function getGeoSummary(schema, tables, geos) {
  const pool = getPool();
  const safeSchema = schema.replace(/[^a-zA-Z0-9_]/g, '');
  const result = { totalRows: 0, eligibleRows: 0, tables: [], geos: [] };

  for (const table of tables) {
    const safeTable = table.replace(/[^a-zA-Z0-9_]/g, '');
    try {
      const [countRows] = await pool.query(`SELECT COUNT(*) as cnt FROM \`${safeSchema}\`.\`${safeTable}\``);
      const total = countRows[0]?.cnt || 0;
      result.totalRows += total;
      result.tables.push({ name: safeTable, totalRows: total, eligibleRows: total });
    } catch {
      result.tables.push({ name: safeTable, totalRows: 0, eligibleRows: 0 });
    }
  }

  result.eligibleRows = result.totalRows;

  for (const geo of geos) {
    const safeGeo = geo.replace(/[^a-zA-Z0-9_]/g, '');
    let geoCount = 0;
    for (const table of tables) {
      const safeTable = table.replace(/[^a-zA-Z0-9_]/g, '');
      try {
        const destTable = `${safeTable}_${safeGeo}`;
        const [rows] = await pool.query(
          `SELECT COUNT(*) as cnt FROM \`${safeSchema}\`.\`${destTable}\``
        );
        geoCount += rows[0]?.cnt || 0;
      } catch {}
    }
    result.geos.push({ geo: safeGeo, current: geoCount, eligible: 0, planned: 0 });
  }

  return result;
}

async function moveRows(schema, sourceTable, targetGeos, batchSize, duplicateMode, stopFlag) {
  const pool = getPool();
  const safeSchema = schema.replace(/[^a-zA-Z0-9_]/g, '');
  const safeTable = sourceTable.replace(/[^a-zA-Z0-9_]/g, '');
  const stats = { moved: 0, deleted: 0, skipped: 0 };

  try {
    const [totalRows] = await pool.query(`SELECT COUNT(*) as cnt FROM \`${safeSchema}\`.\`${safeTable}\``);
    const total = totalRows[0]?.cnt || 0;
    let offset = 0;

    while (offset < total) {
      if (stopFlag && stopFlag.stopped) break;

      const [batch] = await pool.query(
        `SELECT * FROM \`${safeSchema}\`.\`${safeTable}\` LIMIT ${batchSize} OFFSET ${offset}`
      );
      if (!batch || batch.length === 0) break;

      for (const row of batch) {
        if (stopFlag && stopFlag.stopped) break;

        const geoCode = row.geo || row.country || row.country_code;
        if (!geoCode || !targetGeos.includes(geoCode)) {
          stats.skipped++;
          continue;
        }

        const destTable = `${safeTable}_${geoCode.replace(/[^a-zA-Z0-9_]/g, '')}`;
        try {
          if (duplicateMode === 'delete') {
            const email = row.email || row.email_address;
            if (email) {
              await pool.query(
                `DELETE FROM \`${safeSchema}\`.\`${destTable}\` WHERE email = ? OR email_address = ?`,
                [email, email]
              );
              const [affected] = await pool.query(`SELECT ROW_COUNT() as affected`);
              stats.deleted += affected[0]?.affected || 0;
            }
          }
          await pool.query(`INSERT INTO \`${safeSchema}\`.\`${destTable}\` SET ?`, [row]);
          stats.moved++;
        } catch {
          stats.skipped++;
        }
      }

      offset += batchSize;
    }
  } catch (err) {
    console.error('Geo moveRows error:', err.message);
  }

  return stats;
}

module.exports = {
  getSchemas,
  getTables,
  getGeoSummary,
  moveRows,
};
