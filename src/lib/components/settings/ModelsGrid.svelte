<script lang="ts">
	import { Spinner } from '$lib/components/ui/spinner';
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { APIdeleteModel, APIupsertModel } from '$lib/api';
	import { InfoPopup, Model } from '$lib/components';
	import { defaultsUUID } from '$lib/db/schema';
	import { A } from '$lib/appstate.svelte';
	import { Plus } from 'lucide-svelte';
	import dbg from 'debug';
	import { goto } from '$app/navigation';

	const debug = dbg('app:ui:components:ModelsGrid');

	let {
		provider,
		edit,
		showDefault,
		showCustom,
		allowHiding = true,
		newChildUserID
	}: {
		provider: ProviderInterface;
		edit: boolean;
		showDefault: boolean;
		showCustom: boolean;
		allowHiding?: boolean;
		newChildUserID: string;
	} = $props();

	let addingModel = $state(false);
	async function addModel() {
		debug('add model');
		if (!A.user || !newChildUserID) {
			await goto('/login', { invalidateAll: true });
		}
		addingModel = true;
		const newModel = await APIupsertModel({
			userID: newChildUserID,
			providerID: provider.id!,
			displayName: 'New Model',
			name: '',
			inputContext: 8192,
			outputContext: 4096,
			maxTemp: 2,
			streaming: true,
			images: false,
			prefill: false
		});
		A.models[newModel.id!] = newModel;
		addingModel = false;
		debug('new model', newModel);
	}

	async function deleteModel(model: ModelInterface) {
		debug('delete model', model);
		const user = A.user;
		if (!user) {
			await goto('/login', { invalidateAll: true });
		}
		const del = await APIdeleteModel(model);
		delete A.models[del.id!];
		debug('delete model done', del);
	}

	let modelsToShow = $derived(
		Object.keys(A.models).filter(
			(k) =>
				A.models[k].providerID === provider.id &&
				((showDefault && A.models[k].userID === defaultsUUID) || (showCustom && A.models[k].userID !== defaultsUUID))
		)
	);
</script>

<div class="flex w-full flex-col gap-4" id="#{provider.id}/models">
	{#if modelsToShow.length !== 0}
		<h2 class="text-xl font-bold">{provider.name} Models</h2>
		<div
			class="grid grid-cols-[15rem_max-content_min-content_min-content_min-content_min-content_min-content_min-content_min-content_min-content_min-content_min-content_min-content_min-content_min-content_min-content_min-content_3.5rem_min-content] items-center gap-4 gap-y-2">
			<div class="font-bold">Display name</div>
			<div class="font-bold">Model name</div>
			<div class="relative font-bold">
				Input
				<div class="absolute -top-5">
					<InfoPopup class="text-sm" title="Input context length"
						>Maximum number of input tokens the model can process</InfoPopup>
				</div>
			</div>
			<div class="relative font-bold" title="Input cost $ for 1M tokens">
				$/1M
				<div class="absolute -top-5">
					<InfoPopup title="Input cost">Cost in dollars per 1 million input tokens</InfoPopup>
				</div>
			</div>
			<div class="relative font-bold">
				Output
				<div class="absolute -top-5">
					<InfoPopup title="Output context length">Maximum number of output tokens the model can generate</InfoPopup>
				</div>
			</div>
			<div class="relative font-bold" title="Output cost $ per 1M tokens">
				$/1M
				<div class="absolute -top-5">
					<InfoPopup title="Output cost">Cost in dollars per 1 million output tokens</InfoPopup>
				</div>
			</div>
			<div class="font-bold">Max t&deg;</div>
			<!-- <div class="relative flex text-xl font-bold" title="Streaming">
			📡
			<div class="absolute -top-5">
				<InfoPopup title="Model supports streaming"
					>Most models support streaming, OpenAI o1 series being an exception</InfoPopup>
			</div>
		</div> -->

			<div class="relative flex font-bold">
				📝
				<div class="absolute -top-5">
					<InfoPopup title="Model supports prefill"
						>Prefill lets you start the message for the assistant, and the assistant will continue the message.</InfoPopup>
				</div>
			</div>

			<div class="relative flex text-xl font-bold" title="Images">
				🎨
				<div class="absolute -top-5"><InfoPopup title="Model suppurts images" /></div>
			</div>
			<div class="relative flex text-xl font-bold" title="Audio">
				🔉
				<div class="absolute -top-5"><InfoPopup title="Model supports audio" /></div>
			</div>
			<div class="relative flex text-xl font-bold" title="Video">
				📺
				<div class="absolute -top-5"><InfoPopup title="Model supports video" /></div>
			</div>
			<div class="relative flex text-xl font-bold" title="PDF">
				🖨️
				<div class="absolute -top-5"><InfoPopup title="Model supports PDF" /></div>
			</div>
			<div class="relative flex text-xl font-bold" title="Temperature enabled">
				🌡
				<div class="absolute -top-5"><InfoPopup title="Enable temperature parameter" /></div>
			</div>
			<div class="relative flex text-sm font-bold" title="Top-p enabled">
				Top-p
				<div class="absolute -top-5"><InfoPopup title="Enable top-p parameter" /></div>
			</div>
			<div class="relative flex text-sm font-bold" title="Top-k enabled">
				Top-k
				<div class="absolute -top-5"><InfoPopup title="Enable top-k parameter" /></div>
			</div>
			<div class="relative flex text-sm font-bold" title="Max tokens enabled">
				Max tokens
				<div class="absolute -top-5"><InfoPopup title="Enable max tokens parameter" /></div>
			</div>
			<div class="font-bold">Hide</div>
			<div class="font-bold">Delete</div>
			<div></div>

			{#each modelsToShow as m}
				<!-- {#if model.providerID === provider.id && ((showDefault && model.userID === defaultsUUID) || (showCustom && model.userID !== defaultsUUID))} -->
				<Model bind:model={A.models[m]} {deleteModel} {edit} {allowHiding} />
				<!-- {/if} -->
			{/each}
		</div>
	{/if}
	{#if edit}
		<button
			class={cn(buttonVariants({ variant: 'outline' }), 'w-fit')}
			onclick={async () => {
				await addModel();
			}}>
			{#if addingModel}
				<Spinner class="size-6" />
			{:else}
				<Plus />
			{/if}
			Model
		</button>
	{/if}
</div>
