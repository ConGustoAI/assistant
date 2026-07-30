<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '$lib/components/ui/spinner';
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import Divider from '$lib/components/Divider.svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { APIdeleteProvider, APIhideItem, APIunhideItem, APIupsertModel, APIupsertProvider } from '$lib/api';
	import { A } from '$lib/appstate.svelte';
	import { ApiKeysGrid, DeleteButton, ModelsGrid } from '$lib/components';
	import { defaultsUUID, providerTypes } from '$lib/db/schema';
	import { assert, capitalize } from '$lib/utils/utils';
	import { Check, Copy, Eye, EyeOff } from '@lucide/svelte';

	import { page } from '$app/stores';
	import dbg from 'debug';
	const debug = dbg('app:ui:components:Provider');

	let {
		provider = $bindable(),
		edit,
		allowHiding = true,
		showDefaultChildren,
		showCustomChildren,
		editDefaultChildren,
		editCustomChildren,
		newChildUserID,
		newProviderUserID
	}: {
		provider: ProviderInterface;
		edit: boolean;
		allowHiding?: boolean;
		showDefaultChildren: boolean;
		showCustomChildren: boolean;
		editDefaultChildren: boolean;
		editCustomChildren: boolean;
		newChildUserID: string;
		newProviderUserID: string;
	} = $props();

	let status: 'changed' | 'saving' | 'saved' | 'error' | 'deleting' | 'hiding' | 'copying' | null | undefined =
		$state(undefined);
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

	let types = providerTypes.enumValues.map((type) => {
		return { value: type, label: type };
	});

	function updateProviderNow() {
		if (!A.user) {
			goto('/login', { invalidateAll: true });
		}
		if (status !== 'changed') return;
		status = 'saving';
		return APIupsertProvider(provider)
			.then((res) => {
				assert(!provider.id || res.id == provider.id, 'provider ID mismatch');
				provider.id = res.id;
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

	function debounceProviderUpdate() {
		debug('debounceProviderUpdate');
		clearTimeout(updateTimer);
		updateTimer = setTimeout(updateProviderNow, 750);
	}

	async function copyProvider(provider: ProviderInterface) {
		debug('copy provider', provider);
		if (!A.user || !newProviderUserID || !newChildUserID) {
			await goto('/login', { invalidateAll: true });
		}

		const newProvider = await APIupsertProvider({
			...provider,
			id: undefined,
			userID: newProviderUserID,
			name: provider.name + ' (copy)'
		});

		let newModels: ModelInterface[] = [];

		// Copy all models associated with the provider.
		// If the new provider is a default provider, only copy the default models.
		// If the new provider is a user provider, copy both default and user models.
		Object.values(A.models).forEach((model) => {
			if (model.providerID === provider.id) {
				if (model.userID === defaultsUUID || (newProviderUserID !== defaultsUUID && model.userID === A.user?.id)) {
					newModels.push({
						...model,
						id: undefined,
						providerID: newProvider.id!,
						userID: newChildUserID
					});
				}
			}
		});

		const insertedModels = await Promise.all(newModels.map((m) => APIupsertModel(m)));
		insertedModels.forEach((m) => {
			A.models[m.id!] = m;
		});
		A.providers[newProvider.id!] = newProvider;
		debug('copy provider done', { newProvider, newModels });
	}

	async function deleteProvider(provider: ProviderInterface) {
		debug('delete provider', provider);
		if (!A.user) {
			await goto('/login', { invalidateAll: true });
		}

		const del = await APIdeleteProvider(provider);
		debug('delete provider', del);
		delete A.providers[del.id!];
	}

	async function toggleHidden() {
		if (!A.user) {
			await goto('/login', { invalidateAll: true });
			return;
		}

		if (provider.id && allowHiding) {
			if (A.hiddenItems.has(provider.id)) {
				await APIunhideItem(provider.id);
				A.hiddenItems.delete(provider.id);
			} else {
				await APIhideItem(provider.id);
				A.hiddenItems.add(provider.id);
			}
			A.hiddenItems = A.hiddenItems;
		}
	}

	let showApiKeys = $state(false);
	let showModels = $state(false);
	$effect(() => {
		showApiKeys = $page.url.hash == `#${provider.id}/keys`;
		showModels = $page.url.hash == `#${provider.id}/models`;
	});

	let streamUsage = $derived(provider.type !== 'openai' || provider.openAIStreamUsage);

	function streamUsageChanged(checked: boolean) {
		if (provider.type === 'openai') {
			provider.openAIStreamUsage = checked;
			status = 'changed';
			debounceProviderUpdate();
		}
	}

	$inspect(status);
</script>

<button
	id="#{provider.id}"
	class={buttonVariants({ variant: 'outline' })}
	onclick={async () => {
		status = 'copying';
		await copyProvider(provider);
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
	bind:value={provider.name}
	oninput={() => {
		status = 'changed';
		debounceProviderUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateProviderNow();
	}}
	spellcheck="false"
	disabled={!edit} />
<select
	class="h-12 w-full rounded-none border border-input bg-base-100 px-4 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:border-base-200 disabled:bg-base-200 disabled:text-base-content/40"
	bind:value={provider.type}
	onchange={() => {
		status = 'changed';
		debounceProviderUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateProviderNow();
	}}
	disabled={!edit}>
	{#each types as type}
		<option value={type.value}>{capitalize(type.label)}</option>
	{/each}
</select>

<Checkbox disabled={!edit || provider.type !== 'openai'} checked={streamUsage} onCheckedChange={streamUsageChanged} />

<Input
	type="text"
	class="w-full"
	bind:value={provider.baseURL}
	spellcheck="false"
	oninput={() => {
		status = 'changed';
		debounceProviderUpdate();
	}}
	onblur={() => {
		clearTimeout(updateTimer);
		updateProviderNow();
	}}
	disabled={!edit} />

<button
	class={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
	aria-expanded={showApiKeys}
	onclick={() => (showApiKeys = !showApiKeys)}>
	API Keys
</button>
<button
	class={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
	aria-expanded={showModels}
	onclick={() => (showModels = !showModels)}>
	Models
</button>

<button
	class={cn(buttonVariants({ variant: 'outline' }), 'p-2.5')}
	disabled={status === 'hiding' || !allowHiding}
	onclick={async () => {
		status = 'hiding';
		await toggleHidden();
		status = null;
	}}>
	{#if status === 'hiding'}
		<Spinner class="size-6" />
	{:else if A.hiddenItems.has(provider.id ?? '') && allowHiding}
		<EyeOff size="fit-h" />
	{:else}
		<Eye size="fit-h" />
	{/if}
</button>

<DeleteButton
	btnClass={cn(buttonVariants({ variant: 'outline' }), 'h-full w-full p-2.5')}
	deleteAction={async () => {
		status = 'deleting';
		await deleteProvider(provider);
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

{#if showModels}
	<div class="col-span-full col-start-2 mb-6 flex w-full flex-col items-center gap-4">
		{#if showCustomChildren}
			<Divider class="col-span-full">{provider.name}: Your models</Divider>
			<ModelsGrid
				{provider}
				edit={editCustomChildren}
				showCustom={true}
				showDefault={false}
				{newChildUserID}
				{allowHiding} />
		{/if}

		{#if showDefaultChildren}
			<Divider class="col-span-full">{provider.name}: Default models</Divider>
			{#if editDefaultChildren}
				<Divider
					><span class="w-fit rounded-2xl bg-warning px-4 py-0 text-black"
						>Changes made here will be visible to and will affect all users</span
					></Divider>
			{/if}

			<ModelsGrid
				{provider}
				edit={editDefaultChildren}
				showCustom={false}
				showDefault={true}
				{newChildUserID}
				{allowHiding} />
		{/if}
		<Divider class="col-span-full" />
	</div>
{/if}

{#if showApiKeys}
	<div class="col-span-full col-start-2 flex w-full flex-col items-center gap-4">
		{#if showCustomChildren}
			<Divider>{provider.name}: Your API keys</Divider>
			<ApiKeysGrid {provider} edit={editCustomChildren} showCustom={true} showDefault={false} {newChildUserID} />
		{/if}

		{#if showDefaultChildren && (Object.values(A.apiKeys).filter((v) => v.providerID === provider.id && v.userID === defaultsUUID).length || editDefaultChildren)}
			<Divider>{provider.name}: Default API Keys</Divider>
			{#if editDefaultChildren}
				<Divider
					><span class="w-fit rounded-2xl bg-error px-4 py-0 text-black"
						>Only admins can see default keys, but any user can make requests with them</span
					></Divider>
			{/if}

			<ApiKeysGrid {provider} edit={editDefaultChildren} showCustom={false} showDefault={true} {newChildUserID} />
		{/if}
		<Divider />
	</div>
{/if}
