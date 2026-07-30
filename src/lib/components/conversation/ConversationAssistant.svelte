<script lang="ts">
	import { defaultsUUID } from '$lib/db/schema';
	import { A } from '$lib/appstate.svelte';
</script>

{#if A.conversation}
	{#if !A.conversation.id || A.user?.hacker}
		<select
			class="h-8 rounded-none border border-input bg-base-100 px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
			bind:value={A.conversation.assistantID}
			name="select-assistant"
			aria-label="Select assistant">
			<option disabled>Your assistants</option>
			{#each Object.entries(A.assistants).filter(([_, ass]) => ass.userID !== defaultsUUID) as [id, assistant]}
				{#if !A.hiddenItems.has(id) || A.user?.assistant === id}
					<option value={id}>{assistant.name}</option>
				{/if}
			{/each}
			<option disabled>Default assistants</option>
			{#each Object.entries(A.assistants).filter(([_, ass]) => ass.userID === defaultsUUID) as [id, assistant]}
				{#if !A.hiddenItems.has(id) || A.user?.assistant === id}
					<option value={id}>{assistant.name}</option>
				{/if}
			{/each}
		</select>
	{:else}
		<div class="text-lg">{A.conversation.assistantName ?? ''}</div>
	{/if}

	{#if A.conversation.assistantID}
		{@const assistant = A.assistants[A.conversation?.assistantID ?? 'empty']}
		{@const model = A.models[assistant?.modelID ?? 'empty']}
		{@const provider = A.providers[model?.providerID ?? 'empty']}
		{@const providerKey = Object.values(A.apiKeys).find((key) => key.providerID === provider?.id)}
		{@const assistantKey = Object.values(A.apiKeys).find((key) => key.id === assistant?.apiKeyID)}

		{#if assistant && A.user}
			{#if !model}
				<div class="flex flex-col text-sm">
					<span class="text-error">Assistant has no model</span>
					<a href="/settings/assistants/#{A.conversation.assistantID}" class="underline">Edit assistant</a>
				</div>
			{:else if !providerKey}
				<div class="flex flex-col text-sm">
					<div class="text-error">Provider '{provider?.name}' has no API keys</div>
					<a href="/settings/providers/#{provider.id}/keys" class="underline">Edit provider</a>
				</div>
			{:else if !assistantKey && assistant.apiKeyID !== defaultsUUID}
				<div class="flex flex-col text-sm">
					<span class="text-error">Assistant has no API key</span>
					<a href="/settings/assistants/#{A.conversation.assistantID}" class="underline">Edit assistant</a>
				</div>
			{/if}
		{/if}
	{/if}
{/if}
