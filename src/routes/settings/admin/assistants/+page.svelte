<script lang="ts">
	import Divider from '$lib/components/Divider.svelte';
	import { AssistantGrid } from '$lib/components';
	import dbg from 'debug';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const debug = dbg('app:ui:settings:assistants');
</script>

<div class="flex max-w-(--breakpoint-xl) flex-col gap-4">
	<div class="flex gap-4">
		<div class="flex w-fit items-center gap-4 font-bold text-nowrap">
			<span class="text-xl">Default Assistants</span>
			<span class="rounded-2xl bg-warning px-4 py-0 text-black"
				>Changes made here will be visible to and will affect all users</span>
		</div>
	</div>

	<div class="w-full">
		<Divider>Default assistants</Divider>
		<AssistantGrid showDefault={true} edit={true} allowHiding={false} />
	</div>
</div>
