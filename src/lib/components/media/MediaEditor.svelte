<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '$lib/components/ui/spinner';
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { APIupsertMedia } from '$lib/api';
	import { A } from '$lib/appstate.svelte';
	import {
		GrowInput,
		MediaAudioControls,
		MediaImageControls,
		MediaPDFControls,
		PDFImageViewer,
		PDFViewer
	} from '$lib/components';
	import { assistantSupportsMedia, mediaUpdateText } from '$lib/utils/media_utils.svelte';
	import { assert, isPublicPage } from '$lib/utils/utils';

	import dbg from 'debug';
	import { TriangleAlert } from '@lucide/svelte';
	import MediaVideoControls from './MediaVideoControls.svelte';
	import VideoImageViewer from './VideoImageViewer.svelte';
	const debug = dbg('app:ui:components:MediaEditor');

	// let progressBar: HTMLProgressElement;

	// function isVideo(media: MediaInterface) {
	// 	return media.type === 'video';
	// }

	async function updateMediaMetadata() {
		// only update media that has been saved (uploaded) before.
		if (A.mediaEditing?.id) {
			await APIupsertMedia(A.mediaEditing);
		}
	}

	// let displayedImageURL: string | undefined = $state();

	let displayedImageURL: string | undefined = $state(undefined);

	$effect(() => {
		if (['image', 'video'].includes(A.mediaEditing?.type ?? '')) {
			if (A.mediaEditing?.transformed) {
				debug('displayedImageURL: Picking resized');
				A.mediaEditing.transformed.then((r) => (displayedImageURL = r.url));
				// displayedImageURL =
			} else if (A.mediaEditing?.original?.url) {
				debug('displayedImageURL: Picking original');
				displayedImageURL = A.mediaEditing.original.url;
			} else {
				debug('displayedImageURL: No preview URL available');
				displayedImageURL = undefined;
			}
		}
	});

	let titleUpdating: boolean = $state(false);
	let textNeedsSave = $state(false);

	let currentAssistant: AssistantInterface | undefined = $derived.by(() => {
		return A.assistants[A.conversation?.assistantID ?? 'none'];
	});

	$effect(() => {
		debug('mediaEditing', $state.snapshot(A.mediaEditing));

		if (A.mediaEditing) {
			if (
				A.mediaEditing.type === 'pdf' &&
				!A.mediaEditing.PDFAsImages &&
				!A.mediaEditing.PDFAsDocument &&
				!A.mediaEditing.PDFAsFile &&
				(!currentAssistant || currentAssistant.images)
			) {
				A.mediaEditing.PDFAsImages = true;
			}

			if (
				A.mediaEditing.type === 'video' &&
				!A.mediaEditing.videoAsImages &&
				!A.mediaEditing.videoAsFile &&
				(!currentAssistant || currentAssistant.images)
			) {
				A.mediaEditing.videoAsImages = true;
			}
		}
	});

	let mediaSupported = $derived.by(() => {
		assert(A.mediaEditing, 'No media editing');
		if (!A.conversation?.assistantID) return true;
		const assistant = A.assistants[A.conversation.assistantID];
		if (!assistant) return true; // Can't fing assistant - assume it supports this media.

		return assistantSupportsMedia(assistant, A.mediaEditing);
	});
</script>

