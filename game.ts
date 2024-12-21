export interface APIResponse<T> {
	data: T;
}

export class Game {
	#URL: string = 'https://game-api.virtuals.io/api';
	#key: string;

	constructor(key: string) {
		this.#key = key;
	}

	async functions(): Promise<Record<string, string>> {
		const response = await fetch(`${this.#URL}/functions`, {
			headers: { 'x-api-key': this.#key }
		});

		if (!response.ok) throw new Error(await response.json().then(JSON.stringify));

		type FunctionData = { fn_name: string; fn_description: string };
		const data = await response.json().then(({ data }: APIResponse<FunctionData[]>) => data);

		type Output = Record<string, string>;
		return data.reduce<Output>((acc, x) => ({ ...acc, [x.fn_name]: x.fn_description }), {});
	}

	async simulate<T>(params: {
		sessionId: string;
		goal: string;
		description: string;
		world: string;
		functions: string[];
		customFunctions: any[];
	}) {
		const response = await fetch(`${this.#URL}/simulate`, {
			method: 'POST',
			headers: {
				'x-api-key': this.#key,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ data: params })
		});

		if (!response.ok) throw new Error(await response.json().then(JSON.stringify));

		return await response.json().then(({ data }: APIResponse<T>) => data);
	}

	async react<T>(
		platform: string,
		params: {
			sessionId: string;
			goal: string;
			description: string;
			world: string;
			functions: string[];
			customFunctions: any[];
			event?: string;
			task?: string;
			tweetId?: string;
		}
	) {
		const response = await fetch(`${this.#URL}/react/${platform}`, {
			method: 'POST',
			headers: {
				'x-api-key': this.#key,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ data: params })
		});

		if (!response.ok) throw new Error(await response.json().then(JSON.stringify));

		return await response.json().then(({ data }: APIResponse<T>) => data);
	}

	async deploy<T>(params: {
		goal: string;
		description: string;
		world: string;
		functions: string[];
		customFunctions: any[];
	}) {
		const response = await fetch(`${this.#URL}/deploy`, {
			method: 'POST',
			headers: {
				'x-api-key': this.#key,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ data: params })
		});

		if (!response.ok) throw new Error(await response.json().then(JSON.stringify));

		return await response.json().then(({ data }: APIResponse<T>) => data);
	}
}
