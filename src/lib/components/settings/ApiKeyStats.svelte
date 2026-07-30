<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils/utils';
	import { Spinner } from '$lib/components/ui/spinner';
	import { A } from '$lib/appstate.svelte';
	import { goto } from '$app/navigation';
	import { APIupsertKey } from '$lib/api';
	import { assert, fixNumberInput } from '$lib/utils/utils';
	import dbg from 'debug';
	import { Check } from 'lucide-svelte';
	const debug = dbg('app:lib:components:ApiKeyStatus');

	let { apiKey = $bindable(), provider }: { apiKey: ApiKeyInterface; provider: string } = $props();

	let status: 'changed' | 'saving' | 'saved' | 'error' | undefined = $state(undefined);
	let errorMessage: string | null = $state(null);
	let updateTimer: ReturnType<typeof setTimeout>;

	async function updateKeyNow() {
		if (!A.user) {
			goto('/login', { invalidateAll: true });
		}
		if (status !== 'changed') return;
		status = 'saving';
		const res = await APIupsertKey(apiKey)
			.then((res) => {
				assert(!apiKey.id || res.id == apiKey.id, 'API Key ID mismatch');
				apiKey.id = res.id;
				status = 'saved';
				updateTimer = setTimeout(() => {
					status = undefined;
				}, 2000);
			})
			.catch((e) => {
				status = 'error';
				errorMessage = e.message;
			});
		status = 'saved';
		Object.assign(apiKey, res);
	}

	function debounceKeyUpdate() {
		debug('debounceKeyUpdate');
		clearTimeout(updateTimer);
		updateTimer = setTimeout(updateKeyNow, 750);
	}
</script>

<div>{provider}/{apiKey.label}</div>

<Input
	type="number"
	class="no-spinner h-8 w-fit"
	bind:value={apiKey.usage}
	onchange={(e) => {
		status = 'changed';
		fixNumberInput(e, 0, 99999);
		debounceKeyUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateKeyNow();
	}} />

<Input
	type="number"
	class="no-spinner h-8 w-fit"
	bind:value={apiKey.remainder}
	oninput={(e) => {
		status = 'changed';
		fixNumberInput(e, 0, Infinity);
		debounceKeyUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateKeyNow();
	}} />
<div class="self-center">
	<Spinner class={cn('size-6', status !== 'saving' && 'hidden')} />
	<div class="" class:hidden={status !== 'saved'}>
		<Check />
	</div>
</div>

<div class="text-error col-span-full" class:hidden={status !== 'error'}>
	<span>{errorMessage}</span>
</div>
