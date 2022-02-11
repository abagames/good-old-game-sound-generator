const path = require("path");
const { defineConfig } = require("vite");

/**
 * @type {import('vite').UserConfig}
 */
const config = {
  base: "./",
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/libMain.ts"),
      name: "ggg",
      fileName: (format) => `ggg.${format}.js`,
    },
    outDir: "docs/dist/",
  },
};

module.exports = defineConfig(config);
