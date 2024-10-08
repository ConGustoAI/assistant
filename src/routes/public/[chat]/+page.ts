import { APIfetchPublicConversation } from '$lib/api';

export const ssr = true;
// export const csr = false;

export const load = async ({ params, fetch }) => {
	try {
		const conversation = await APIfetchPublicConversation(params.chat, fetch);
		return { conversation };
	} catch {
		return {};
	}
};
