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
});
