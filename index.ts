import {BuildArtifact, BuildConfig, BuildOutput, BunPlugin, PluginBuilder} from "bun";
import process from "process";
import * as path from "path";
import {mkdirSync} from "fs";

export async function buildExtended(
    {css, ...config}: BuildConfig & {
        css?: { processor?: "tailwindcss" | "postcss", options?: string[] }
    }
) {
    const cssFiles = config.entrypoints.filter(entrypoint => entrypoint.endsWith(".css"));
    const otherFiles = config.entrypoints.filter(entrypoint => !entrypoint.endsWith(".css"));
    const artifacts: BuildOutput = {
        outputs: [],
        success: false,
        logs: [],
    };
    const outdir = config?.outdir ? path.resolve(process.cwd(), config?.outdir) : undefined;

    // prepare outdir
    if (cssFiles.length && outdir) {
        if (!await Bun.file(outdir).exists()) {
            mkdirSync(outdir, {recursive: true});
        }
    }

    if (otherFiles.length) {
        const otherFileArtifacts = await Bun.build({
            plugins: [],
            target: 'browser',
            ...config,
            entrypoints: otherFiles,
        });
        artifacts.outputs.push(...otherFileArtifacts.outputs);
        artifacts.logs.push(...otherFileArtifacts.logs);
        artifacts.success = otherFileArtifacts.success;
        console.log("artifacts", artifacts)
    }

    if (cssFiles.length) {
        for (const cssFile of cssFiles) {
            const output = css?.processor === "postcss"
                ? postcssCli(cssFile, css?.options)
                : tailwindcss(cssFile, css?.options);
            const artifact: BuildArtifact = new Response(output.stdout) as unknown as BuildArtifact;
            artifact.loader = "text";
            artifact.kind = "asset";
            artifact.sourcemap = null;
            artifact.path = cssFile;

            artifacts.outputs.push(artifact);
            const message = output.stderr.toString();
            if (message) {
                const level = message.indexOf("Done in ") > -1 ? "warning" : "error";
                artifacts.logs.push(
                    {
                        name: "BuildMessage",
                        position: null,
                        message: output.stderr.toString(),
                        level: level,
                    }
                );
            }

            if (outdir) {
                await Bun.write(path.resolve(outdir, path.basename(cssFile)), output.stdout);
            }
        }
    }

    return artifacts;
}

function tailwindcss(path: string, options?: string[]) {
    return Bun.spawnSync(['bunx', 'tailwindcss', "--minify", ...(options || []), "-i", path]);
}

function postcssCli(path: string, options?: string[]) {
    return Bun.spawnSync(['bunx', 'postcss-cli', path, ...(options || [])]);
}

/**
 * Not working yet, Bun still missing css loader
 * @deprecated
 *
 * @param processor
 * @param options
 */
export function createCssPlugin({processor, options}: {
    processor: "tailwindcss" | "postcss" | string,
    options?: string[]
}) {
    const cssPlugin: BunPlugin = {
        name: "css",
        async setup(build: PluginBuilder) {
            build.onLoad({filter: /\.css$/}, ({path}) => {
                const contents = processor === "tailwindcss"
                    ? tailwindcss(path, options)
                    : postcssCli(path, options);
                return {
                    contents: contents.stdout,
                    error: contents.stderr,
                    loader: "text", // should be css
                }
            })
        }
    }
    return cssPlugin;
}