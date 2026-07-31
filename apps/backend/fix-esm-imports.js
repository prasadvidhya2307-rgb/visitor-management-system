import fs from "node:fs";
import path from "node:path";

const SRC_DIR = path.join(process.cwd(), "src");

function processFile(filePath) {
    let content = fs.readFileSync(filePath, "utf8");

    content = content.replace(
        /(from\s+['"])(\.\.?\/[^'"]+)(['"])/g,
        (_, start, importPath, end) => {
            if (
                importPath.endsWith(".js") ||
                importPath.endsWith(".json")
            ) {
                return start + importPath + end;
            }

            const absolute = path.resolve(path.dirname(filePath), importPath);

            if (fs.existsSync(absolute + ".ts")) {
                return start + importPath + ".js" + end;
            }

            if (
                fs.existsSync(path.join(absolute, "index.ts"))
            ) {
                return start + importPath + "/index.js" + end;
            }

            console.warn(
                `⚠ Could not resolve ${importPath} in ${path.relative(
                    SRC_DIR,
                    filePath,
                )}`,
            );

            return start + importPath + end;
        },
    );

    content = content.replace(
        /(import\s*\(\s*['"])(\.\.?\/[^'"]+)(['"]\s*\))/g,
        (_, start, importPath, end) => {
            if (
                importPath.endsWith(".js") ||
                importPath.endsWith(".json")
            ) {
                return start + importPath + end;
            }

            const absolute = path.resolve(path.dirname(filePath), importPath);

            if (fs.existsSync(absolute + ".ts")) {
                return start + importPath + ".js" + end;
            }

            if (
                fs.existsSync(path.join(absolute, "index.ts"))
            ) {
                return start + importPath + "/index.js" + end;
            }

            return start + importPath + end;
        },
    );

    fs.writeFileSync(filePath, content);
}

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            walk(full);
            continue;
        }

        if (full.endsWith(".ts")) {
            processFile(full);
            console.log("✔", path.relative(SRC_DIR, full));
        }
    }
}

walk(SRC_DIR);

console.log("\n✅ Finished!");