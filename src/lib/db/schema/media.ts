import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, real, text, timestamp, uuid, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { fileTable } from './file';
import { usersTable } from './users';

export const mediaTypes = pgEnum('media_types', ['image', 'audio', 'video']);

export const mediaTable = pgTable('media', {
	id: uuid('id').defaultRandom().primaryKey(),
	userID: uuid('user_id')
		.references(() => usersTable.id, { onDelete: 'cascade' })
		.notNull(),
	title: text('title').notNull(),
	filename: text('filename').notNull(),
	type: mediaTypes('type').notNull(),

	originalWidth: integer('width'),
	originalHeight: integer('height'),
	originalDuration: real('duration'),

	resizedWidth: integer('resized_width'),
	resizedHeight: integer('resized_height'),

	// // For images and videos
	// // Crop in %, stays constant across resizes.
	cropStartX: real('crop_start_x'),
	cropStartY: real('crop_start_y'),
	cropEndX: real('crop_end_x'),
	cropEndY: real('crop_end_y'),

	// // For video and audio
	trimStart: real('duration_start'),
	trimEnd: real('duration_end'),

	originalID: uuid('original_id').references((): AnyPgColumn => fileTable.id, { onDelete: 'set null' }),
	// We keep the resized uncropped image/video to be able to show the crop area for re-crop.
	resizedID: uuid('resized_id').references((): AnyPgColumn => fileTable.id, { onDelete: 'set null' }),
	// Cropped image, trimmed audio, both for video.
	croppedID: uuid('cropped_id').references((): AnyPgColumn => fileTable.id, { onDelete: 'set null' }),

	// Thumbnail - small image, audio waveform, video thumbnail, possibly gif.
	thumbnailID: uuid('thumbnail_id').references((): AnyPgColumn => fileTable.id, { onDelete: 'set null' }),

	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
});

// export const messageMediaTable = pgTable('message_media', {
// 	messageId: uuid('message_id')
// 		.references(() => messagesTable.id, { onDelete: 'cascade' })
// 		.notNull(),
// 	mediaId: uuid('media_id')
// 		.references(() => mediaTable.id, { onDelete: 'cascade' })
// 		.notNull(),
// 	createdAt: timestamp('created_at').notNull().defaultNow().notNull().defaultNow()
// });

export const mediaTableRelations = relations(mediaTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [mediaTable.userID],
		references: [usersTable.id]
	}),
	original: one(fileTable, {
		fields: [mediaTable.originalID],
		references: [fileTable.id]
	}),
	resized: one(fileTable, {
		fields: [mediaTable.resizedID],
		references: [fileTable.id]
	}),
	cropped: one(fileTable, {
		fields: [mediaTable.croppedID],
		references: [fileTable.id]
	}),
	thumbnail: one(fileTable, {
		fields: [mediaTable.thumbnailID],
		references: [fileTable.id]
	})

	// files: many(fileTable)
	// messages: many(messageMediaTable)
}));

// export const messageMediaTableRelations = relations(messageMediaTable, ({ one, many }) => ({
// 	message: one(messagesTable, {
// 		fields: [messageMediaTable.messageId],
// 		references: [messagesTable.id]
// 	}),
// 	media: many(mediaTable)
// }));
