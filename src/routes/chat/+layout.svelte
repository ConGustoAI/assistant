<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import Divider from '$lib/components/Divider.svelte';
	import { goto } from '$app/navigation';
	import { APIdeleteConversations, APIfetchConversations } from '$lib/api';
	import { A } from '$lib/appstate.svelte.js';
	import { ChatHistory, ChatInput, ChatMessage, ChatTitle, SidebarButton } from '$lib/components';
	import { defaultsUUID } from '$lib/db/schema';
	import { abortController, submitConversationClientSide } from '$lib/utils/chat.svelte.js';
	import { addMessage, assert, newConversation } from '$lib/utils/utils.js';
	import { ChevronUp, Plus, Star } from '@lucide/svelte';

	import GitHub from '$lib/components/icons/GitHub.svelte';
	import MediaEditor from '$lib/components/media/MediaEditor.svelte';
	import { handleDataTransfer } from '$lib/utils/media_utils.svelte';
	import dbg from 'debug';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	const debug = dbg('app:ui:chat');

	// This will fetch the data eventually, but we are ok with the initial empty data.
	onMount(async () => {
		debug('Mounted, fetching data');

		// Sidebar closed by default on small screens
		if (window.innerWidth < 640) {
			A.sidebarOpen = false; // Open drawer on larger screens
			A.isMobile = true;
		}
		A.chatDataLoading = true;

		const gotConvos = await APIfetchConversations().catch((e) => {
			debug('Failed to fetch conversations:', e);
			A.chatDataLoading = false;
			return [];
		});

		for (const c of gotConvos) {
			assert(c.id);
			if (A.conversations[c.id]) Object.assign(A.conversations[c.id], c);
			else A.conversations[c.id] = c;
		}

		A.conversationOrder = Object.entries(A.conversations)
			.sort((a, b) => {
				return (b[1]?.order ?? 0) - (a[1]?.order ?? 0);
			})
			.map(([id]) => id);

		A.chatDataLoading = false;
		debug(
			'done fetching data',
			$state.snapshot({
				conversations: A.conversations,
				conversationOrder: A.conversationOrder
			})
		);
	});

	let { children } = $props();

	$inspect(A.user).with((type, value) => {
		debug('A.user: %s %o', type, value);
	});

	let assistantSelectOpen = $state(false);

	async function NewChat(assistantId?: string) {
		assistantSelectOpen = false;
		if (A.isMobile) A.sidebarOpen = false;
		// debug('NewChat', { assistantId, assistants: A.assistants });

		if (!assistantId && A.conversation?.id) {
			debug('No assistant ID provided, using default');
			assistantId = A.conversation?.assistantID;
		}

		A.conversation = newConversation(A.user, assistantId, A.assistants);
		await goto('/chat');
	}

	async function deleteConversations(ids: string[]) {
		A.conversationOrder = A.conversationOrder.filter((c) => !ids.includes(c));
		if (A.user) {
			const delIds = await APIdeleteConversations(ids);
			if (delIds?.length !== ids.length) {
				debug('Not all conversations have been deleted:');
				debug('Rquestd: ', ids);
				debug('Confirmed: ', delIds);
			}
		}
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		debug('Drop event', event);
		A.conversationDragging = 0;
		if (event.dataTransfer)
			await handleDataTransfer({
				data: event.dataTransfer
			});
	}

	let conversationDragArea = $state<HTMLDivElement | null>(null);

	function dragEnter() {
		debug('Drag enter');
		A.conversationDragging++;
	}

	function dragLeave() {
		debug('Drag leave');
		A.conversationDragging--;
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault(); // This is crucial!
		event.stopPropagation();
	}
</script>

<svelte:head>
	<title>{A.conversation?.summary ?? 'Congusto Chat'}</title>
</svelte:head>

