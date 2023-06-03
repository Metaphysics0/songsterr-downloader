export const apiService = {
	artists: {
		search(searchText: string) {
			return make({
				endpoint: 'artists',
				method: 'POST',
				params: { searchText }
			});
		}
	}
};

function make({
	endpoint,
	method,
	params
}: {
	endpoint: string;
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
	params?: unknown;
}): Promise<Response> {
	let baseUrl = `/api/${endpoint}`;
	if (method === 'GET' && params) {
		// TS-Ignoring here because params are optional for GET routes
		//
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		baseUrl += '?' + new URLSearchParams(params).toString();
	}

	const options = {
		method,
		headers: {
			'content-type': 'application/json'
		}
	};
	const body = method !== 'GET' && params ? JSON.stringify(params) : null;
	return fetch(baseUrl, body ? { ...options, body } : options);
}
