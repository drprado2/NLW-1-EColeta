import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('point_items', table => {
        table.primary(['point_id', 'item_id']);
        table.integer('point_id')
            .references('id')
            .inTable('points')
            .notNullable();
        table.integer('item_id')
            .references('id')
            .inTable('items')
            .notNullable();
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('point_items');
}

