<script lang="ts">
	import { Spinner } from '$lib/components/ui/spinner';
	import Divider from '$lib/components/Divider.svelte';
	import { env } from '$env/dynamic/public';
	import { A } from '$lib/appstate.svelte';
	import { goto } from '$app/navigation';
	import GitHub from '$lib/components/icons/GitHub.svelte';
	import Google from '$lib/components/icons/Google.svelte';
	import { Button } from '$lib/components/ui/button';

	let { form } = $props();
	$inspect(form);

	if (A.user) {
		goto('/login/logout', { invalidateAll: true });
	}

	let isLogin = $state(true);

	let loginGoogleSpinning = $state(false);
	let loginGithubSpinning = $state(false);
</script>

<h2 class="flex items-center justify-center gap-2 text-xl font-semibold">{isLogin ? 'Login' : 'Sign Up'}</h2>

{#if !env.PUBLIC_DISABLE_EMAIL_LOGIN && (!env.PUBLIC_DISABLE_GOOGLE_LOGIN || !env.PUBLIC_DISABLE_GITHUB_LOGIN)}
	<Divider>OR</Divider>
{/if}
<form method="POST" action="?/loginProvider">
	<div class="flex flex-col gap-2">
		{#if !env.PUBLIC_DISABLE_GOOGLE_LOGIN}
			<Button
				variant="outline"
				class="text-xl"
				formaction="?/google"
				onclick={() => {
					loginGoogleSpinning = true;
				}}>
				{#if loginGoogleSpinning}
					<Spinner class="size-6" />
				{:else}
					<Google />
				{/if}
				{isLogin ? 'Log in' : 'Sign Up'} with Google
			</Button>
		{/if}
		{#if !env.PUBLIC_DISABLE_GITHUB_LOGIN}
			<Button
				variant="outline"
				class="text-xl"
				formaction="?/github"
				onclick={() => {
					loginGithubSpinning = true;
				}}>
				{#if loginGithubSpinning}
					<Spinner class="size-6" />
				{:else}
					<GitHub />
				{/if}
				{isLogin ? 'Log in' : 'Sign Up'} with GitHub
			</Button>
		{/if}

		{#if env.PUBLIC_DISABLE_EMAIL_LOGIN && env.PUBLIC_DISABLE_GOOGLE_LOGIN && env.PUBLIC_DISABLE_GITHUB_LOGIN}
			<div class="text-center">
				<p>No login methods available.</p>
				<p>Please contact the Admin.</p>
			</div>
		{/if}
	</div>
</form>
