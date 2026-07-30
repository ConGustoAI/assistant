<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Input } from '$lib/components/ui/input';
	import { Spinner } from '$lib/components/ui/spinner';
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { APIupsertConversation, APIupsertMedia, APIupsertMessage } from '$lib/api';
	import { A } from '$lib/appstate.svelte';
	import { ConversationAssistant, ConversationInfo, Cost, ProfileCircle, ShareConversation } from '$lib/components';
	import { syncMedia, uploadConversationMedia } from '$lib/utils/media_utils.svelte';
	import { sanityCheckConversationMedia } from '$lib/utils/sanity-check.svelte';
	import { assert, isPublicPage, trimLineLength } from '$lib/utils/utils';
	import dbg from 'debug';
	import { ArrowLeftCircle, CopyPlus, Edit, Info, Star } from 'lucide-svelte';

	const debug = dbg('app:ui:conponents:ChatTitle');

	let editingSummary = $state(false);
	let updatingLike = $state(false);
	let cloningConversation = $state(false);

	let detailsOpen = $state(false);
	let summaryElement: HTMLElement | undefined = undefined;

	function closeDetails() {
		detailsOpen = false;
		if (summaryElement) summaryElement.blur();
	}
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeDetails();
		}
	}

	async function updateLike() {
		if (!A.conversation || !A.conversation.id) return;

		updatingLike = true;
		try {
			Object.assign(A.conversation, await APIupsertConversation(A.conversation));
		} catch (e) {
			debug('Failed to update like:', e);
			A.conversation.like = !A.conversation.like;
		}
		updatingLike = false;
	}

	async function updateSummary() {
		if (!A.conversation || !A.conversation.id) return;
		if (A.conversation.summary) A.conversation.summary = trimLineLength(A.conversation.summary, 128);
		editingSummary = false;
		Object.assign(A.conversation, await APIupsertConversation(A.conversation));
	}

	async function cloneConversation() {
		debug('cloneConversation', { conversation: A.conversation });
		if (!A.conversation || !A.user) return;

		cloningConversation = true;

		// All media in the conversation should now have IDs.
		await uploadConversationMedia();

		sanityCheckConversationMedia(A.conversation);

		let clone = { ...$state.snapshot(A.conversation) } as ConversationInterface;
		clone.id = undefined;
		clone.summary = trimLineLength('+' + (clone.summary ?? 'New Chat'), 128);
		clone.public = false;
		clone.order = undefined;
		clone.userID = A.user.id;
		clone.updatedAt = undefined;
		clone.createdAt = undefined;

		// Make it a $state?
		clone = (await APIupsertConversation(clone)) as ConversationInterface;
		debug('inserted clone conversation: ', clone);
		assert(clone.id);
		clone.messages = [];
		clone.media = [];

		// Maps between the IDs of the original and cloned media.
		const mediaConversionTable = new Map<string, string>();

		const mediaPromises = (A.conversation.media ?? []).map(async (media) => {
			assert(media.id);
			let mediaClone = { ...media } as MediaInterface;
			mediaClone.id = undefined;
			mediaClone.conversationID = clone.id;
			mediaClone.userID = A.user!.id;
			mediaClone.createdAt = undefined;
			mediaClone.updatedAt = undefined;

			Object.assign(mediaClone, await APIupsertMedia(mediaClone));
			debug('inserted media clone', mediaClone);
			assert(mediaClone.id);
			syncMedia(mediaClone);

			mediaConversionTable.set(media.id, mediaClone.id);
			clone.media!.push(mediaClone);
		});

		await Promise.all(mediaPromises);

		// We have to inser one by one to make sure the order is set correctly.
		const messagePromises = (A.conversation.messages ?? []).map(async (m) => {
			let messageClone = { ...$state.snapshot(m) } as MessageInterface;
			messageClone.id = undefined;
			messageClone.conversationID = clone.id;
			messageClone.userID = A.user!.id;
			// Note: We don't reset the message order. The order does not have to be unique between conversations.
			messageClone.createdAt = undefined;
			messageClone.updatedAt = undefined;
			messageClone.media = [];
			messageClone.mediaIDs = [];

			// Replace the media and IDs with the cloned ones.
			for (const media of m.media ?? []) {
				assert(media.id);
				const clonedMedia = clone.media!.find((m) => m.id === mediaConversionTable.get(media.id!));
				assert(clonedMedia?.id);

				messageClone.media.push(clonedMedia);
				messageClone.mediaIDs.push(clonedMedia.id);
			}

			Object.assign(messageClone, await APIupsertMessage(messageClone));
			debug('inserted message clone ', messageClone);
			return messageClone;
		});

		clone.messages = await Promise.all(messagePromises);

		sanityCheckConversationMedia(clone);

		A.conversations[clone.id] = clone;
		A.conversationOrder = [clone.id, ...A.conversationOrder];

		cloningConversation = false;
		await goto('/chat/' + clone.id);
	}

	let summaryHovered = $state(false);
	let savedSummary: string;
