import {describe, expect, it} from "bun:test";
import {buildExtended} from "../index.ts";

describe("bun-build :: cli", () => {
    it("should handle css", async () => {
        const snapshot = (await Bun.file("test/test.snapshot.css").text()).trim();
        const output = Bun.spawnSync(["bun", "cli.ts", "./test/test.css"]);
        const css = output.stdout.toString().trim();
        expect(css).toBe(snapshot);
    });

    it("should handle tsx", async () => {
        const snapshot = (await Bun.file("test/test.snapshot.js").text()).trim();
        const output = Bun.spawnSync(["bun", "cli.ts", "./test/test.tsx"]);
        const css = output.stdout.toString().trim();
        expect(css).toBe(snapshot);
    });
});

describe("bun-build :: cli", () => {
    it("can use postcss-cli", async () => {
        const snapshot = (await Bun.file("test/test.postcss.snapshot.css").text()).trim();
        const build = await buildExtended({
            css: {
                processor: "postcss",
            },
            entrypoints: ["./test/test.css"],
        });
        const css = (await build.outputs[0].text()).trim();
        expect(css).toBe(snapshot);
    });

    it("can use tailwindcss", async () => {
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