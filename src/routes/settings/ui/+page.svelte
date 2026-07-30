<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';
	import { Spinner } from '$lib/components/ui/spinner';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';

	import { mode, setMode, setTheme, theme } from 'mode-watcher';
	import { A } from '$lib/appstate.svelte';
	import { APIupdateUser } from '$lib/api';

	function cycleTheme() {
		const next = $mode === 'dark' ? 'light' : 'dark';
		setMode(next);
		setTheme(next);
	}

	let updatingUser = $state(false);
	async function updateUserData() {
		if (!A.user) throw new Error('No user');
		updatingUser = true;
		try {
			const newData = await APIupdateUser($state.snapshot(A.user!));
			Object.assign(A.user, newData);
		} finally {
			updatingUser = false;
		}
	}
</script>

<div class="flex flex-col gap-4">
	<div class="grid w-fit grid-cols-[max-content_auto_2rem_4rem_2rem] gap-2">
		<div class="text-sm">Dark mode</div>
		<div></div>
		<Sun />
		<Switch checked={$theme === 'dark'} onCheckedChange={cycleTheme} />
		<Moon />

		{#if A.user}
			<span class="text-sm">Advanced Input</span>
			<div></div>
			<div></div>
			<Switch
				bind:checked={() => A.user?.advancedInput ?? false, (v) => A.user && (A.user.advancedInput = v)}
				disabled={updatingUser}
				onCheckedChange={updateUserData} />
			{#if updatingUser}
				<Spinner class="size-5" />
			{:else}
				<div></div>
			{/if}
		{/if}
	</div>

	{#if A.user?.advancedInput}
		<div
			class="border-primary-content col-span-full grid w-fit grid-cols-[max-content_max-content] items-baseline gap-2 rounded-md border px-1 py-1">
			<kbd
				class="inline-flex w-fit items-center justify-center rounded-md border border-base-content/20 bg-base-200 px-1 px-2 py-1 font-mono text-sm text-xs"
				>Enter</kbd>
			<div>Add a new line to the current message</div>
			<kbd
				class="inline-flex w-fit items-center justify-center rounded-md border border-base-content/20 bg-base-200 px-1 px-2 py-1 font-mono text-sm text-xs"
				>Shift + Enter</kbd>
			<div>Add a user message</div>
			<kbd
				class="inline-flex w-fit items-center justify-center rounded-md border border-base-content/20 bg-base-200 px-1 px-2 py-1 font-mono text-sm text-xs"
				>Ctrl + Shift + Enter</kbd>
			<div>Add an assistant message</div>
			<kbd
				class="inline-flex w-fit items-center justify-center rounded-md border border-base-content/20 bg-base-200 px-1 px-2 py-1 font-mono text-sm text-xs"
				>Ctrl + Enter</kbd>
			<div>Send the message</div>
		</div>
	{:else}
		<div
			class="border-primary-content col-span-full grid w-fit grid-cols-[max-content_max-content] items-baseline gap-2 rounded-md border px-1 py-1">
			<kbd
				class="inline-flex w-fit items-center justify-center rounded-md border border-base-content/20 bg-base-200 px-1 px-2 py-1 font-mono text-sm text-xs"
				>Enter</kbd>
			<div>Send the message</div>
			<kbd
				class="inline-flex w-fit items-center justify-center rounded-md border border-base-content/20 bg-base-200 px-1 px-2 py-1 font-mono text-sm text-xs"
				>Shift + Enter</kbd>
			<div>Add a new line to the message</div>
		</div>
	{/if}
</div>
