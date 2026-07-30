<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '$lib/components/ui/spinner';
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import Divider from '$lib/components/Divider.svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { APIhideItem, APIunhideItem, APIupsertAssistant } from '$lib/api';
	import { AssistantDetails, AssistantPrompt, DeleteButton } from '$lib/components';
	import { defaultsUUID } from '$lib/db/schema';
	import { A } from '$lib/appstate.svelte';
	import { assert } from '$lib/utils/utils';
	import dbg from 'debug';
	import { Check, Copy, Eye, EyeOff } from 'lucide-svelte';
	const debug = dbg('app:ui:components:Assistant');

	let {
		assistant = $bindable(),
		deleteAssistant,
		copyAssistant,
		edit,
		showDefault,
		allowHiding = true
	}: {
		assistant: AssistantInterface;
		deleteAssistant: (assistant: AssistantInterface) => void;
		copyAssistant: (assistant: AssistantInterface) => Promise<void>;
		edit: boolean;
		showDefault: boolean;
		allowHiding?: boolean;
	} = $props();

	let status: 'changed' | 'saving' | 'saved' | 'error' | 'deleting' | 'hiding' | 'copying' | null | undefined =
		$state(undefined);
	let errorMessage: string | null = $state(null);
	let updateTimer: ReturnType<typeof setTimeout>;

	// Don't let the user navigate off if changes are unsaved
	beforeNavigate((navigation) => {
		if (status && status != 'saved') {
			if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
				navigation.cancel();
			}
		}
	});

	function updateAssistantNow() {
		if (!A.user) {
			goto('/login', { invalidateAll: true });
		}
		if (status !== 'changed') return;
		status = 'saving';
		return APIupsertAssistant(assistant)
			.then((res) => {
				assert(!assistant.id || res.id == assistant.id, 'Assistant ID mismatch');
				assistant.id = res.id;
				status = 'saved';
				updateTimer = setTimeout(() => {
					status = null;
				}, 2000);
			})
			.catch((e) => {
				status = 'error';
				errorMessage = e.message;
			});
	}

	function debounceAssistantUpdate() {
		debug('debounceAssistantUpdate');
		clearTimeout(updateTimer);
		updateTimer = setTimeout(updateAssistantNow, 750);
	}

	function statusChanged() {
		debug('statusChanged');
		if (assistant.images && assistant.modelID && !A.models[assistant.modelID].images) {
			assistant.images = false;
		}
		if (assistant.audio && assistant.modelID && !A.models[assistant.modelID].audio) {
			assistant.audio = false;
		}
		if (assistant.video && assistant.modelID && !A.models[assistant.modelID].video) {
			assistant.video = false;
		}
		if (assistant.prefill && assistant.modelID && !A.models[assistant.modelID].prefill) {
			assistant.prefill = false;
		}

		status = 'changed';
		debounceAssistantUpdate();
	}

	let detailsToggled = $state(false);

	async function toggleHidden() {
		if (!A.user) {
			await goto('/login', { invalidateAll: true });
			return;
		}

		if (assistant.id && allowHiding) {
			if (A.hiddenItems.has(assistant.id)) {
				await APIunhideItem(assistant.id);
				A.hiddenItems.delete(assistant.id);
			} else {
				await APIhideItem(assistant.id);
				A.hiddenItems.add(assistant.id);
			}
			A.hiddenItems = A.hiddenItems;
		}
	}

	let yourProviders = $derived(
		Object.fromEntries(
			Object.entries(A.providers).filter(
				([_, provider]) => provider.userID === A.user?.id && !A.hiddenItems.has(provider.id!)
			)
		)
	);
	let defaultProviders = $derived(
		Object.fromEntries(
			Object.entries(A.providers).filter(
				([_, provider]) => provider.userID === defaultsUUID && !A.hiddenItems.has(provider.id!)
			)
		)
	);

	let model = $derived(assistant.modelID ? A.models[assistant.modelID] : null);
	let provider = $derived(model ? A.providers[model.providerID] : null);
</script>

