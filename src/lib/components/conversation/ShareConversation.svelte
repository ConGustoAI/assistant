<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Spinner } from '$lib/components/ui/spinner';
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { APIupsertConversation } from '$lib/api';
	import { A } from '$lib/appstate.svelte';
	import { Link } from '@lucide/svelte';

	let updatingPublic = $state(false);
</script>

{#if A.conversation?.id}
	<div class="hidden items-center justify-end gap-2 sm:flex">
		{#if A.conversation.public}
			<a href={'/public/' + A.conversation.id} class={cn(buttonVariants({ size: 'sm' }), 'rounded-md bg-base-300')}
				><Link size={18} /></a>
		{/if}
		<label for="public" class="text-sm">Share</label>
		{#if updatingPublic}
			<Spinner class="size-6" />
		{:else}
			<Checkbox
				id="public"
				bind:checked={() => A.conversation?.public ?? false, (v) => A.conversation && (A.conversation.public = v)}
				onCheckedChange={async () => {
					if (!A.conversation) throw new Error('Conversation missing');
					updatingPublic = true;
					Object.assign(A.conversation, await APIupsertConversation(A.conversation));
					updatingPublic = false;
					if (A.conversation.public) {
						const url = `${window.location.origin}/public/${A.conversation.id}`;
						navigator.clipboard.writeText(url);
					}
				}} />
		{/if}
	</div>
{/if}
