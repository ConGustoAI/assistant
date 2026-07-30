<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils/utils';
	import { Spinner } from '$lib/components/ui/spinner';
	import { buttonVariants } from '$lib/components/ui/button';
	import { beforeNavigate, goto } from '$app/navigation';
	import { APIhideItem, APIunhideItem } from '$lib/api';
	import { APIupsertModel } from '$lib/api/model';
	import { DeleteButton } from '$lib/components';
	import { A } from '$lib/appstate.svelte';
	import { assert } from '$lib/utils/utils';
	import { Check, Eye, EyeOff } from 'lucide-svelte';
	import dbg from 'debug';
	const debug = dbg('app:lib:components:Model');

	let {
		model = $bindable(),
		edit,
		deleteModel,
		allowHiding = true
	}: {
		model: ModelInterface;
		edit: boolean;
		deleteModel: (model: ModelInterface) => Promise<void>;
		allowHiding?: boolean;
	} = $props();

	let status: 'changed' | 'saving' | 'saved' | 'error' | 'deleting' | 'hiding' | null | undefined = $state(undefined);
	let errorMessage: string | null = $state(null);
	let updateTimer: ReturnType<typeof setTimeout> | undefined;

	// Don't let the user navigate off if changes are unsaved
	beforeNavigate((navigation) => {
		if (status && status != 'saved') {
			if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
				navigation.cancel();
			}
		}
	});

	async function updateModelNow() {
		if (!A.user) {
			goto('/login', { invalidateAll: true });
		}
		if (status !== 'changed') return;
		status = 'saving';
		const res = await APIupsertModel(model)
			.then((res) => {
				assert(!model.id || res.id == model.id, 'model ID mismatch');
				model.id = res.id;
				status = 'saved';
				updateTimer = setTimeout(() => {
					status = null;
				}, 2000);
			})
			.catch((e) => {
				status = 'error';
				errorMessage = e.message;
			});
		status = 'saved';
		Object.assign(model, res);
	}

	function debounceModelUpdate() {
		debug('debounceModelUpdate');
		clearTimeout(updateTimer);
		updateTimer = setTimeout(updateModelNow, 750);
	}

	async function toggleHidden() {
		if (!A.user) {
			await goto('/login', { invalidateAll: true });
		}

		if (model.id) {
			if (A.hiddenItems.has(model.id)) {
				await APIunhideItem(model.id);
				A.hiddenItems.delete(model.id);
			} else {
				await APIhideItem(model.id);
				A.hiddenItems.add(model.id);
			}
		}
	}

	$inspect(status);
</script>

<Input
	type="text"
	class="w-full"
	bind:value={model.displayName}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		status = 'changed';
		updateModelNow();
	}}
	spellcheck="false"
	disabled={!edit || status === 'deleting'} />

<Input
	type="text"
	class="w-full"
	bind:value={model.name}
	spellcheck="false"
	disabled={!edit || status === 'deleting'}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		status = 'changed';
		clearTimeout(updateTimer);
		updateModelNow();
	}} />
<Input
	type="number"
	class="no-spinner w-28"
	bind:value={model.inputContext}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />

<Input
	type="number"
	class="no-spinner w-16"
	bind:value={model.inputCost}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />
<Input
	type="number"
	class="no-spinner w-28"
	bind:value={model.outputContext}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />

<Input
	type="number"
	class="no-spinner w-16"
	bind:value={model.outputCost}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />
<Input
	type="number"
	class="no-spinner w-14"
	bind:value={model.maxTemp}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />

<Checkbox
	bind:checked={() => model.prefill ?? false, (v) => (model.prefill = v)}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />

<Checkbox
	bind:checked={() => model.images ?? false, (v) => (model.images = v)}
	oninput={() => {
		status = 'changed';
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />
<Checkbox
	bind:checked={() => model.audio ?? false, (v) => (model.audio = v)}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />
<Checkbox
	bind:checked={() => model.video ?? false, (v) => (model.video = v)}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />

<Checkbox
	bind:checked={() => model.pdf ?? false, (v) => (model.pdf = v)}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />

<Checkbox
	bind:checked={() => model.temperature_enabled ?? false, (v) => (model.temperature_enabled = v)}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />

<Checkbox
	bind:checked={() => model.top_p_enabled ?? false, (v) => (model.top_p_enabled = v)}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />

<Checkbox
	bind:checked={() => model.top_k_enabled ?? false, (v) => (model.top_k_enabled = v)}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />

<Checkbox
	bind:checked={() => model.max_tokens_enabled ?? false, (v) => (model.max_tokens_enabled = v)}
	oninput={() => {
		status = 'changed';
		debounceModelUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateModelNow();
	}}
	disabled={!edit || status === 'deleting'} />

<button
	class={buttonVariants({ variant: 'outline' })}
	disabled={status === 'hiding' || !allowHiding}
	onclick={async () => {
		status = 'hiding';
		await toggleHidden();
		status = null;
	}}>
	{#if status === 'hiding'}
		<Spinner class="size-6" />
	{:else if A.hiddenItems.has(model.id ?? '') && allowHiding}
		<EyeOff />
	{:else}
		<Eye />
	{/if}
</button>

<DeleteButton
	btnClass="btn btn-outline h-full w-full"
	class=""
	deleteAction={async () => {
		status = 'deleting';
		await deleteModel(model);
		status = null;
	}}
	disabled={!edit || status === 'deleting'} />

<div class="relative self-center">
	<Spinner class={cn('absolute top-1 size-6', status !== 'saving' && 'hidden')} />
	<div class="absolute top-1" class:hidden={status !== 'saved'}>
		<Check />
	</div>
</div>
<div class="text-error col-span-full" class:hidden={status !== 'error'}>
	<span>{errorMessage}</span>
</div>
