import { assert } from './utils';

const VIDEO_META_TIMEOUT_MS = 15_000;
const VIDEO_THUMBNAIL_TIMEOUT_MS = 15_000;
const VIDEO_FRAMES_IDLE_TIMEOUT_MS = 30_000;

interface VideoMeta {
	width: number;
	height: number;
	duration: number;
}

export async function VideoGetMeta(media: MediaInterface): Promise<VideoMeta | undefined> {
	assert(media.type === 'video');
	assert(media.original.url);
	const sourceURL = media.original.url;

	return await new Promise((resolve, reject) => {
		const video = document.createElement('video');
		video.preload = 'metadata';
		if (!video.canPlayType(media.original.mimeType)) return resolve(undefined);

		let settled = false;

		const cleanup = () => {
			clearTimeout(timeoutID);
			video.onloadedmetadata = null;
			video.onerror = null;
			video.src = '';
		};

		const fail = (message: string) => {
			if (settled) return;
			settled = true;
			cleanup();
			reject(new Error(message));
		};

		const timeoutID = setTimeout(() => {
			fail(`Timed out while reading video metadata for ${media.filename}`);
		}, VIDEO_META_TIMEOUT_MS);

		video.onloadedmetadata = () => {
			if (!Number.isFinite(video.duration) || video.videoWidth <= 0 || video.videoHeight <= 0) {
				fail(`Invalid video metadata for ${media.filename}`);
				return;
			}

			if (settled) return;
			const metadata = {
				duration: video.duration,
				width: video.videoWidth,
				height: video.videoHeight
			};
			settled = true;
			cleanup();
			resolve(metadata);
		};

		video.onerror = () => {
			if (video.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
				if (settled) return;
				settled = true;
				cleanup();
				resolve(undefined);
				return;
			}
			fail(`Failed to load video metadata for ${media.filename}`);
		};

		video.src = sourceURL;
	});
}

export function videoToImages(media: MediaInterface, fps = 1): Promise<DerivedImageInterface[]> {
	assert(media.type === 'video');
	assert(media.original.url);
	const sourceURL = media.original.url;
	const safeFPS = fps > 0 ? fps : 1;
	const frameStepSeconds = 1 / safeFPS;

	return new Promise((resolve, reject) => {
		const frames: DerivedImageInterface[] = [];
		const video = document.createElement('video');
		video.preload = 'metadata';

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		assert(ctx);

		let settled = false;
		let timeoutID: ReturnType<typeof setTimeout> | undefined;

		const cleanup = () => {
			if (timeoutID !== undefined) clearTimeout(timeoutID);
			video.onloadedmetadata = null;
			video.onseeked = null;
			video.onerror = null;
			video.src = '';
		};

		const fail = (message: string) => {
			if (settled) return;
			settled = true;
			cleanup();
			reject(new Error(message));
		};

		const refreshTimeout = () => {
			if (timeoutID !== undefined) clearTimeout(timeoutID);
			timeoutID = setTimeout(() => {
				fail(`Timed out while extracting video frames for ${media.filename}`);
			}, VIDEO_FRAMES_IDLE_TIMEOUT_MS);
		};

		video.onloadedmetadata = () => {
			refreshTimeout();
			if (video.videoWidth <= 0 || video.videoHeight <= 0 || !Number.isFinite(video.duration) || video.duration < 0) {
				fail(`Invalid video metadata while extracting frames for ${media.filename}`);
				return;
			}

			canvas.width = video.videoWidth;
			canvas.height = video.videoHeight;

			if (video.duration === 0) {
				if (settled) return;
				settled = true;
				cleanup();
				resolve(frames);
				return;
			}

			video.currentTime = 0;
		};

		video.onseeked = async () => {
			refreshTimeout();
			if (video.currentTime >= video.duration) {
				if (settled) return;
				settled = true;
				cleanup();
				resolve(frames);
				return;
			}

			try {
				const timestamp = video.currentTime;
				ctx.drawImage(video, 0, 0);
				const blob = await new Promise<Blob>((resolveFrame, rejectFrame) => {
					canvas.toBlob((blob) => {
						if (blob) resolveFrame(blob);
						else rejectFrame(new Error(`Failed to encode extracted video frame for ${media.filename}`));
					}, 'image/jpeg');
				});

				if (settled) return;
				frames.push({
					userID: media.userID,
					size: blob.size,
					mimeType: 'image/jpeg',
					url: URL.createObjectURL(blob),
					file: new File([blob], `${media.filename}-${timestamp}.jpg`),
					width: canvas.width,
					height: canvas.height,
					timestamp
				});

				const nextTimestamp = timestamp + frameStepSeconds;
				if (nextTimestamp >= video.duration) {
					settled = true;
					cleanup();
					resolve(frames);
					return;
				}

				video.currentTime = nextTimestamp;
			} catch (error) {
				fail(error instanceof Error ? error.message : `Failed to encode extracted video frame for ${media.filename}`);
			}
		};

		video.onerror = () => {
			fail(`Failed to extract video frames for ${media.filename}`);
		};

		refreshTimeout();
		video.src = sourceURL;
	});
}

