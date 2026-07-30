<script lang="ts">
	import { ArrowLeftCircle } from 'lucide-svelte';
	let { children } = $props();
</script>

<div class="div div-col h-full">
	<a class="ml-2 mt-2 flex gap-2 underline" href="/chat">
		<ArrowLeftCircle />Back to Chat
	</a>
	<div class="flex h-full w-full items-center justify-center">
		<div class="card card-normal bg-base-100 rounded-box w-fit p-6 shadow-lg">
			{@render children()}
		</div>
	</div>
</div>
