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
          file: "64x64.png",
          width: 64,
        },
        {
          file: "128x128.png",
          width: 128,
        },
        {
          file: "256x256.png",
          width: 256,
        },
        {
          file: "icon.png",
          width: 256,
        },
        {
          file: "512x512.png",
          width: 512,
        },
        {
          file: "1024x1024.png",
          width: 1024,
        },
      ],
    },
  ],
};
