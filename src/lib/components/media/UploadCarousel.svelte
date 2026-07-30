<script lang="ts">
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { A } from '$lib/appstate.svelte';
	import { CloudUpload, FilePlus, FolderPlus } from '@lucide/svelte';
	import { ConversationMediaPreview } from '.';

	import { goto } from '$app/navigation';
	import { fileToMedia, syncMedia, uploadConversationMedia } from '$lib/utils/media_utils.svelte';

	import { assert } from '$lib/utils/utils';
	import dbg from 'debug';
	const debug = dbg('app:ui:components:UploadCarousel');

	let { message = $bindable() }: { message?: MessageInterface } = $props();

	// Handle file input change
	async function handleFileChange(event: Event) {
		if (!A.conversation) throw new Error('Conversation missing');

		const input = event.target as HTMLInputElement;

		debug('input.files', input.files);
		if (input.files) {
			if (!A.conversation.media) A.conversation.media = [];

			const newFiles = Array.from(input.files).filter(
				(file) =>
					// Check if the file has already been uploaded by comparing size, last modified date, and name
					!A.conversation?.media?.some(
						(m) =>
							m.original?.size === file.size &&
							m.original?.file?.lastModified === file.lastModified &&
							m.filename === file.name
					)
			);

			const newMedia = await Promise.all(newFiles.map(fileToMedia));

			A.conversation.media.push(...newMedia);

			A.conversation.media.map((m) => syncMedia(m));

			debug('Files added to conversation: ', $state.snapshot(A.conversation));
			input.value = '';
		}
	}

	let meidaNeedsUpload = $state(false);

	$effect(() => {
		meidaNeedsUpload = !!A.conversation?.media?.find(
			async (m) => (m.original && m.original.status !== 'ok') || (m.thumbnail && m.thumbnail.status !== 'ok')
		);
	});

	let totalUploadProgress: number | undefined = $state(undefined);

	$effect(() => {
		if (!A.conversation?.media) {
			totalUploadProgress = undefined;
			return;
		}

		Promise.all(
			A.conversation.media.map(async (m) => {
				let p = 0;
				let count = 0;
				if (m.original && m.original.status === 'progress') {
					p += m.original.uploadProgress ?? 0;
					count++;
				}
				const thumbnail = m.thumbnail;
				if (thumbnail && thumbnail.status === 'progress') {
					p += thumbnail.uploadProgress ?? 0;
					count++;
				}
				return count ? p / count : undefined;
			})
		).then((progress) => {
			const p = progress.filter((p) => p !== undefined) as number[];
			if (p.length) {
				const calculatedProgress = p.reduce((a, b) => a + b, 0) / p.length;
				totalUploadProgress = calculatedProgress;
				debug('totalUploadProgress', calculatedProgress);
			} else {
				totalUploadProgress = undefined;
			}
		});
	});
</script>

<div class="no-drag flex shrink-0 flex-col overflow-hidden">
	<!-- + (A.mediaEditing && A.conversation?.media?.includes(A.mediaEditing) ? ' h-[66dvh]' : '')}> -->
	<!-- The message editing area should appear on the bottom when the carousel is invoked from inside a message -->
	<!-- {#if A.mediaEditing && !message && A.conversation?.media?.includes(A.mediaEditing)}
		<MediaEditor bind:media={A.mediaEditing} />
		<Divider />
	{/if} -->

	<div
		class="flex h-fit w-full shrink-0 snap-x snap-mandatory space-x-4 overflow-x-auto scroll-smooth p-4"
		role="region"
		aria-label="Image upload area">
		<!-- Clickable box for file upload -->

		<div class="flex flex-col gap-1.5">
			<button
				class={cn(
					buttonVariants({ variant: 'outline' }),
					'relative h-9 min-h-8 w-14 shrink-0 snap-center items-center justify-center rounded-xs p-0'
				)}
				onclick={() => document.getElementById('fileInput')?.click()}
				title="Upload one or more files">
				<FilePlus size={32} />
				{#if A.debug}
					<p class="absolute right-1 bottom-1 text-debug">{A.mediaProcessing ?? 0}</p>
				{/if}
			</button>

			<button
				class={cn(
					buttonVariants({ variant: 'outline' }),
					'relative h-9 min-h-8 shrink-0 snap-center items-center justify-center rounded-xs p-0'
				)}
				title="Upload one of more directory"
				onclick={() => document.getElementById('directoryInput')?.click()}>
				<FolderPlus size={32} />
				{#if A.debug}
					<p class="absolute right-1 bottom-1 text-debug">{A.mediaProcessing ?? 0}</p>
				{/if}
			</button>

			<button
				class={cn(
					buttonVariants({ variant: 'outline' }),
					'pointer-events-none relative h-9 min-h-8 w-14 shrink-0 snap-center items-center justify-center rounded-xs p-0 opacity-50'
				)}
				class:btn-disabled={!meidaNeedsUpload || !!A.mediaProcessing || totalUploadProgress !== undefined}
				disabled={!meidaNeedsUpload || !!A.mediaProcessing || totalUploadProgress !== undefined}
				onclick={async () => {
					const newConversation = await uploadConversationMedia();
					if (newConversation) {
						assert(A.conversation?.id);
						goto(`/chat/${A.conversation?.id}`);
					}
				}}>
				{#if totalUploadProgress !== undefined}
					<progress
						class="media-progress absolute h-full w-full text-success opacity-50"
						value={totalUploadProgress}
						max={100}></progress>
				{/if}
				<CloudUpload size={32} />
				{#if A.debug}
					<p class="absolute right-1 bottom-1 text-debug">{A.mediaUploading ?? 0}</p>
				{/if}
			</button>
		</div>

		<!-- Hidden file input -->
		<input id="fileInput" type="file" class="hidden" onchange={handleFileChange} multiple />

		<!-- Hidden directory input -->
		<input id="directoryInput" type="file" class="hidden" webkitdirectory multiple onchange={handleFileChange} />

		<!-- Display uploaded images or videos -->
		{#if A.conversation?.media}
			{#each A.conversation?.media as m, i}
				{#if !message || !message.media?.includes(m)}
					<div class="flex h-32 w-32 shrink-0 snap-center flex-col">
						<ConversationMediaPreview bind:media={A.conversation.media[i]} bind:message />
					</div>
				{/if}
			{/each}
		{/if}
	</div>

	<!-- {#if A.mediaEditing && message}
		<MediaEditor bind:media={A.mediaEditing} />
		<Divider />
	{/if} -->
</div>