<button
	class={buttonVariants({ variant: 'outline' })}
	onclick={async () => {
		status = 'copying';
		await copyAssistant(assistant);
		status = null;
	}}
	disabled={status === 'copying'}>
	{#if status === 'copying'}
		<Spinner class="size-6" />
	{:else}
		<Copy />
	{/if}
</button>

<Input
	type="text"
	class="w-full"
	bind:value={assistant.name}
	oninput={statusChanged}
	onblur={() => {
		clearTimeout(updateTimer);
		updateAssistantNow();
	}}
	spellcheck="false"
	disabled={!edit} />

<select
	class="h-12 w-full rounded-none border border-input bg-base-100 px-4 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
	bind:value={assistant.modelID}
	onchange={statusChanged}
	onblur={() => {
		clearTimeout(updateTimer);
		updateAssistantNow();
	}}
	disabled={!edit}>
	{#if Object.keys(yourProviders).length}
		<option disabled class="text-lg font-bold">Your providers</option>
		{#each Object.entries(yourProviders) as [_, provider]}
			{#each Object.entries(A.models) as [_, model]}
				{#if model.id && model.providerID === provider.id && !A.hiddenItems.has(model.id)}
					<option value={model.id}>{provider.name}/{model.displayName}</option>
				{/if}
			{/each}
		{/each}
	{/if}

	{#if Object.keys(defaultProviders).length}
		<option disabled class="text-lg font-bold">Default providers</option>
		{#each Object.entries(defaultProviders) as [_, provider]}
			{#each Object.entries(A.models) as [_, model]}
				{#if model.id && model.providerID === provider.id && !A.hiddenItems.has(model.id)}
					<option value={model.id}>{provider.name}/{model.displayName}</option>
				{/if}
			{/each}
		{/each}
	{/if}
</select>

<select
	class="h-12 rounded-none border border-input bg-base-100 px-4 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
	bind:value={assistant.apiKeyID}
	onchange={statusChanged}
	onblur={() => {
		clearTimeout(updateTimer);
		updateAssistantNow();
	}}
	disabled={!edit}>
	{#if assistant.modelID}
		{@const model = A.models[assistant.modelID]}
		{@const provider = model ? A.providers[model.providerID] : null}
		{#if provider}
			<option value={defaultsUUID}>First available</option>

			{#each Object.entries(A.apiKeys) as [_, key]}
				{#if key.providerID === model.providerID}
					<option value={key.id}>{provider.name}/{key.label}</option>
				{/if}
			{/each}
		{/if}
	{:else}
		<option disabled>No model</option>
	{/if}
</select>

<Input
	type="text"
	class="w-full"
	bind:value={assistant.about}
	spellcheck="false"
	oninput={statusChanged}
	onblur={() => {
		clearTimeout(updateTimer);
		updateAssistantNow();
	}}
	disabled={!edit} />

<button
	class={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
	onclick={() => (detailsToggled = !detailsToggled)}
	class:btn-active={detailsToggled}>
	Details
</button>

<button
	class={cn(buttonVariants({ variant: 'outline' }), 'p-2')}
	disabled={status === 'hiding' || !allowHiding}
	onclick={async () => {
		status = 'hiding';
		await toggleHidden();
		status = null;
	}}>
	{#if status === 'hiding'}
		<Spinner class="size-6" />
	{:else if A.hiddenItems.has(assistant.id ?? '') && allowHiding}
		<EyeOff />
	{:else}
		<Eye />
	{/if}
</button>

<DeleteButton
	btnClass={cn(buttonVariants({ variant: 'outline' }), 'h-full w-full p-2')}
	deleteAction={async () => {
		status = 'deleting';
		await deleteAssistant(assistant);
		status = null;
	}}
	disabled={!edit || status === 'deleting'} />

<div class="relative self-center">
	<Spinner class={cn('absolute top-1 size-6', status !== 'saving' && 'hidden')} />
	<div class="absolute" class:hidden={status !== 'saved'}>
		<Check />
	</div>
</div>
<div class="col-span-full text-error" class:hidden={status !== 'error'}>
	<span>{errorMessage}</span>
</div>

{#if detailsToggled && model && provider}
	<div class="col-span-full col-start-2 w-full">
		<Divider>{assistant.name}: Details</Divider>
	</div>

	<div class="col-span-full col-start-2 mb-6 flex w-full flex-col gap-2">
		{#if showDefault && edit}
			<Divider
				><span class="w-fit rounded-2xl bg-warning px-4 py-0 text-black"
					>Changes made here will be visible to and will affect all users</span
				></Divider>
		{/if}

		<AssistantDetails bind:assistant {edit} onchange={statusChanged} {model} {provider} />
		<AssistantPrompt bind:assistant {edit} oninput={statusChanged} />
	</div>
{/if}
