<script lang="ts">
	import { A } from '$lib/appstate.svelte';
	import { addImageToSkip, removeImageFromSkip } from '$lib/utils/media_utils.svelte';
	import { assert } from '$lib/utils/utils';

	let { media = $bindable() }: { media: MediaInterface } = $props();
</script>

{#if media.derivedImages}
	{#each media.derivedImages as pdfImage, i}
		{#await pdfImage}
			<div class="h-full w-full bg-blue-500"></div>
			<p>Loading frame {i}...</p>
		{:then f}
			<div class="flex gap-1">
				<label class="px-2" for={`frame-${i}`}>Frame {i} @ {f.timestamp} seconds</label>
				<input
					type="checkbox"
					id={`frame-${i}`}
					checked={!A.mediaEditing?.imagesSkip?.includes(i)}
					onchange={async (e: Event) => {
						assert(A.mediaEditing);
						const selected = (e.target as HTMLInputElement).checked;
						if (!A.mediaEditing.imagesSkip) {
							A.mediaEditing.imagesSkip = [];
						}
						if (selected) await removeImageFromSkip(i);
						else await addImageToSkip(i);
					}} />
			</div>

			<img
				src={f.url}
				alt={`Frame ${i} @ ${f.timestamp} seconds`}
				class="pixilated h-full border-gray-300 object-contain p-2"
				class:opacity-50={A.mediaEditing?.imagesSkip?.includes(i)} />
		{:catch error}
			<p>Error loading page {i}: {error instanceof Error ? error.message : 'Unknown error'}</p>
		{/await}
	{/each}
{/if}
