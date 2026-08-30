<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { A } from '$lib/appstate.svelte';
	import { GrowInput } from '$lib/components';

	let {
		assistant = $bindable(),
		edit,
		oninput = () => {}
	}: { assistant: AssistantInterface; edit: boolean; oninput: () => void } = $props();
</script>

<div class="col-span-full flex flex-col">
	<div class="flex w-full items-center justify-between">
		<span class="px-1 py-2 text-sm"
			>About user. Include into system prompt with <code class="font-bold">{'{profile}'}</code></span>

		<div class="flex items-center gap-2">
			{#if assistant.aboutUserFromUser}
				<a href="/settings" class="text-sm underline">Edit your profile</a>
			{/if}
			<label for="aboutUserFromUser" class="cursor-pointer text-sm">From my profile</label>
			<Checkbox
				class="size-4 [&_svg]:size-3"
				bind:checked={() => assistant.aboutUserFromUser ?? false, (v) => (assistant.aboutUserFromUser = v)}
				id="aboutUserFromUser"
				disabled={!edit} />
		</div>
	</div>

	{#if assistant.aboutUserFromUser}
		<GrowInput class="w-full" value={A.user?.aboutUser ?? ''} disabled={true} />
	{:else}
		<GrowInput bind:value={assistant.aboutUser} {oninput} />
	{/if}
</div>

<div class="col-span-full flex flex-col">
	<div class="flex w-full items-center justify-between">
		<span class="px-1 py-2 text-sm"
			>Assistant instructions. Include into system prompt with <code class="font-bold">{'{instructions}'}</code></span>

		<div class="flex items-center gap-2">
			{#if assistant.assistantInstructionsFromUser}
				<a href="/settings" class="text-sm underline">Edit your profile</a>
			{/if}
			<label for="instructionsFromUser" class="cursor-pointer text-sm">From my profile</label>
			<Checkbox
				class="size-4 [&_svg]:size-3"
				bind:checked={
					() => assistant.assistantInstructionsFromUser ?? false, (v) => (assistant.assistantInstructionsFromUser = v)
				}
				id="instructionsFromUser"
				onCheckedChange={oninput}
				disabled={!edit} />
		</div>
	</div>

	{#if assistant.assistantInstructionsFromUser}
		<GrowInput class="w-full" value={A.user?.assistantInstructions ?? ''} disabled={true} />
	{:else}
		<GrowInput class="w-full" bind:value={assistant.assistantInstructions} {oninput} disabled={!edit} />
	{/if}
</div>

<div class="col-span-full flex flex-col">
	<div class="flex w-full items-center justify-between">
		<span class="px-1 py-2 text-sm">System Prompt</span>
	</div>

	<GrowInput bind:value={assistant.systemPrompt} {oninput} disabled={!edit} />
</div>
