import type { Function } from './function';
import { Game } from './game';

export class Agent {
	#game: Game;
	#goal: string;
	#description: string;
	#world: string;
	#enabledFunctions: string[];
	#customFunctions: Function[];

	constructor(key: string, goal = '', description = '', world = '') {
		this.#game = new Game(key);
		this.#goal = goal;
		this.#description = description;
		this.#world = world;
		this.#enabledFunctions = [];
		this.#customFunctions = [];
	}

    set goal(goal: string) {
        this.#goal = goal;
    }
    set description(description: string) {
        this.#description = description;
    }
    set world(world: string) {
        this.#world = world;
    }

    get goal() {
        return this.#goal;
    }

    get description() {
        return this.#description;
    }

    get world() {
        return this.#world;
    }

	async listAvailableDefaultTwitterFunctions(): Promise<Record<string, string>> {
		return this.#game.functions();
	}

	useDefaultTwitterFunctions(functions: string[]): boolean {
		this.#enabledFunctions = functions;
		return true;
	}

	addCustomFunction(customFunction: Function): boolean {
		this.#customFunctions.push(customFunction);
		return true;
	}

	async simulateTwitter(sessionId: string) {
		return this.#game.simulate({
			sessionId,
			goal: this.#goal,
			description: this.#description,
			world: this.#world,
			functions: this.#enabledFunctions,
			customFunctions: this.#customFunctions.map((f) => f.toJson())
		});
	}

	async react(params: {
		sessionId: string;
		platform: string;
		tweetId?: string;
		event?: string;
		task?: string;
	}) {
		return this.#game.react(params.platform, {
			sessionId: params.sessionId,
			event: params.event,
			task: params.task,
			tweetId: params.tweetId,
			goal: this.#goal,
			description: this.#description,
			world: this.#world,
			functions: this.#enabledFunctions,
			customFunctions: this.#customFunctions.map((f) => f.toJson())
		});
	}

	async deployTwitter() {
		return this.#game.deploy({
			goal: this.#goal,
			description: this.#description,
			world: this.#world,
			functions: this.#enabledFunctions,
			customFunctions: this.#customFunctions.map((f) => f.toJson())
		});
	}

	export(): string {
		const exportDict = {
			goal: this.#goal,
			description: this.#description,
			world: this.#world,
			functions: this.#enabledFunctions,
			customFunctions: this.#customFunctions.map((f) => f.toJson())
		};

		return JSON.stringify(exportDict, null, 4);
	}
}
