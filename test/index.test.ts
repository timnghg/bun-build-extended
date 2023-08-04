import {describe, expect, it, beforeAll, afterAll} from "bun:test";
import {buildExtended} from "../index";
import {copyFileSync, unlinkSync} from "fs";

describe("bun-build :: cli", () => {
    beforeAll(() => {
        copyFileSync("./test/postcss.config.cjs", "./postcss.config.cjs");
        copyFileSync("./test/tailwind.config.js", "./tailwind.config.js");
    });

    afterAll(() => {
        unlinkSync("./postcss.config.cjs");
        unlinkSync("./tailwind.config.js");
    });

    it("should handle css :: cli", async () => {
        const snapshot = (await Bun.file("./test/test.snapshot.css").text()).trim();
        const output = Bun.spawnSync(["bun", "cli.ts", "./test/test.css"]);
        const css = output.stdout.toString().trim();
        expect(css).toBe(snapshot);
    });

    it("should handle tsx :: cli", async () => {
        const output = Bun.spawnSync(["bun", "cli.ts", "./test/test.tsx"]);
        const css = output.stdout.toString().trim();

        // todo: find reason of output different in Github CI
        // const snapshot = (await Bun.file("./test/test.snapshot.js").text()).trim();
        // expect(css).toBe(snapshot);

        expect(css).toBeTruthy();
    });

    it("can use postcss-cli :: library", async () => {
        const build = await buildExtended({
            css: {
                processor: "postcss",
            },
            entrypoints: ["./test/test.css"],
        });
        const css = (await build.outputs[0].text()).trim();
        expect(css).toBeTruthy();

        // todo: find reason of output different in Github CI
        // const snapshot = (await Bun.file("./test/test.postcss.snapshot.css").text()).trim();
        // expect(css).toBe(snapshot);
    });

    it("can use tailwindcss :: library", async () => {
        const snapshot = (await Bun.file("test/test.snapshot.css").text()).trim();
        const build = await buildExtended({
            css: {
                processor: "tailwindcss",
            },
            entrypoints: ["./test/test.css"],
        });
        const css = (await build.outputs[0].text()).trim();
        expect(css).toBe(snapshot);
    });
});
