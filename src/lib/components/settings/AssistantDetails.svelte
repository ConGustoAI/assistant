<script lang="ts">
	import { fixNumberInput } from '$lib/utils';

	let { assistant = $bindable(), model, provider, edit, onchange }: {
		assistant: AssistantInterface;
		model: ModelInterface | undefined;
		provider: ProviderInterface;
		edit: boolean;
		onchange: () => void;
	} = $props();
</script>

<div
	class="grid w-full grid-cols-[min-content,max-content,max-content,max-content,min-content,min-content,min-content,min-content,auto] items-center gap-x-4 gap-y-2">
	<div class="flex items-center gap-2 text-sm">
		<div class="">Temperature</div>
		<input
			type="text"
			class="input input-sm input-bordered w-14 grow rounded-md py-0 leading-none"
			bind:value={assistant.temperature}
			onchange={(e) => {
				fixNumberInput(e, 0, model?.maxTemp ?? 2);
				onchange();
			}}
			disabled={!edit} />
	</div>
	<div class="flex w-fit items-center gap-2 text-sm">
		<div class="w-fit">Top P</div>
		<input
			type="text"
			class="input input-sm input-bordered w-14 grow rounded-md py-0 leading-none"
			bind:value={assistant.topP}
			onchange={(e) => {
				fixNumberInput(e, 0, 1);
				onchange();
			}}
			disabled={!edit} />
	</div>
	<div class="flex w-fit items-center gap-2 text-sm">
		<div class="w-fit">Top K</div>
		<input
			type="text"
			class="input input-sm input-bordered w-14 grow rounded-md py-0 leading-none"
			bind:value={assistant.topK}
			onchange={(e) => {
				fixNumberInput(e, 0, 1000);
				onchange();
			}}
			disabled={!edit} />
	</div>

	<div class="flex w-fit items-center gap-2 pr-5 text-sm">
		<div class="w-fit">Out tokens</div>
		<input
			type="text"
			class="input input-sm input-bordered w-14 grow rounded-md py-0 leading-none"
			bind:value={assistant.maxTokens}
			onchange={(e) => {
				fixNumberInput(e, 0, model?.outputContext ?? 4096);
				onchange();
			}}
			disabled={!edit} />
	</div>

	<div class="label-test text-xl" title="Images">🎨</div>
	<div class="label-test text-xl" title="Audio">🔉</div>
	<div class="label-test text-xl" title="Video">📺</div>
	<div class="label-test">Prefill</div>
	{#if provider.type === 'google'}
		<div class="label-test">Gemini safety sensitivity (all categories)</div>
	{:else}
		<div></div>
	{/if}

	<input
		type="range"
		required
		class="range range-sm w-full"
		bind:value={assistant.temperature}
		step={0.05}
		min={0}
		max={model?.maxTemp}
		disabled={!edit}
		onchange={(e) => {
			fixNumberInput(e, 0, model?.maxTemp ?? 2);
			onchange();
		}} />

	<input
		type="range"
		required
		class="range range-sm w-full"
		bind:value={assistant.topP}
		min={0}
		max={1}
		step={0.01}
		disabled={!edit}
		onchange={(e) => {
			fixNumberInput(e, 0, 1);
			onchange();
		}} />

	<div></div>

	<input
		type="range"
		required
		class="range range-sm w-full pr-5"
		bind:value={assistant.maxTokens}
		min={0}
		max={model?.outputContext ?? 4096}
		step={1}
		disabled={!edit}
		onchange={(e) => {
			fixNumberInput(e, 0, model?.outputContext ?? 4096);
			onchange();
		}} />

	<input
		type="checkbox"
		id="imagesCheckbox-{assistant.id}"
		class="checkbox checkbox-sm"
		bind:checked={assistant.images}
		disabled={!model?.images || !edit}
		onchange={onchange} />
	<input
		type="checkbox"
		id="audioCheckbox-{assistant.id}"
		class="checkbox checkbox-sm"
		bind:checked={assistant.audio}
		disabled={!model?.audio || !edit}
		onchange={onchange} />
	<input
		type="checkbox"
		id="videoCheckbox-{assistant.id}"
		class="checkbox checkbox-sm"
		bind:checked={assistant.video}
		disabled={!model?.video || !edit}
		onchange={onchange} />
	<input
		type="checkbox"
		id="prefillCheckbox-{assistant.id}"
		class="checkbox checkbox-sm"
		bind:checked={assistant.prefill}
		disabled={!model?.prefill || !edit}
		onchange={onchange} />

	{#if provider.type === 'google'}
		<div class="flex flex-col items-center gap-4">
			<div class="flex w-full flex-col gap-2">
				<input
					type="range"
					required
					class="range range-sm w-full"
					bind:value={assistant.googleSafetyThreshold}
					step={1}
					min={0}
					max={3}
					disabled={!edit}
					onchange={onchange} />
			</div>
		</div>
	{:else}
		<div></div>
	{/if}
</div>
