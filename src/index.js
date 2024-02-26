import { preprocess as sveltePreprocess } from "svelte/compiler";
import { preprocessScript } from "./preprocess.js";
import { createFilter } from "vite";

/**
 * Preprocessor for Brefer syntax, using variable prefixes to handle reactivity.
 * It avoids the need to call `$state`, `$derived` or `$effect` runes every time.
 *
 * If you also want to preprocess .svelte.js files, use `brefer` instead.
 *
 * @returns { import("svelte/compiler").PreprocessorGroup }
 */
export function breferPreprocess() {
	return {
		name: "brefer-preprocessor",
		async script({ content, filename, attributes }) {
			return preprocessScript(content, filename, attributes.lang);
		},
	};
}


/**
 * Brefer vite plugin for svelte. It allows to preprocess .svelte.js files as well as .svelte files.
 *
 * Prefer the use of `breferPreprocess` if you want to preprocess .svelte files only.
 *
 * @export
 * @param {import("./public.js").BreferConfig} config
 * @returns {import("vite").Plugin}
 */
export function brefer(config = {}) {
	const shouldProcess = createFilter(config.include, config.exclude);

	return {
		name: "vite-plugin-svelte-brefer",
  enforce: "pre",
		async transform(code, id) {
			if (!shouldProcess(id)) {
				return;
			}

			if (id.endsWith(".svelte")) {
				const preprocessed = await sveltePreprocess(code, breferPreprocess(), {
					filename: id,
				});

				return {
					code: preprocessed.code,
					map: /** @type {string} */ (preprocessed.map),
					id,
				};
			}
			if (id.endsWith(".svelte.js") || id.endsWith(".svelte.ts")) {
				const preprocessed = preprocessScript(code, id, id.slice(-2));

				return {
					code: preprocessed.code,
					map: preprocessed.map,
					id,
				};
			}
		},
	};
}
