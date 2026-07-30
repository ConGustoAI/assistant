<script lang="ts">
	import { Slider } from '$lib/components/ui/slider';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';
	import { fixNumberInput } from '$lib/utils/utils';
	import InfoPopup from '../InfoPopup.svelte';

	let {
		assistant = $bindable(),
		model,
		provider,
		edit,
		onchange
	}: {
		assistant: AssistantInterface;
		model: ModelInterface | undefined;
		provider: ProviderInterface;
		edit: boolean;
		onchange: () => void;
	} = $props();

	$effect(() => {
		if (model) {
			let changed = false;
			if (assistant.temperature_enabled && model.temperature_enabled === false) {
				assistant.temperature_enabled = false;
				changed = true;
			}
			if (assistant.top_p_enabled && model.top_p_enabled === false) {
				assistant.top_p_enabled = false;
				changed = true;
			}
			if (assistant.top_k_enabled && model.top_k_enabled === false) {
				assistant.top_k_enabled = false;
				changed = true;
			}
			if (assistant.max_tokens_enabled && model.max_tokens_enabled === false) {
				assistant.max_tokens_enabled = false;
				changed = true;
			}
			if (assistant.prefill && model.prefill === false) {
				assistant.prefill = false;
				changed = true;
			}
			if (assistant.images && model.images === false) {
				assistant.images = false;
				changed = true;
			}
			if (assistant.audio && model.audio === false) {
				assistant.audio = false;
				changed = true;
			}
			if (assistant.video && model.video === false) {
				assistant.video = false;
				changed = true;
			}
			if (assistant.pdf && model.pdf === false) {
				assistant.pdf = false;
				changed = true;
			}
			if (changed) {
				onchange();
			}
		}
	});
</script>

