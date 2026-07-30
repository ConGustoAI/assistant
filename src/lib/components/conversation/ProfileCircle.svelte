<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Switch } from '$lib/components/ui/switch';
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { APIupdateUser } from '$lib/api';
	import { A } from '$lib/appstate.svelte';
	import { CircleUser } from '@lucide/svelte';

	async function setHacker() {
		if (!A.user) return;
		try {
			A.user = await APIupdateUser({ id: A.user.id, hacker: A.user.hacker });
		} catch (e) {
			console.error('Failed to update A.user', e);
			A.user.hacker = !A.user.hacker;
		}
	}

	async function gotoSettings() {
		await goto('/settings');
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#if A.user?.avatar}
			<div class="p-auto relative m-auto inline-flex align-middle">
				<div class="w-6 rounded-xl">
					<!-- https://stackoverflow.com/questions/40570117/http403-forbidden-error-when-trying-to-load-img-src-with-google-profile-pic -->
					<img src={A.user.avatar} referrerpolicy="no-referrer" alt="User avatar" />
				</div>
			</div>
		{:else}
			<UserCircle />
		{/if}
	</DropdownMenu.Trigger>

	<DropdownMenu.Content align="end" class="flex w-fit flex-col gap-1 bg-base-200 p-2 text-sm">
		<button
			class={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'justify-start text-nowrap')}
			onclick={gotoSettings}>Settings</button>

		{#if A.user}
			<div class={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'flex flex-nowrap items-center gap-2')}>
				Hacker
				<Switch
					bind:checked={() => A.user?.hacker ?? false, (v) => A.user && (A.user.hacker = v)}
					onCheckedChange={setHacker}
					name="hacker" />
			</div>
		{/if}

		<a
			class={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'justify-start text-nowrap')}
			href={A.user ? '/login/logout' : '/login'}>
			{#if A.user}Log out{:else}Log in{/if}
		</a>
	</DropdownMenu.Content>
</DropdownMenu.Root>
