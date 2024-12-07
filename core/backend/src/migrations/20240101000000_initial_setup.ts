// core/backend/src/migrations/20240101000000_initial_setup.ts

import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('name').notNullable();
    table.string('role').defaultTo('user');
    table.timestamps(true, true);
  });

  // Organizations table
  await knex.schema.createTable('organizations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('subscription_plan').defaultTo('free');
    table.timestamps(true, true);
  });

  // Plugins table
  await knex.schema.createTable('plugins', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').notNullable();
    table.string('version').notNullable();
    table.jsonb('config').defaultTo('{}');
    table.boolean('enabled').defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('plugins');
  await knex.schema.dropTable('organizations');
  await knex.schema.dropTable('users');
}

// core/backend/src/migrations/20240101000001_add_user_preferences.ts

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_preferences', (table) => {
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.jsonb('preferences').defaultTo('{}');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('user_preferences');
}
