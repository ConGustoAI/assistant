<script lang="ts">
	import { defaultsUUID } from '$lib/db/schema';
	import { A } from '$lib/appstate.svelte';
</script>

{#if A.conversation}
	{#if !A.conversation.id || A.dbUser?.hacker}
		<select class="select select-bordered select-sm" bind:value={A.conversation.assistant}>
			<option disabled>Your assistants</option>
			{#each Object.entries(A.assistants).filter(([id, ass]) => ass.userID !== defaultsUUID) as [id, assistant]}
				{#if !A.hiddenItems.has(id) || A.dbUser?.assistant === id}
					<option value={id}>{assistant.name}</option>
				{/if}
			{/each}
			<option disabled>Default assistants</option>
			{#each Object.entries(A.assistants).filter(([id, ass]) => ass.userID === defaultsUUID) as [id, assistant]}
				{#if !A.hiddenItems.has(id) || A.dbUser?.assistant === id}
					<option value={id}>{assistant.name}</option>
				{/if}
			{/each}
		</select>
	{:else}
		<div class="text-lg">{A.conversation.assistantName??""}</div>
	{/if}

	{#if A.conversation.assistant}
		{@const assistant = A.assistants[A.conversation?.assistant ?? 'empty']}
		{@const model = A.models[assistant?.model ?? 'empty']}
		{@const provider = A.providers[model?.providerID ?? 'empty']}
		{@const providerKey = Object.entries(A.apiKeys).find(([id, key]) => key.providerID === provider?.id)}
		{@const assistantKey = Object.entries(A.apiKeys).find(([id, key]) => key.id === assistant?.apiKey)}

		{#if assistant && A.dbUser}
			{#if !model}
				<div class="flex flex-col text-sm">
					<span class="text-error">Assistant has no model</span>
					<a href="/settings/assistants/#{A.conversation.assistant}" class="link">Edit assistant</a>
				</div>
			{:else if !providerKey}
				<div class="flex flex-col text-sm">
					<div class="text-error">Provider '{provider?.name}' has no API keys</div>
					<a href="/settings/providers/#{provider.id}/keys" class="link">Edit provider</a>
				</div>
			{:else if !assistantKey && assistant.apiKey !== defaultsUUID}
				<div class="flex flex-col text-sm">
					<span class="text-error">Assistant has no API key</span>
					<a href="/settings/assistants/#{A.conversation.assistant}" class="link">Edit assistant</a>
				</div>
			{/if}
		{/if}
	{/if}
{/if}
