<script lang="ts">
	import { Spinner } from '$lib/components/ui/spinner';
	import { Divider } from '$lib/components';
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

	// let EmailSpinning = false;
	let loginGoogleSpinning = $state(false);
	let loginGithubSpinning = $state(false);
</script>

<h2 class="card-title justify-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
<!-- {#if !env.PUBLIC_DISABLE_EMAIL_LOGIN}
	<form
		method="POST"
		action={isLogin ? '?/loginEmail' : '?/signup'}
		use:enhance={() => {
			return async ({ result }) => {
				EmailSpinning = false;
				if (result.type === 'redirect') {
					goto(result.location, { invalidateAll: true });
				}
				await applyAction(result);
			};
		}}>
		<div class="flex flex-col">
			<label class="label" for="email">
				<span class="text-sm">Email</span>
			</label>
			<Input
				id="email"
				name="email"
				type="email"
				placeholder="email@example.com"
				autocomplete="email"
				value={form?.email ?? ''}
				 />
			{#if form?.emailMissing}
				<Notification messageType="error" bind:message={form.emailMissing} />
			{/if}
		</div>
		<div class="mt-4 flex flex-col">
			<label class="label" for="password">
				<span class="text-sm">Password</span>
			</label>
			<Input
				id="password"
				name="password"
				value={form?.password ?? ''}
				
				type="password"
				autocomplete={isLogin ? 'current-password' : 'new-password'} />
			{#if form?.pwresetError}
				<Notification messageType="error" bind:message={form.pwresetError} />
			{/if}
		</div>
		{#if form?.emailError}
			<Notification messageType="error" bind:message={form.emailError} />
		{/if}
		<div class="mt-6 flex flex-col">
			<button
				class={buttonVariants({ variant: 'outline' })}
				on:click={() => {
					EmailSpinning = true;
				}}>
				{#if EmailSpinning}
					<Spinner class="size-6" />
				{/if}
				{isLogin ? 'Login' : 'Sign Up'}
			</button>
		</div>
		{#if isLogin}
			<div class="mt-2 text-center">
				<button formaction="?/recover" class="link-hover underline"> Forgot password? </button>
			</div>
			{#if form?.pwresetSent}
				<Notification messageType="success" bind:message={form.pwresetSent} />
			{/if}
			{#if form?.pwresetError}
				<button
					class="mt-2 text-center text-error"
					on:click={() => {
						if (form) form.pwresetError = '';
					}}>{form?.pwresetError}</button>
			{/if}
		{/if}
		<div class="mt-4 text-center">
			<span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
			<a href={null} class="underline ml-1" on:click={toggleMode}>
				{isLogin ? 'Sign up' : 'Login'}
			</a>
		</div>
	</form>
{/if} -->

{#if !env.PUBLIC_DISABLE_EMAIL_LOGIN && (!env.PUBLIC_DISABLE_GOOGLE_LOGIN || !env.PUBLIC_DISABLE_GITHUB_LOGIN)}
	<Divider>OR</Divider>
{/if}
<form method="POST" action="?/loginProvider">
	<div class="flex flex-col gap-2">
		{#if !env.PUBLIC_DISABLE_GOOGLE_LOGIN}
			<Button
				variant="outline"
				size="lg"
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
				size="lg"
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