<dialog class="fixed inset-0 z-50 hidden h-full w-full items-center justify-center open:flex" open={!!A.mediaEditing}>
	<div
		class="relative flex h-[80vh] max-h-[calc(100vh-5em)] w-[95vw] min-w-[95vw] flex-col overflow-visible overflow-y-auto rounded-xs border bg-base-100 p-1 shadow-lg md:flex-row lg:w-[80vw] lg:min-w-[80vw]"
		class:mb-60={A.debug}>
		{#if A.mediaEditing}
			{#if A.mediaEditing.type === 'video' && A.mediaEditing.videoPreviewUnsupported}
				<div class="flex h-full grow items-center justify-center p-6">
					<div class="max-w-xl text-center">
						<p class="font-medium">Video preview unavailable</p>
						<p class="text-sm opacity-70">This browser cannot display {A.mediaEditing.original.mimeType} files.</p>
						{#if A.mediaEditing.processingError}
							<p class="mt-2 text-sm text-error">{A.mediaEditing.processingError}</p>
						{/if}
					</div>
				</div>
			{:else if A.mediaEditing.processingError}
				<div class="flex h-full grow items-center justify-center p-6">
					<div class="max-w-xl rounded-2xl bg-error px-4 text-left text-black">
						<AlertTriangle size={18} />
						<span>{A.mediaEditing.processingError}</span>
					</div>
				</div>
			{:else if A.mediaEditing?.type === 'image'}
				<img
					src={displayedImageURL}
					alt={A.mediaEditing.title}
					class="pixilated bg-checkered shrink grow self-stretch overflow-hidden object-contain" />
			{:else if A.mediaEditing?.type === 'audio'}
				<div class="flex h-full max-h-full grow flex-col overflow-auto p-2">
					<audio class="w-full shrink grow" controls>
						<source src={A.mediaEditing.original.url} />
						Your browser does not support the audio tag.
					</audio>
				</div>
			{:else if A.mediaEditing?.type === 'video'}
				<Tabs.Root value="video" class="h-full w-full">
					<Tabs.List>
						<Tabs.Trigger value="video" class="text-nowrap">Video</Tabs.Trigger>
						<Tabs.Trigger value="images" class="text-nowrap" disabled={!A.mediaEditing.videoAsImages}>
							As images
						</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="video" class="h-full overflow-auto">
						<video class="shrink grow overflow-hidden object-contain" controls>
							<source src={A.mediaEditing.original.url} type={A.mediaEditing.original.mimeType} />
							Your browser does not support the video tag.
						</video>
					</Tabs.Content>
					<Tabs.Content value="images" class="h-full overflow-auto">
						<VideoImageViewer media={A.mediaEditing} />
					</Tabs.Content>
				</Tabs.Root>
			{:else if A.mediaEditing?.type === 'text'}
				<div class="flex h-full max-h-full grow flex-col overflow-auto p-2">
					<GrowInput
						class="tab-size-4 font-mono"
						spellcheck={false}
						bind:value={A.mediaEditing.text}
						oninput={() => (textNeedsSave = true)}
						disabled={isPublicPage()} />
				</div>
			{:else if A.mediaEditing?.type === 'pdf'}
				<Tabs.Root value="original" class="h-full w-full">
					<Tabs.List>
						<Tabs.Trigger value="original" class="text-nowrap">Original</Tabs.Trigger>
						<Tabs.Trigger value="images" class="text-nowrap" disabled={!A.mediaEditing.PDFAsImages}>
							As images
						</Tabs.Trigger>
						<Tabs.Trigger value="document" class="text-nowrap" disabled>As document</Tabs.Trigger>
					</Tabs.List>
					<Tabs.Content value="original" class="h-full overflow-auto">
						<PDFViewer media={A.mediaEditing} />
					</Tabs.Content>
					<Tabs.Content value="images" class="h-full overflow-auto">
						<PDFImageViewer media={A.mediaEditing} />
					</Tabs.Content>
					<Tabs.Content value="document" class="h-full overflow-auto"></Tabs.Content>
				</Tabs.Root>
			{/if}

			<div
				class="flex min-w-fit shrink-0 grow-0 flex-col items-end justify-start gap-1 overflow-visible border-t p-1 md:border-t-0 md:border-l">
				{#if !mediaSupported}
					<div class="w-full text-center text-error">
						<p>Media type not supported</p>
					</div>
				{/if}

				<div class="flex items-baseline gap-2">
					<p class="mr-auto text-sm">Title:</p>
					{#if titleUpdating}
						<Spinner class="size-5" />
					{/if}

					{#if !isPublicPage()}
						<Input
							type="text"
							class="h-8 w-48 justify-self-end px-3 text-sm"
							bind:value={A.mediaEditing.title}
							onchange={async () => {
								titleUpdating = true;
								await updateMediaMetadata();
								titleUpdating = false;
							}} />
					{:else}
						<p>{A.mediaEditing.title}</p>
					{/if}
				</div>

				{#if A.mediaEditing.type === 'image'}
					<MediaImageControls />
				{:else if A.mediaEditing.type === 'audio'}
					<MediaAudioControls />
				{:else if A.mediaEditing.type === 'video'}
					<MediaVideoControls />
				{:else if A.mediaEditing.type === 'pdf'}
					<MediaPDFControls />
				{:else if A.mediaEditing.type === 'text'}
					{#if !isPublicPage()}
						<button
							class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mb-auto')}
							disabled={!textNeedsSave}
							onclick={async () => {
								assert(A.mediaEditing);
								await mediaUpdateText(A.mediaEditing);
							}}>Save changes</button>
					{:else}
						<div class="m-auto grow"></div>
					{/if}
				{/if}
				<button
					class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'justify-self-end bg-base-200 p-1')}
					onclick={() => (A.mediaEditing = undefined)}>Close</button>
			</div>
		{/if}
	</div>

	<button
		class="fixed inset-0 -z-10 cursor-default text-transparent"
		tabindex="-1"
		onclick={() => {
			A.mediaEditing = undefined;
		}}>close</button>
</dialog>
