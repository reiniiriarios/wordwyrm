/** @type {import('asset-resizer').AssetResizerConfig} */
export default {
  baseUrl: ".",
  inputDir: "assets/src",
  outputDir: "assets/icons",
  flatten: true,
  assets: [
    {
      // Circle icon
      file: "wyrm-icon-1240.png",
      output: [
        {
          file: "32x32.png",
          width: 32,
        },
        {
          file: "512x512.png",
          width: 512,
        },
      ],
    },
  ],
};
