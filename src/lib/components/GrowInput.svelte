<script lang="ts">
	import { cn } from '$lib/utils/utils';

	import dbg from 'debug';
	const debug = dbg('app:ui:components:GrowInput');

	let {
		value = $bindable(),
		placeholder = '',
		class: className = '',
		disabled = false,
		spellcheck = true,
		focused = $bindable(),
		oninput = () => {},
		onkeydown = () => {},
		onchange = () => {},
		handlePaste = _handlePaste,
		autofocus = false,
		arialabel = ''
	} = $props<{
		value: string | undefined;
		placeholder?: string;
		class?: string;
		disabled?: boolean;
		spellcheck?: boolean;
		focused?: boolean;
		oninput?: (event: Event) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		onchange?: (event: Event) => void;
		handlePaste?: (event: ClipboardEvent) => void;
		autofocus?: boolean;
		arialabel?: string;
	}>();

	let textBox: HTMLDivElement | null = $state(null);

	function _handlePaste(event: ClipboardEvent) {
		event.preventDefault();
		debug('handlePaste', event);
		const text = event.clipboardData?.getData('text/plain');
		if (!text) return;
		document.execCommand('insertText', false, text);
	}
</script>

<div class="relative h-full w-full">
	{#if disabled}
		<div
			class={cn(
				'h-fit min-h-10 w-full resize-none overflow-auto rounded-none border border-input bg-base-100 px-3 py-2 text-base whitespace-pre-wrap shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
				className
			)}>
			{value}
		</div>
	{:else}
		<!-- svelte-ignore a11y_autofocus -->
		<div
			aria-label={arialabel}
			{autofocus}
			tabindex={0}
			role="textbox"
			contenteditable
			{spellcheck}
			bind:this={textBox}
			bind:innerText={value}
			onfocus={() => (focused = true)}
			onblur={() => (focused = false)}
			onpaste={(event) => handlePaste(event)}
			{oninput}
			{onkeydown}
			{onchange}
			class={cn(
				'h-full min-h-10 overflow-y-auto rounded-none border border-input bg-base-100 px-3 py-2 text-base whitespace-pre-wrap shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
				className
			)}>
		</div>
		{#if value === '' && !focused}
			<div class={cn('pointer-events-none absolute inset-0 p-2 opacity-50', className)}>
				{placeholder}
			</div>
		{/if}
	{/if}
</div>
