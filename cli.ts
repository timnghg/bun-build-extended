#!/usr/bin/env bun
import {buildExtended} from "./index.ts";
import process from "process";
import {BuildConfig} from "bun";
import set from "lodash.set";

handleCli();

export function handleCli() {
    if (!import.meta.main) return;


    const args = process.argv.slice(2);
    if (args.length) {
        const entrypoints = args.filter(arg => !arg.startsWith("--"));
        const options: BuildConfig = {
            entrypoints
        };
        args.filter(arg => arg.startsWith("--"))
            .map(arg => arg.replace(/^--/, ""))
            .forEach(arg => {
                let [key, value] = arg.split("=").map(arg => arg.trim());
                if (key.includes('-')) {
                    key = key.replace("-", ".");
                }
                set(options, key, swapValue(value));
            });

        if (entrypoints.length > 1 && !options.outdir) {
            console.error('Multiple entrypoints require --outdir=<path>');
            return;
        }

        buildExtended(options).then((output) => {
            if (entrypoints.length === 1) {
                output.outputs[0].text().then(console.log);
            }
        });
    } else {
        console.error('No entrypoints specified');
        process.exit(1);
    }
}

function swapValue(value: any) {
    const valueSwap = [
        [undefined, true],
        [null, true],
        ["0", false],
        ["false", false],
        ["FALSE", false],
    ];
    const match = valueSwap.find(v => v[0] === value);
    return typeof match != "undefined" ? match : value;
}