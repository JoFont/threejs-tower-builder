import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import livereload from 'rollup-plugin-livereload';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
		file: 'public/bundle.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: true,
		globals: {
            'lodash': '_',
        }
	},
	plugins: [
		resolve(), // tells Rollup how to find imported modules in node_modules
		commonjs(), // converts node modules to ES modules
		production && terser(), // minify, but only in production
		livereload()
	]
};
