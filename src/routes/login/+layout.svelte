<script lang="ts">
	import { CircleArrowLeft } from '@lucide/svelte';
	let { children } = $props();
</script>

<div class="div div-col h-full">
	<a class="mt-2 ml-2 flex gap-2 underline" href="/chat">
		<CircleArrowLeft />Back to Chat
	</a>
	<div class="flex h-full w-full items-center justify-center">
		<div class="relative flex w-fit flex-col rounded-2xl bg-base-100 p-6 shadow-lg">
			{@render children()}
		</div>
	</div>
</div>
