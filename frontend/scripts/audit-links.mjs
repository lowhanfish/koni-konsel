import fs from "node:fs";
import path from "node:path";

const appDirectory = path.resolve("app");
const sourceFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else if (/\.tsx?$/.test(entry.name)) sourceFiles.push(filePath);
  }
}

walk(appDirectory);

const staticRoutes = new Set(["/"]);
const dynamicRoutes = [];

for (const filePath of sourceFiles.filter((file) => file.endsWith(`${path.sep}page.tsx`))) {
  let route = path.dirname(path.relative(appDirectory, filePath));
  route = route === "." ? "/" : `/${route.split(path.sep).join("/")}`;
  if (route.includes("[")) dynamicRoutes.push(new RegExp(`^${route.replace(/\[[^/]+\]/g, "[^/]+")}$`));
  else staticRoutes.add(route);
}

const missing = [];
const placeholders = [];
for (const filePath of sourceFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  for (const match of source.matchAll(/href=["'](#[^"']*|javascript:[^"']*|)["']/gi)) {
    placeholders.push(`${path.relative(process.cwd(), filePath)} -> ${match[1] || "href kosong"}`);
  }
  for (const match of source.matchAll(/href=["'](\/(?!\/)[^"'?#]*)/g)) {
    const target = match[1].replace(/\/$/, "") || "/";
    if (!staticRoutes.has(target) && !dynamicRoutes.some((route) => route.test(target))) {
      missing.push(`${path.relative(process.cwd(), filePath)} -> ${target}`);
    }
  }
}

if (placeholders.length) {
  console.error(`Tautan placeholder ditemukan:\n${placeholders.join("\n")}`);
  process.exit(1);
}

if (missing.length) {
  console.error(`Tautan internal tanpa halaman:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log(`Audit tautan lulus: ${staticRoutes.size} route statis, ${dynamicRoutes.length} route dinamis.`);
