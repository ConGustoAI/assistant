import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { assistantsTable } from './assistants';
import { providersTable } from './providers';
import { usersTable } from './users';

export const apiKeysTable = pgTable('api_keys', {
	id: uuid('id').defaultRandom().primaryKey(),
	userID: uuid('user_id')
		.references(() => usersTable.id, { onDelete: 'cascade' })
		.notNull(),
	providerID: uuid('provider')
		.references(() => providersTable.id, { onDelete: 'cascade' })
		.notNull(),
	label: text('label').notNull(),
	key: text('key').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const apiKeyTableRelations = relations(apiKeysTable, ({ one, many }) => ({
	providers: one(providersTable, {
		fields: [apiKeysTable.providerID],
		references: [providersTable.id]
	}),
	assistants: many(assistantsTable)
}));
