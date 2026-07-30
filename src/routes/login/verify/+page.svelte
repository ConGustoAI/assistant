<script lang="ts">
	import { cn } from '$lib/utils/utils';
	import { buttonVariants } from '$lib/components/ui/button';
	import { page } from '$app/stores';
</script>

<div class="flex h-full w-full items-center justify-center">
	<div class="relative flex flex-col rounded-2xl">
		<h2 class="flex items-center gap-2 text-xl font-semibold">
			Verification email sent to {$page.url.searchParams.get('email') ?? 'Unknown email??'}
		</h2>
		<p>Please check your inbox and follow the link</p>

		<div class="card-actioins">
			<a href="/login" class={cn(buttonVariants({ variant: 'outline' }), 'mt-4 w-fit')}> Ok </a>
		</div>
	</div>
</div>
