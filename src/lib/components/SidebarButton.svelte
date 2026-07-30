<script lang="ts">
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { ArrowLeftSquare, ArrowRightSquare } from 'lucide-svelte';
	import { A } from '$lib/appstate.svelte';
</script>

<button
	class={cn(buttonVariants({ size: 'icon' }), 'rounded-full rounded-xl')}
	aria-label={A.sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
	onclick={() => (A.sidebarOpen = !A.sidebarOpen)}>
	{#if A.sidebarOpen}
		<ArrowLeftSquare />
	{:else}
		<ArrowRightSquare />
	{/if}
</button>
