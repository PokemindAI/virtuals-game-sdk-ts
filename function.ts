export interface FunctionArgument {
	name: string;
	description: string;
	type: string;
	id?: string;
}

export interface FunctionConfig {
	method?: string;
	url?: string;
	headers?: Record<string, string>;
	payload?: Record<string, any>;
	success_feedback?: string;
	error_feedback?: string;
	isMainLoop?: boolean;
	isReaction?: boolean;
	headersString?: string;
	payloadString?: string;
	platform?: string;
}

export class Function {
	id: string;
	fn_name: string;
	fn_description: string;
	args: FunctionArgument[];
	config: FunctionConfig;
	hint: string;

	constructor(
		fn_name: string,
		fn_description: string,
		args: FunctionArgument[],
		config: FunctionConfig,
		hint: string = '',
		id?: string
	) {
		this.fn_name = fn_name;
		this.fn_description = fn_description;
		this.args = args.map((arg) => ({ ...arg, id: arg.id || crypto.randomUUID() }));
		this.config = {
			method: 'get',
			headers: {},
			payload: {},
			headersString: '{}',
			payloadString: '{}',
			...config
		};
		this.hint = hint;
		this.id = id || crypto.randomUUID();
	}

	toJson() {
		return {
			id: this.id,
			fn_name: this.fn_name,
			fn_description: this.fn_description,
			args: this.args,
			hint: this.hint,
			config: this.config
		};
	}

	private validateArgs(args: any[]): Record<string, any> {
		if (args.length !== this.args.length) {
			throw new Error(`Expected ${this.args.length} arguments, got ${args.length}`);
		}

		const argDict: Record<string, any> = {};

		for (let i = 0; i < args.length; i++) {
			const providedValue = args[i];
			const argDef = this.args[i];
			argDict[argDef.name] = providedValue;

			switch (argDef.type) {
				case 'string':
					if (typeof providedValue !== 'string') {
						throw new TypeError(`Argument ${argDef.name} must be a string`);
					}
					break;
				case 'array':
					if (!Array.isArray(providedValue)) {
						throw new TypeError(`Argument ${argDef.name} must be an array`);
					}
					break;
			}
		}

		return argDict;
	}

	private interpolateTemplate(templateStr: string, values: Record<string, any>): string {
		return templateStr.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key]?.toString() || match);
	}

	private prepareRequest(argDict: Record<string, any>): RequestInit & { url: string } {
		const url = this.interpolateTemplate(this.config.url || '', argDict);

		const payload: Record<string, any> = {};
		for (const [key, value] of Object.entries(this.config.payload || {})) {
			const templateKey = this.interpolateTemplate(key, argDict);
			if (typeof value === 'string') {
				const strippedValue = value.replace(/^\{|\}$/g, '');
				if (strippedValue in argDict) {
					payload[templateKey] = argDict[strippedValue];
				} else {
					payload[templateKey] = this.interpolateTemplate(value, argDict);
				}
			} else {
				payload[key] = value;
			}
		}

		return {
			method: this.config.method || 'GET',
			url,
			headers: this.config.headers,
			body: JSON.stringify(payload)
		};
	}

	async call(...args: any[]): Promise<any> {
		const argDict = this.validateArgs(args);
		const requestConfig = this.prepareRequest(argDict);

		try {
			const response = await fetch(requestConfig.url, requestConfig);

			if (!response.ok) {
				throw new Error(`Request failed: ${response.statusText}`);
			}

			const result = await response.json();

			if (this.config.success_feedback) {
				console.log(
					this.interpolateTemplate(this.config.success_feedback, {
						response: result,
						...argDict
					})
				);
			}

			return result;
		} catch (error) {
			if (this.config.error_feedback) {
				console.log(
					this.interpolateTemplate(this.config.error_feedback, {
						response: error,
						...argDict
					})
				);
			}
			throw error;
		}
	}
}
