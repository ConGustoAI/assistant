<script lang="ts">
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';

	let {
		items,
		adminItems,
		children
	}: { items: { href: string; title: string }[]; adminItems: { href: string; title: string }[]; children: Snippet } =
		$props();
</script>

<div class="flex h-full">
	<div class="order-2 grow">
		{@render children()}
	</div>

	<ul class="order-1 flex h-auto w-max shrink-0 flex-col p-4 pr-20 text-xl">
		{#each items as item}
			{@const selected = $page.route.id == item.href}
			<li><a class="block px-4 py-2" class:font-bold={selected} href={item.href}>{item.title}</a></li>
		{/each}
		{#if adminItems.length}
			<li class="px-4 py-2 pl-12 text-base">Admin</li>
		{/if}
		{#each adminItems as item}
			{@const selected = $page.route.id == item.href}
			<li><a class="block px-4 py-2" class:font-bold={selected} href={item.href}>{item.title}</a></li>
		{/each}
	</ul>
</div>
