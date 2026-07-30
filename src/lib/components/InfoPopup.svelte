<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils/utils';
	import { Info } from 'lucide-svelte';
	import type { Snippet } from 'svelte';

	let { class: clas, title, children }: { class?: string; title: string; children?: Snippet } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class={cn(buttonVariants({ variant: 'ghost', size: 'xs' }), 'text-info rounded-full', clas)}>
		<Info class="h-4 w-4 stroke-current" />
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end" class="bg-base-300 w-fit rounded-2xl shadow-sm">
		<div class="flex min-w-96 flex-col gap-2 p-8">
			<h2 class="flex items-center gap-2 text-nowrap text-xl font-semibold">{title}</h2>
			{@render children?.()}
		</div>
	</DropdownMenu.Content>
</DropdownMenu.Root>
