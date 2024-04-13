# Notes on asset creation

## General

| File        | Use                            |
| ----------- | ------------------------------ |
| 32x32.png   | Favicon                        |
| 512x512.png | Linux, sourced for other sizes |
| icon.icns   | macOS                          |
| icon.ico    | Windows                        |

To generate icns and ico files, run `npm run build:icons`.

## NSIS

| File                | Default  |
| ------------------- | -------- |
| installerIcon.ico   | icon.ico |
| uninstallerIcon.ico | icon.ico |

### Assisted Installer

| File                 | Size    |
| -------------------- | ------- |
| installerHeader.bmp  | 150x57  |
| installerSidebar.bmp | 164x314 |

### ~~One-click Installer~~

| File                    | Default  |
| ----------------------- | -------- |
| installerHeaderIcon.ico | icon.ico |

## AppX Icons for Windows Store

| File                  | Size    | Max Size  | Required |
| --------------------- | ------- | --------- | -------- |
| StoreLogo.png         | 50x50   | 200x200   | yes      |
| Square44x44Logo.png   | 44x44   | 256x256   | yes      |
| Square150x150Logo.png | 150x150 | 600x600   | yes      |
| Wide310x150Logo.png   | 310x150 | 1240x600  | yes      |
| SmallTile.png         | 71x71   | 284x284   | no       |
| LargeTile.png         | 310x310 | 1240x1240 | no       |
| SplashScreen.png      | 620x300 | 2480x1200 | no       |

## Windows Store Images

| File            | Size      | Max Size  | Description                                                                      |
| --------------- | --------- | --------- | -------------------------------------------------------------------------------- |
| 9:16 Poster     | 720x1080  | 1440x2160 | Main logo for Windows 10, required for Xbox.                                     |
| 1:1 Box art     | 1080x1080 | 2160x2160 | May be used in various Store layouts. Main logo if 9:16 Poster art not provided. |
| 16:9 Super hero | 1920x1080 | 3840x2160 | Top of store listing for Windows 10.                                             |

Updated Info: [Construct your Windows app's icon](https://learn.microsoft.com/en-us/windows/apps/design/style/iconography/app-icon-construction)
