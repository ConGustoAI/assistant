<script lang="ts">
	import { cn, type WithElementRef } from '$lib/utils/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="card-header"
	class={cn(
		'px-(--card-spacing) [.border-b]:pb-(--card-spacing) group/card-header @container/card-header has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] grid auto-rows-min items-start gap-1 rounded-t-xl',
		className
	)}
	{...restProps}>
	{@render children?.()}
</div>
