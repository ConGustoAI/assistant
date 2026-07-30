<script lang="ts">
	import { Spinner } from '$lib/components/ui/spinner';
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { A } from '$lib/appstate.svelte';
	let logoutSpinning = $state(false);
	let logoutAllSpinning = $state(false);

	if (!A.user) {
		goto('/login');
	}
</script>

<h2 class="card-title">Logged in as {A.user?.name}</h2>
<p><strong>Email:</strong> {A.user?.email}</p>
<p><strong>User ID:</strong> {A.user?.id}</p>
<div class="mt-4 flex gap-4">
	<form method="POST" action="?/logout">
		<button
			class={cn(buttonVariants({ variant: 'outline' }), 'text-xl')}
			onclick={() => {
				logoutSpinning = true;
			}}>
			{#if logoutSpinning}
				<Spinner class="size-6" />
			{/if}
			Log out
		</button>
	</form>
	<form method="POST" action="?/logoutAll">
		<button
			class={cn(buttonVariants({ variant: 'outline' }), 'text-xl')}
			onclick={() => {
				logoutAllSpinning = true;
			}}>
			{#if logoutAllSpinning}
				<Spinner class="size-6" />
			{/if}
			Log out on all devices
		</button>
	</form>
</div>