export async function VideoThumbnail(media: MediaInterface): Promise<FileInterface> {
	assert(media.type === 'video', 'Media is not a video');
	assert(media.original.url, 'Media has no original URL');
	const sourceURL = media.original.url;

	return await new Promise((resolve, reject) => {
		const video = document.createElement('video');
		video.preload = 'metadata';

		const canvas = document.createElement('canvas');
		canvas.width = 128;
		canvas.height = 128;

		const ctx = canvas.getContext('2d');
		assert(ctx);

		let settled = false;
		let timeoutID: ReturnType<typeof setTimeout> | undefined;

		const cleanup = () => {
			if (timeoutID !== undefined) clearTimeout(timeoutID);
			video.onloadedmetadata = null;
			video.onseeked = null;
			video.onerror = null;
			video.src = '';
		};

		const fail = (message: string) => {
			if (settled) return;
			settled = true;
			cleanup();
			reject(new Error(message));
		};

		const refreshTimeout = () => {
			if (timeoutID !== undefined) clearTimeout(timeoutID);
			timeoutID = setTimeout(() => {
				fail(`Timed out while generating video thumbnail for ${media.filename}`);
			}, VIDEO_THUMBNAIL_TIMEOUT_MS);
		};

		video.onloadedmetadata = () => {
			refreshTimeout();
			if (video.videoWidth <= 0 || video.videoHeight <= 0) {
				fail(`Invalid video dimensions while generating thumbnail for ${media.filename}`);
				return;
			}

			const targetTime = Number.isFinite(video.duration) && video.duration > 0 ? video.duration / 2 : 0;
			video.currentTime = targetTime;
		};

		video.onseeked = () => {
			refreshTimeout();

			const aspectRatio = video.videoWidth / video.videoHeight;
			let drawWidth = 128;
			let drawHeight = 128;
			let offsetX = 0;
			let offsetY = 0;

			if (aspectRatio > 1) {
				drawHeight = 128;
				drawWidth = drawHeight * aspectRatio;
				offsetX = -(drawWidth - 128) / 2;
			} else {
				drawWidth = 128;
				drawHeight = drawWidth / aspectRatio;
				offsetY = -(drawHeight - 128) / 2;
			}

			ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

			canvas.toBlob((blob) => {
				if (!blob) {
					fail(`Failed to encode video thumbnail for ${media.filename}`);
					return;
				}

				if (settled) return;
				settled = true;
				cleanup();
				resolve({
					userID: media.userID,
					size: blob.size,
					mimeType: 'image/jpeg',
					url: URL.createObjectURL(blob),
					file: new File([blob], `${media.filename}-thumbnail.jpg`),
					isThumbnail: true
				});
			}, 'image/jpeg');
		};

		video.onerror = () => {
			fail(`Failed to load video for thumbnail generation: ${media.filename}`);
		};

		refreshTimeout();
		video.src = sourceURL;
	});
}
