'use strict';

/**
 * Project.clientAccount was incorrectly typed as lead-company; the link table
 * used lead_company_id. Repair so it points at client_accounts.
 *
 * Safe to run repeatedly: no-ops when the column is already client_account_id.
 */
async function repairProjectClientAccountLink(strapi) {
  const TABLE = 'projects_client_account_lnk';
  const knex = strapi.db?.connection;
  if (!knex) return;

  const hasTable = await knex.schema.hasTable(TABLE);
  if (!hasTable) return;

  const hasLeadCol = await knex.schema.hasColumn(TABLE, 'lead_company_id');
  const hasClientCol = await knex.schema.hasColumn(TABLE, 'client_account_id');

  if (!hasLeadCol || hasClientCol) return;

  strapi.log.warn(
    `[schema-repair] Rebuilding ${TABLE}: lead_company_id → client_account_id`
  );

  const rows = await knex(TABLE).select('*');
  await knex.schema.dropTableIfExists(TABLE);

  // Let Strapi recreate the table from the updated content-type schema on next
  // metadata sync. For sqlite/postgres we recreate the shape Strapi expects.
  const client = strapi.db.config?.connection?.client || strapi.config?.get?.('database.connection.client');
  const isSqlite = client === 'sqlite' || String(client || '').includes('sqlite');

  if (isSqlite) {
    await knex.raw(`
      CREATE TABLE IF NOT EXISTS ${TABLE} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        client_account_id INTEGER
      )
    `);
  } else {
    await knex.schema.createTable(TABLE, (t) => {
      t.increments('id').primary();
      t.integer('project_id').unsigned();
      t.integer('client_account_id').unsigned();
    });
  }

  // Drop invalid links (they pointed at lead companies, not client accounts).
  if (rows.length) {
    strapi.log.warn(
      `[schema-repair] Dropped ${rows.length} project↔client link(s) that used lead_company_id`
    );
  }

  // Indexes Strapi typically creates for this link table
  try {
    await knex.raw(
      `CREATE UNIQUE INDEX IF NOT EXISTS projects_client_account_lnk_uq ON ${TABLE} (project_id)`
    );
  } catch (_) {
    /* best-effort */
  }
  try {
    await knex.schema.alterTable(TABLE, (t) => {
      t.index(['project_id'], 'projects_client_account_lnk_fk');
      t.index(['client_account_id'], 'projects_client_account_lnk_ifk');
    });
  } catch (_) {
    /* best-effort */
  }
}

module.exports = { repairProjectClientAccountLink };