<main class="relative m-0 flex h-full max-h-full w-full flex-col sm:flex-row">
	{#if A.sidebarOpen}
		<div
			class="flex h-full w-full shrink-0 flex-col items-center justify-start gap-2 bg-base-200 p-2 sm:w-56"
			transition:slide={{ duration: 100, axis: 'x' }}>
			<div class="flex w-full">
				<button
					class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-[2.125rem] grow')}
					onclick={async () => await NewChat()}>New chat</button>
				<DropdownMenu.Root bind:open={assistantSelectOpen}>
					<DropdownMenu.Trigger
						class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), '-ml-px h-[2.125rem] px-1')}
						><ChevronUp class="rotate-180" /></DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="z-20 flex w-52 flex-col bg-base-300 p-2 text-sm shadow-sm">
						<Divider class="py-2">Your assistants</Divider>
						{#each Object.entries(A.assistants).filter(([_, ass]) => ass.userID !== defaultsUUID) as [id, assistant]}
							{#if !A.hiddenItems.has(id) || A.user?.assistant === id}
								<button
									class={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
									onclick={async () => await NewChat(assistant.id)}>{assistant.name}</button>
							{/if}
						{/each}
						<Divider class="py-2">Default assistants</Divider>
						{#each Object.entries(A.assistants).filter(([_, ass]) => ass.userID === defaultsUUID) as [id, assistant]}
							{#if !A.hiddenItems.has(id) || A.user?.assistant === id}
								<button
									class={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
									onclick={async () => await NewChat(assistant.id)}>{assistant.name}</button>
							{/if}
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			<ChatHistory {deleteConversations} />
		</div>
	{/if}

	<div class="hidden w-1 sm:block" class:hidden={!A.sidebarOpen}></div>

	<div
		role="document"
		class="mx-0 flex h-full w-full shrink flex-col overflow-hidden bg-inherit"
		ondrop={handleDrop}
		ondragover={handleDragOver}
		ondragenter={dragEnter}
		ondragleave={dragLeave}
		bind:this={conversationDragArea}>
		<ChatTitle />
		<div
			class="mb-auto flex w-full grow flex-col justify-start overflow-y-auto bg-transparent contain-paint [content-visibility:auto]">
			{#if A.conversation?.messages}
				{#each A.conversation.messages as _, i}
					<ChatMessage
						bind:message={A.conversation.messages[i]}
						loading={i === A.conversation.messages.length - 1 && A.chatStreaming}
						submitConversation={submitConversationClientSide} />
				{/each}
			{/if}

			{#if !A.conversation?.messages?.length}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'm-2 self-end rounded-md p-1')}
						title="Add messages">
						<Plus class="h-full w-auto" />
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end" class="z-20 flex w-32 flex-col bg-base-200 p-2 text-sm text-nowrap">
						<button
							class={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'justify-end')}
							onclick={async (e) => {
								const target = e.target as HTMLButtonElement;
								target.blur();
								await addMessage({ role: 'assistant', above: false, editing: true });
							}}>assistant</button>
						<button
							class={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'justify-end')}
							onclick={async (e) => {
								const target = e.target as HTMLButtonElement;
								target.blur();
								await addMessage({ role: 'user', above: false, editing: true });
							}}>user</button>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}

			{#if A.conversation?.messages}
				<div class="mb-20 w-full"></div>
			{/if}
			{#if !A.conversation?.messages && !A.conversation?.id}
				<div
					class="m-auto flex w-full grow flex-col items-center justify-center gap-6 justify-self-center select-none lg:w-1/3">
					<div class="pointer-events-none flex flex-col font-bold grayscale" style="opacity:0.05">
						<img class="w-[50%] max-w-[200px] self-center" src="/favicon.png" alt="Congusto" />
						<p class="w-fit text-[5vw] text-nowrap md:text-[3vw]">Congusto Chat</p>
					</div>
					<a href="https://congusto.ai" class="flex text-2xl opacity-50" target="_blank" rel="noopener noreferrer">
						<p class="mx-2 opacity-50">Made with ❤️ by</p>
						<span class="underline opacity-100">Congusto.ai</span>
					</a>
					<a
						href="https://github.com/congustoAI/chat"
						class="items-top flex text-2xl opacity-50"
						target="_blank"
						rel="noopener noreferrer">
						<p class="mx-2 flex items-center opacity-50">
							Give us a <Star class="mx-1" color="yellow" fill="yellow" /> on
						</p>
						<span class="flex items-center underline opacity-100">
							<GitHub />
							GitHub
						</span>
					</a>
					{#if !A.user}
						<a href="/login" class={cn(buttonVariants({ variant: 'outline' }), 'mt-16 text-xl')}>
							<p class="mx-2">Login to start chatting</p>
						</a>
					{/if}
				</div>
			{/if}
		</div>

		<Divider />

		<div class="m-2 flex h-fit min-h-16 shrink-0 grow-0 items-center gap-2 p-2 py-0">
			<div class="flex max-w-fit flex-1 justify-start">
				{#if !A.sidebarOpen}
					<div class={cn(buttonVariants({ size: 'icon' }), 'rounded-full sm:hidden')} style="visibility: hidden;"></div>
				{/if}
			</div>
			<div class="mx-auto flex h-fit max-w-full grow justify-center p-0 md:max-w-[95%]">
				<ChatInput
					submitConversation={submitConversationClientSide}
					cancelConversation={() => abortController?.abort()} />
			</div>
			<div class="flex max-w-fit flex-1 justify-end"></div>
		</div>
	</div>
	<div class="absolute bottom-4 left-2 z-20">
		<SidebarButton />
	</div>
	<MediaEditor />
</main>

<!-- <pre>{JSON.stringify({ chat: $page.params.chat, conversation, conversations, assistants }, null, 2)}</pre> -->
<!-- <pre>{JSON.stringify({ conversations, data }, null, 2)}</pre> -->
{@render children()}
