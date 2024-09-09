import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { assistantsTable } from './assistants';
import { conversationsTable } from './conversations';
import { hiddenItems } from './hide';
import { mediaTable } from './media';
import { providersTable } from './providers';

export const defaultsUUID = '00000000-0000-0000-0000-000000000000';

export const usersTable = pgTable('users', {
	// This should should match the id in Supabase Auth, except for the defaultUUID, which does not exist in auth.users
	id: uuid('id').primaryKey(),
	name: text('name'),
	email: text('email'),
	avatar: text('avatar'),
	admin: boolean('admin').default(false),
	hacker: boolean('hacker').default(false),
	assistant: text('assistant').default(defaultsUUID),
	lastAssistant: text('last_assistant'),
	aboutUser: text('about_user'),
	assistantInstructions: text('assistant_instructions'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

export const userTableRelations = relations(usersTable, ({ many }) => ({
	providers: many(providersTable),
	assistants: many(assistantsTable),
	hiddenAssistants: many(hiddenItems),
	conversations: many(conversationsTable),
	media: many(mediaTable)
}));
