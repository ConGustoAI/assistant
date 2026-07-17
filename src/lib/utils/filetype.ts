import dbg from 'debug';
import { fileTypeFromBlob } from 'file-type';

const debug = dbg('app:filetype');

const TEXT_SAMPLE_BYTES = 16 * 1024;

type MediaType = 'image' | 'video' | 'audio' | 'text' | 'pdf';

export interface DetectedMediaType {
	type: MediaType;
	mimeType: string;
}

const textMimeTypes = new Set([
	'application/json',
	'application/xml',
	'application/javascript',
	'application/typescript'
]);

const textExtensions = [
	'.txt',
	'.md',
	'.py',
	'.js',
	'.mjs',
	'.cjs',
	'.html',
	'.css',
	'.json',
	'.xml',
	'.csv',
	'.log',
	'.sh',
	'.bat',
	'.ts',
	'.mts',
	'.cts',
	'.jsx',
	'.tsx',
	'.scss',
	'.sass',
	'.less',
	'.yaml',
	'.yml',
	'.ini',
	'.conf',
	'.cfg',
	'.toml',
	'.sql',
	'.php',
	'.rb',
	'.java',
	'.c',
	'.cpp',
	'.h',
	'.hpp',
	'.go',
	'.rs',
	'.swift',
	'.kt',
	'.scala',
	'.lua',
	'.pl',
	'.r',
	'.m',
	'.f',
	'.f90',
	'.asm',
	'.s',
	'.dart',
	'.groovy',
	'.jl',
	'.nim',
	'.ml',
	'.hs',
	'.erl',
	'.ex',
	'.clj',
	'.cs',
	'.vb',
	'.ps1',
	'.psm1',
	'.psd1',
	'.ahk',
	'.au3',
	'.tcl',
	'.vbs',
	'.coffee',
	'.elm',
	'.fs',
	'.fsx',
	'.lisp',
	'.scm',
	'.rkt',
	'.v',
	'.vhd',
	'.vhdl',
	'.d',
	'.pas',
	'.lsp',
	'.el',
	'.prolog',
	'.forth',
	'.zig'
	// '.svelte'
];

function mediaTypeFromMimeType(mimeType: string): MediaType | undefined {
	if (mimeType.startsWith('image/')) return 'image';
	if (mimeType.startsWith('video/')) return 'video';
	if (mimeType.startsWith('audio/')) return 'audio';
	if (mimeType === 'application/pdf') return 'pdf';
	if (mimeType.startsWith('text/') || textMimeTypes.has(mimeType)) return 'text';
}

async function readSample(file: File): Promise<Uint8Array> {
	return new Uint8Array(await file.slice(0, TEXT_SAMPLE_BYTES).arrayBuffer());
}

function isProbablyText(sample: Uint8Array): boolean {
	if (!sample.length) return true;
	const decoded = new TextDecoder('utf-8').decode(sample);
	const replacementChars = decoded.match(/\uFFFD/g)?.length ?? 0;

	let suspiciousControlChars = 0;
	for (const byte of sample) {
		if (byte === 0) return false;
		const isWhitespace = byte === 9 || byte === 10 || byte === 13;
		const isPrintableAscii = byte >= 32 && byte <= 126;
		const isExtendedByte = byte >= 128;

		if (!isWhitespace && !isPrintableAscii && !isExtendedByte) {
			suspiciousControlChars++;
		}
	}

	return replacementChars / decoded.length < 0.02 && suspiciousControlChars / sample.length < 0.02;
}

export async function typeFromFile(file: File): Promise<DetectedMediaType> {
	const mimeType = (file.type || '').toLowerCase();
	const filename = file.name.toLowerCase();
	const detectedFileType = await fileTypeFromBlob(file);
	const detectedMimeType = detectedFileType?.mime?.toLowerCase();

	if (detectedMimeType) {
		const detectedMediaType = mediaTypeFromMimeType(detectedMimeType);
		if (detectedMediaType) {
			debug('Detected file type from signature', filename, detectedFileType);
			return { type: detectedMediaType, mimeType: detectedMimeType };
		}

		debug('Unsupported file type detected from signature', filename, detectedFileType);
		throw new Error(`Unsupported media type: ${detectedMimeType}`);
	}

	if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
		return { type: 'pdf', mimeType: 'application/pdf' };
	}

	const sample = await readSample(file);
	if (isProbablyText(sample)) {
		return {
			type: 'text',
			mimeType: mediaTypeFromMimeType(mimeType) === 'text' ? mimeType : 'text/plain'
		};
	}

	const hasTextExtension = textExtensions.some((ext) => filename.endsWith(ext));
	if (hasTextExtension) {
		return {
			type: 'text',
			mimeType: mediaTypeFromMimeType(mimeType) === 'text' ? mimeType : 'text/plain'
		};
	}

	const hintedMediaType = mediaTypeFromMimeType(mimeType);
	if (hintedMediaType) {
		debug('Falling back to browser MIME type', filename, mimeType);
		return { type: hintedMediaType, mimeType };
	}

	debug('Unknown media type', {
		filename,
		mimeType,
		detectedMimeType
	});
	throw new Error(`Unknown media type: ${mimeType || detectedMimeType || 'unknown'}`);
}