<div
	class="grid w-full grid-cols-[min-content_max-content_max-content_max-content_min-content_min-content_min-content_min-content_min-content_auto] items-center gap-x-4 gap-y-2">
	<div class="flex items-center justify-center gap-2 text-sm">
		<div class="text-center">Temperature</div>
	</div>
	<div class="flex items-center justify-center gap-2 text-sm">
		<div class="text-center">Top P</div>
	</div>
	<div class="flex items-center justify-center gap-2 text-sm">
		<div class="text-center">Top K</div>
	</div>

	<div class="flex items-center justify-center gap-2 pr-5 text-sm">
		<div class="text-center">Out tokens</div>
	</div>

	<div class="relative flex justify-center text-center font-bold">
		📝
		<div class="absolute -top-5">
			<InfoPopup title="Model supports prefill"
				>Prefill lets you start the message for the assistant, and the assistant will continue the message.</InfoPopup>
		</div>
	</div>

	<div class="relative flex justify-center text-center text-xl font-bold" title="Images">
		🎨
		<div class="absolute -top-5"><InfoPopup title="Model suppurts images" /></div>
	</div>
	<div class="relative flex justify-center text-center text-xl font-bold" title="Audio">
		🔉
		<div class="absolute -top-5"><InfoPopup title="Model supports audio" /></div>
	</div>
	<div class="relative flex justify-center text-xl font-bold" title="Video">
		📺
		<div class="absolute -top-5"><InfoPopup title="Model supports video" /></div>
	</div>
	<div class="relative flex justify-center text-xl font-bold" title="PDF">
		🖨️
		<div class="absolute -top-5"><InfoPopup title="Model supports PDF" /></div>
	</div>
	{#if provider.type === 'google'}
		<div class="flex justify-center text-sm">Gemini safety threshold (all categories)</div>
	{:else}
		<div></div>
	{/if}

	<div class="flex items-center gap-2">
		<Checkbox
			id="temperature_enabled-{assistant.id}"
			class="size-4 [&>span>svg]:size-3"
			checked={assistant.temperature_enabled && model?.temperature_enabled !== false}
			disabled={!edit || !model?.temperature_enabled}
			onCheckedChange={(e) => {
				assistant.temperature_enabled = e;
				onchange();
			}} />
		<Input
			type="number"
			class="no-spinner h-8 w-14 px-3 py-0 text-sm leading-none"
			bind:value={assistant.temperature}
			onchange={(e) => {
				fixNumberInput(e, 0, model?.maxTemp ?? 2);
				onchange();
			}}
			disabled={!edit || !(assistant.temperature_enabled && model?.temperature_enabled !== false)} />
	</div>

	<div class="flex items-center gap-2">
		<Checkbox
			id="top_p_enabled-{assistant.id}"
			class="size-4 [&>span>svg]:size-3"
			checked={assistant.top_p_enabled && model?.top_p_enabled !== false}
			disabled={!edit || !model?.top_p_enabled}
			onCheckedChange={(e) => {
				assistant.top_p_enabled = e;
				onchange();
			}} />
		<Input
			type="number"
			class="no-spinner h-8 w-14 px-3 py-0 text-sm leading-none"
			bind:value={assistant.topP}
			onchange={(e) => {
				fixNumberInput(e, 0, 1);
				onchange();
			}}
			disabled={!edit || !(assistant.top_p_enabled && model?.top_p_enabled !== false)} />
	</div>

	<div class="flex items-center gap-2">
		<Checkbox
			id="top_k_enabled-{assistant.id}"
			class="size-4 [&>span>svg]:size-3"
			checked={assistant.top_k_enabled && model?.top_k_enabled !== false}
			disabled={!edit || !model?.top_k_enabled}
			onCheckedChange={(e) => {
				assistant.top_k_enabled = e;
				onchange();
			}} />
		<Input
			type="number"
			class="no-spinner h-8 w-14 px-3 py-0 text-sm leading-none"
			bind:value={assistant.topK}
			onchange={(e) => {
				fixNumberInput(e, 0, 1000);
				onchange();
			}}
			disabled={!edit || !(assistant.top_k_enabled && model?.top_k_enabled !== false)} />
	</div>

	<div class="flex items-center gap-2 pr-5">
		<Checkbox
			id="max_tokens_enabled-{assistant.id}"
			class="size-4 [&>span>svg]:size-3"
			checked={assistant.max_tokens_enabled && model?.max_tokens_enabled !== false}
			disabled={!edit || !model?.max_tokens_enabled}
			onCheckedChange={(e) => {
				assistant.max_tokens_enabled = e;
				onchange();
			}} />
		<Input
			type="number"
			class="no-spinner h-8 w-14 px-3 py-0 text-sm leading-none"
			bind:value={assistant.maxTokens}
			onchange={(e) => {
				fixNumberInput(e, 0, model?.outputContext ?? 4096);
				onchange();
			}}
			disabled={!edit || !(assistant.max_tokens_enabled && model?.max_tokens_enabled !== false)} />
	</div>

	<Checkbox
		id="prefillCheckbox-{assistant.id}"
		class="size-5 [&>span>svg]:size-4"
		bind:checked={() => assistant.prefill ?? false, (v) => (assistant.prefill = v)}
		disabled={!model?.prefill || !edit}
		onCheckedChange={onchange} />

	<Checkbox
		id="imagesCheckbox-{assistant.id}"
		class="size-5 [&>span>svg]:size-4"
		bind:checked={() => assistant.images ?? false, (v) => (assistant.images = v)}
		disabled={!model?.images || !edit}
		onCheckedChange={onchange} />
	<Checkbox
		id="audioCheckbox-{assistant.id}"
		class="size-5 [&>span>svg]:size-4"
		bind:checked={() => assistant.audio ?? false, (v) => (assistant.audio = v)}
		disabled={!model?.audio || !edit}
		onCheckedChange={onchange} />
	<Checkbox
		id="videoCheckbox-{assistant.id}"
		class="size-5 [&>span>svg]:size-4"
		bind:checked={() => assistant.video ?? false, (v) => (assistant.video = v)}
		disabled={!model?.video || !edit}
		onCheckedChange={onchange} />

	<Checkbox
		id="pdfCheckbox-{assistant.id}"
		class="size-5 [&>span>svg]:size-4"
		bind:checked={() => assistant.pdf ?? false, (v) => (assistant.pdf = v)}
		disabled={!model?.pdf || !edit}
		onCheckedChange={onchange} />

	{#if provider.type === 'google'}
		<div class="mt-4 w-full">
			<div class="flex items-start justify-center gap-2">
				<p>Sensitive</p>
				<div class="w-full max-w-md">
					<Slider
						type="single"
						class="w-full"
						bind:value={() => assistant.googleSafetyThreshold ?? 0, (v) => (assistant.googleSafetyThreshold = v)}
						step={1}
						min={0}
						max={3}
						disabled={!edit}
						onValueCommit={() => onchange()} />
				</div>
				<p>Insensitive</p>
			</div>
		</div>
	{/if}
</div>
