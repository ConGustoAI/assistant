<script lang="ts">
	import '../app.css';

	import { A } from '$lib/appstate.svelte';
	import { ModeWatcher, mode, setMode, setTheme, userPrefersMode } from 'mode-watcher';

	// There is no usable light default yet, so 'system' becomes an explicit dark preference.
	// setTheme keeps data-theme, which carries the palette, in step with the .dark class.
	$effect(() => {
		if ($userPrefersMode === 'system') setMode('dark');
		setTheme($mode === 'light' ? 'light' : 'dark');
	});

	$effect(() => {
		if ($mode === 'light') {
			import('highlight.js/styles/github.min.css');
		} else {
			import('highlight.js/styles/github-dark.min.css');
		}
	});

	import { APIfetchAssistants, APIfetchHidden, APIfetchKeys, APIfetchModels, APIfetchProviders } from '$lib/api';
	import { toIdMap } from '$lib/utils/utils';
	import dbg from 'debug';
	import { untrack } from 'svelte';
	const debug = dbg('app:layout');

	let { data, children } = $props();

	$effect(() => {
		untrack(() => {
			debug('root layout effect: %o', { session: data.session, A_user: A.user });

			if (!data.session || data.session.userID !== A.user?.id) {
				debug('user changed, fetching data', $state.snapshot(A.user));

				Promise.all([
					APIfetchAssistants(),
					APIfetchProviders(),
					APIfetchModels(),
					APIfetchKeys(),
					APIfetchHidden()
				]).then(([fetchedAssistants, fetchedProviders, fetchedModels, fetchedApiKeys, fetchedHidden]) => {
					A.assistants = toIdMap(fetchedAssistants);
					A.providers = toIdMap(fetchedProviders);
					A.models = toIdMap(fetchedModels);
					A.apiKeys = toIdMap(fetchedApiKeys);
					A.hiddenItems = fetchedHidden;

					debug(
						'Done fetching',
						$state.snapshot({
							assistants: A.assistants,
							providers: A.providers,
							models: A.models,
							user: A.user,
							apiKeys: Object.keys(A.apiKeys)
						})
					);
				});
			}
		});
		A.user = data.session?.user;
	});
</script>

<!-- defaultTheme sets data-theme on first paint, before the effect above runs. -->
<ModeWatcher defaultMode="dark" defaultTheme="dark" />

{@render children()}
