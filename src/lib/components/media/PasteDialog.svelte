<script lang="ts">
	import { A } from '$lib/appstate.svelte';
	import dbg from 'debug';
	const debug = dbg('app:ui:components:PasteDialog');
</script>

<dialog class="fixed inset-0 z-50 hidden items-center justify-center bg-black/40 open:flex" open>
	<div class="relative max-h-[calc(100vh-5em)] w-11/12 max-w-2xl overflow-y-auto rounded-2xl bg-base-100 p-6 shadow-lg">
	</div>

	<button
		class="fixed inset-0 -z-10 cursor-default text-transparent"
		onclick={() => {
			debug('asd');
			A.mediaEditing = undefined;
		}}>close</button>
</dialog>
