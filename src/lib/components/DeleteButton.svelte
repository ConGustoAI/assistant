<script lang="ts">
	import { Spinner } from '$lib/components/ui/spinner';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils/utils';
	import { Trash2 } from 'lucide-svelte';

	let {
		deleteAction,
		btnClass = '',
		class: className = '',
		disabled = false,
		title = 'Delete'
	}: {
		deleteAction: () => Promise<void> | void;
		btnClass?: string;
		class?: string;
		disabled?: boolean;
		title?: string | undefined;
	} = $props();

	let deleting = $state(false);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger
		class={cn(disabled && 'pointer-events-none opacity-50', btnClass, className)}
		{title}
		{disabled}>
		{#if deleting}
			<Spinner class="size-5" />
		{:else}
			<Trash2 class="h-full w-auto" />
		{/if}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content class="w-fit p-2">
		<button
			class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'bg-primary text-nowrap rounded-md')}
			onclick={async () => {
				disabled = true;
				deleting = true;
				await deleteAction();
				disabled = false;
				deleting = false;
			}}>Yes, delete!</button>
	</DropdownMenu.Content>
</DropdownMenu.Root>
