import { describe, expect, test } from 'bun:test';
import { typeFromFile } from '../src/lib/utils/filetype';

const videoBytes = await Bun.file(new URL('./corrupt-video-source.mp4', import.meta.url)).arrayBuffer();

describe('typeFromFile', () => {
	test('uses signature MIME over an incorrect browser hint', async () => {
		const file = new File([videoBytes], 'renamed.bin', { type: 'text/plain' });

		expect(await typeFromFile(file)).toEqual({ type: 'video', mimeType: 'video/mp4' });
	});

	test('normalizes text with a binary browser hint', async () => {
		const file = new File(['plain text'], 'renamed.bin', { type: 'application/octet-stream' });

		expect(await typeFromFile(file)).toEqual({ type: 'text', mimeType: 'text/plain' });
	});

	test('does not let a text extension override a binary signature', async () => {
		const zipHeader = new Uint8Array([
			0x50, 0x4b, 0x03, 0x04, 0x14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
		]);
		const file = new File([zipHeader], 'archive.csv', { type: 'text/csv' });

		await expect(typeFromFile(file)).rejects.toThrow('Unsupported media type: application/zip');
	});
});
