<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Divider } from '$lib/components';
	import { A } from '$lib/appstate.svelte';
	import { Star, Link } from 'lucide-svelte';

	let {
		title,
		group,
		selectedConversations = $bindable(),
		fromMessages: fromMessage
	}: { title: string; group: string[]; selectedConversations: string[]; fromMessages: string[] } = $props();

	function handleCheckboxChange(checked: boolean, conversationID: string) {
		if (checked) {
			// Add conversation ID if not already selected
			if (!selectedConversations.includes(conversationID)) {
				selectedConversations = [...selectedConversations, conversationID];
			}
		} else {
			// Remove conversation ID if unchecked
			selectedConversations = selectedConversations.filter((id) => id !== conversationID);
		}
	}
</script>

<Divider class="grow-0">{title}</Divider>

{#each group as c}
	<li
		class="relative min-h-8 w-full grow-0 p-0"
		title={A.conversations[c]?.summary}
		class:bg-base-300={A.conversation?.id === c}>
		<Checkbox
			class="absolute left-1 top-1/2 z-10 m-0 -translate-y-1/2 transform p-0"
			aria-label="Select conversation"
			name="selectedConversations"
			checked={selectedConversations.includes(c)}
			onCheckedChange={(e) => handleCheckboxChange(e, c)} />

		<a
			href={'/chat/' + c}
			class="w-full pl-9"
			onclick={() => {
				if (A.isMobile) A.sidebarOpen = false;
			}}>
			{#if A.conversations[c]?.like}
				<span>
					<Star size={15} color="var(--star)" fill="var(--star)" />
				</span>
			{/if}

			{#if A.conversations[c]?.public}
				<span><Link size={15} /></span>
			{/if}

			{#if fromMessage.includes(c)}
				<span>📜</span>
			{/if}

			<span class="text-nowrap">{(A.conversations[c]?.summary ?? 'New Chat').trim()}</span>
		</a>
	</li>
{/each}
