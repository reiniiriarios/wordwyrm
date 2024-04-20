import svelte from "rollup-plugin-svelte";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import livereload from "rollup-plugin-livereload";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import nodePolyfills from "rollup-plugin-polyfill-node";
import css from "rollup-plugin-css-only";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";
import alias from "@rollup/plugin-alias";
import path from "path";
import url from "url";
import { spawn } from "child_process";

import tsconfig from "./tsconfig.json" assert { type: "json" };

const PORT = 5000;
const production = process.env.WYRM_ENV === "prod" ? true : false;

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function serve() {
  let server;

  function toExit() {
    if (server) {
      server.kill(0);
    }
  }

  return {
    writeBundle() {
      if (server) {
        return;
      }
      server = spawn("npm", ["run", "start", "--", "--dev", "--port", PORT], {
        stdio: ["ignore", "inherit", "inherit"],
        shell: true,
      });

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    },
  };
}

function tsalias() {
  const paths = [];

  for (const value in tsconfig.compilerOptions.paths) {
    paths.push({
      replacement: path.resolve(
        path.resolve(__dirname),
        tsconfig.compilerOptions.paths[value][0].replace("./", "").replace("/*", ""),
      ),
      find: value.replace("./", "").replace("/*", ""),
    });
  }

  return paths;
}

export default {
  input: "frontend/core/init.ts",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "dist/bundle.js",
    globals: {
      fs: "fs",
      path: "path",
    },
  },
  plugins: [
    json(),
    copy({
      targets: [
        { src: "public/**/*", dest: "dist" },
        { src: "assets/icons/*", dest: "dist" },
        { src: "assets/images/*", dest: "dist" },
        { src: "assets/nsis/*", dest: "dist" },
        { src: "assets/appx/*", dest: "build" },
      ],
    }),
    nodePolyfills(),
    svelte({
      preprocess: sveltePreprocess({
        sourceMap: !production,
        scss: { includePaths: ["app/**/*.scss"] },
      }),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    alias({
      entries: tsalias(),
    }),
    commonjs(),
    typescript({
      sourceMap: true,
      inlineSources: !production,
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: "bundle.css" }),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload({ watch: "dist", delay: 200 }),
  ],

  watch: {
    clearScreen: false,
  },
};
