<script lang="ts">
	// Horizontal rule, optionally with a centred label - the daisyUI `divider` shape.
	import { Separator } from '$lib/components/ui/separator';
	import { cn } from '$lib/utils/utils';

	let { class: className = '', children }: { class?: string; children?: import('svelte').Snippet } = $props();
</script>

<div class={cn('flex w-full items-center gap-4 py-2', className)}>
	<Separator class="shrink grow basis-0" />
	{#if children}
		<span class="whitespace-nowrap text-sm">{@render children()}</span>
		<Separator class="shrink grow basis-0" />
	{/if}
</div>
