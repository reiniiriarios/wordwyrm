/** @type {import('asset-resizer').AssetResizerConfig} */
export default {
  baseUrl: ".",
  inputDir: "assets/src",
  outputDir: "assets/appx",
  flatten: true,
  assets: [
    {
      // Circle icon
      file: "wyrm-icon-1240.png",
      output: [
        {
          file: "Square44x44Logo.png",
          width: 44,
        },
        {
          file: "Square44x44Logo.scale-200.png",
          width: 88,
        },
        {
          file: "Square44x44Logo.scale-400.png",
          width: 176,
        },
      ],
    },
    {
      // Square icon
      file: "wyrm-square-200.png",
      output: [
        {
          file: "StoreLogo.png",
          width: 50,
        },
        {
          file: "StoreLogo.scale-200.png",
          width: 100,
        },
        {
          file: "StoreLogo.scale-400.png",
          width: 200,
        },
      ],
    },
    {
      // Small tile
      file: "wyrm-square-s-512.png",
      output: [
        {
          file: "SmallTile.png",
          width: 71,
        },
        {
          file: "SmallTile.scale-200.png",
          width: 142,
        },
        {
          file: "SmallTile.scale-400.png",
          width: 284,
        },
      ],
    },
    {
      // Medium tile
      file: "wyrm-square-m-1000.png",
      output: [
        {
          file: "Square150x150Logo.png",
          width: 150,
        },
        {
          file: "Square150x150Logo.scale-200.png",
          width: 300,
        },
        {
          file: "Square150x150Logo.scale-400.png",
          width: 600,
        },
      ],
    },
    {
      // Large tile
      file: "wyrm-square-l-1240.png",
      output: [
        {
          file: "LargeTile.png",
          width: 310,
        },
        {
          file: "LargeTile.scale-200.png",
          width: 620,
        },
        {
          file: "LargeTile.scale-400.png",
          width: 1240,
        },
      ],
    },
    {
      // Wide tile
      file: "wyrm-wide-1240x600.png",
      output: [
        {
          file: "Wide310x150Logo.png",
          width: 310,
          height: 150,
        },
        {
          file: "Wide310x150Logo.scale-200.png",
          width: 620,
          height: 300,
        },
        {
          file: "Wide310x150Logo.scale-400.png",
          width: 1240,
          height: 600,
        },
      ],
    },
    {
      // Splash screen
      file: "wyrm-splash-2480x1200.png",
      output: [
        {
          file: "SplashScreen.png",
          width: 620,
          height: 300,
        },
        {
          file: "SplashScreen.scale-200.png",
          width: 1240,
          height: 600,
        },
        {
          file: "SplashScreen.scale-400.png",
          width: 2480,
          height: 1200,
        },
      ],
    },
  ],
};
