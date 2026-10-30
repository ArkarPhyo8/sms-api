import { build } from "esbuild";
// import { tsconfigPathsPlugin } from "esbuild-plugin-tsconfig-paths";
// import typescript from "typescript";

try {
  await build({
    entryPoints: ["app.ts"],
    bundle: true,
    platform: "node",
    target: "es2023",
    format: "esm",
    outdir: "dist",
    packages: "external",
    sourcemap: true,
    // plugins: [tsconfigPathsPlugin({ tsconfig: "./tsconfig.json" })],
  });

  console.log("Build completed successfully");
} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
}
