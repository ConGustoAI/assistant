import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	plugins: [typography],
	theme: {
		extend: {
			colors: {
				'base-usermessage': 'var(--base-usermessage)',
				message: 'var(--message)',
				star: 'var(--star)',
				debug: 'var(--debug)'
			}
		}
	}
};

export default config;
