<script lang="ts">
	import { Slider as SliderPrimitive } from 'bits-ui';
	import { cn, type WithoutChildrenOrChild } from '$lib/utils/utils.js';

	let {
		ref = $bindable(null),
		value = $bindable(),
		orientation = 'horizontal',
		class: className,
		...restProps
	}: WithoutChildrenOrChild<SliderPrimitive.RootProps> = $props();
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<SliderPrimitive.Root
	bind:ref
	bind:value={value as never}
	data-slot="slider"
	{orientation}
	class={cn(
		'data-vertical:min-h-40 data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col relative flex w-full touch-none select-none items-center',
		className
	)}
	{...restProps}>
	{#snippet children({ thumbItems })}
		<span
			data-slot="slider-track"
			data-orientation={orientation}
			class={cn(
				'bg-muted data-horizontal:h-1.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-1.5 bg-muted data-horizontal:w-full data-vertical:h-full relative grow overflow-hidden rounded-full'
			)}>
			<SliderPrimitive.Range
				data-slot="slider-range"
				class={cn('bg-primary data-horizontal:h-full data-vertical:w-full absolute select-none')} />
		</span>
		{#each thumbItems as thumb (thumb.index)}
			<SliderPrimitive.Thumb
				data-slot="slider-thumb"
				index={thumb.index}
				class="border-primary ring-ring/50 focus-visible:outline-hidden block size-4 shrink-0 select-none rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50" />
		{/each}
	{/snippet}
</SliderPrimitive.Root>
