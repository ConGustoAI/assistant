<script lang="ts">
	import { Divider } from '$lib/components';
	import { AssistantGrid } from '$lib/components';
	import { A } from '$lib/appstate.svelte';
	import dbg from 'debug';
	const debug = dbg('app:ui:settings:assistants');

	$inspect(A.assistants).with((t, c) => debug('A.assistants', { t, c }));
</script>

<div class="max-w-(--breakpoint-xl) flex flex-col gap-4">
	<h2 class="text-xl font-bold">Assistants</h2>

	<div class="w-full">
		<Divider>Your assistants</Divider>
		<AssistantGrid edit={true} newItemUserID={A.user?.id} />

		<Divider>Default assistants</Divider>
		<AssistantGrid showDefault={true} edit={false} newItemUserID={A.user?.id} />
	</div>
</div>
