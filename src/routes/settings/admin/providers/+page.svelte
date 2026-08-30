<script lang="ts">
	import Divider from '$lib/components/Divider.svelte';
	import { ProvidersGrid } from '$lib/components';
	import { defaultsUUID } from '$lib/db/schema/users.js';
	import dbg from 'debug';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const debug = dbg('app:ui:settings:admin:providers');
</script>

<div class="flex max-w-(--breakpoint-xl) flex-col gap-4">
	<div class="flex gap-4">
		<div class="flex w-fit items-center gap-4 font-bold text-nowrap">
			<span class="text-xl">Default API providers</span>
			<span class="callout bg-warning">Changes made here will be visible to and will affect all users</span>
		</div>
	</div>

	<div class="w-full">
		<Divider>Default providers</Divider>
		<ProvidersGrid
			showDefault={true}
			showCustom={false}
			showDefaultChildren={true}
			editDefaultChildren={true}
			showCustomChildren={false}
			editCustomChildren={false}
			edit={true}
			allowHiding={false}
			newProviderUserID={defaultsUUID}
			newChildUserID={defaultsUUID} />
	</div>
</div>
