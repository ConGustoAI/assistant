<script lang="ts">
	import { Divider } from '$lib/components';
	import { AssistantGrid } from '$lib/components';
	import dbg from 'debug';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const debug = dbg('app:ui:settings:assistants');
</script>

<div class="max-w-(--breakpoint-xl) flex flex-col gap-4">
	<div class="flex gap-4">
		<div class="flex w-fit items-center gap-4 text-nowrap font-bold">
			<span class="text-xl">Default Assistants</span>
			<span class="bg-warning rounded-2xl px-4 py-0 text-black"
				>Changes made here will be visible to and will affect all users</span>
		</div>
	</div>

	<div class="w-full">
		<Divider>Default assistants</Divider>
		<AssistantGrid showDefault={true} edit={true} allowHiding={false} />
	</div>
</div>