</script>

<div class="mx-0 flex min-h-12 w-full min-w-0 items-center gap-4 border-b border-base-content bg-base-200 p-2">
	<!-- navbar-start -->
	<div class="flex min-w-0 shrink-0 gap-2">
		{#if isPublicPage()}
			<a class="flex gap-2 text-nowrap text-ellipsis underline" href="/chat">
				<ArrowLeftCircle />Congusto Chat
			</a>
		{/if}

		{#if A.conversation?.id && !A.sidebarOpen}
			<a href={'/chat/'} class="underline"><Edit /></a>
		{/if}

		{#if A.conversation?.id && !isPublicPage() && !A.isMobile}
			{#if updatingLike}
				<Spinner class="size-4" />
			{:else}
				<button
					type="button"
					aria-label="Star conversation"
					aria-pressed={!!A.conversation.like}
					onclick={() => {
						if (!A.conversation) return;
						A.conversation.like = !A.conversation.like;
						updateLike();
					}}>
					<Star color="var(--star)" fill={A.conversation.like ? 'var(--star)' : 'none'} />
				</button>
			{/if}
		{/if}
		{#if A.conversation?.id}
			<button
				class={cn(buttonVariants({ size: 'sm' }), 'rounded-md bg-base-100 p-1')}
				title="Clone conversation"
				onclick={async () => await cloneConversation()}>
				{#if cloningConversation}
					<Spinner class="size-4" />
				{:else}
					<CopyPlus />
				{/if}
			</button>
		{/if}

		{#if !isPublicPage()}
			<ConversationAssistant />
		{/if}
	</div>
	<!-- navbar-center -->
	<div class="flex min-w-0 shrink-2 grow overflow-hidden">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="flex w-full text-center text-xl font-bold text-ellipsis"
			onmouseenter={() => {
				summaryHovered = true;
			}}
			onmouseleave={() => {
				summaryHovered = false;
			}}>
			{#if !A.chatDataLoading}
				{#if A.conversation}
					{#if editingSummary}
						<Input
							aria-label="Conversation summary"
							type="text"
							class="h-8 w-full grow"
							bind:value={A.conversation.summary}
							onblur={async () => {
								await updateSummary();
								editingSummary = false;
							}}
							onkeydown={async (e) => {
								if (e.key === 'Enter') await updateSummary();
								if (e.key === 'Escape') {
									editingSummary = false;
									A.conversation!.summary = savedSummary;
								}
							}} />
					{:else}
						<div
							aria-label="Conversation summary"
							class="items-bottom flex w-full shrink cursor-pointer gap-1"
							role="textbox"
							tabindex="0"
							ondblclick={() => {
								savedSummary = A.conversation!.summary ?? '';
								editingSummary = true;
							}}>
							<p class="shrink truncate">
								{A.conversation.summary ?? 'New chat'}
							</p>
							{#if summaryHovered && !isPublicPage()}
								<button
									class={cn(buttonVariants({ variant: 'ghost', size: 'xs' }), 'shrink-0 rounded-md p-0')}
									onclick={() => {
										savedSummary = A.conversation!.summary ?? '';
										editingSummary = true;
									}}><Edit size="h-fit" /></button>
							{/if}
						</div>
					{/if}
				{/if}
			{:else}
				<Spinner class="size-6" />
			{/if}
		</div>
	</div>

	<!-- navbar-end -->
	<div class="mx-2 ml-auto flex grow-0 items-center gap-2 justify-self-end">
		{#if A.conversation?.id && !isPublicPage()}
			<ShareConversation />
		{/if}

		<Cost total={(A.conversation?.tokensInCost ?? 0) + (A.conversation?.tokensOutCost ?? 0)} />

		<DropdownMenu.Root bind:open={detailsOpen}>
			<DropdownMenu.Trigger class="mt-auto hidden text-center sm:block"><Info /></DropdownMenu.Trigger>
			<DropdownMenu.Content
				align="end"
				class="z-30 flex max-h-dvh w-max max-w-(--breakpoint-md) p-2 pb-20 whitespace-pre-line"
				onkeydown={handleKeydown}>
				<ConversationInfo />
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		{#if detailsOpen}
			<button class="fixed inset-0 z-20" onclick={closeDetails} aria-label="Close modal"></button>
		{/if}

		{#if !isPublicPage()}
			<ProfileCircle />
		{/if}
	</div>
</div>
