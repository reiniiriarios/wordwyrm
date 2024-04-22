# <img src="assets/icons/32x32.png" alt="" /> Wordwyrm

<!-- [![GitHub Release](https://img.shields.io/github/v/release/reiniiriarios/wordwyrm?label=Latest%20Release&logo=github&logoColor=%23fff)](https://github.com/reiniiriarios/wordwyrm/releases/latest)
[![Download on Snapcraft](https://snapcraft.io/wordwyrm/badge.svg)](https://snapcraft.io/wordwyrm)
![Build Status](https://github.com/reiniiriarios/wordwyrm/actions/workflows/release.yaml/badge.svg) -->

A cross-platform desktop app for tracking what books you've read and when. The data is stored as
YAML files and JPGs in author directories in a location of your choosing, so you're always in
control of your data.

![](docs/screenshot-14-linux.png)

## Download

<p>
<a href="https://apps.microsoft.com/detail/Wordwyrm/9PD0SF19CNLJ?cid=github&mode=direct"><img src="https://get.microsoft.com/images/en-us%20dark.svg" height="60"/></a>
&nbsp;
<a href="https://snapcraft.io/wordwyrm"><img alt="Get it from the Snap Store" src="https://snapcraft.io/static/images/badges/en/snap-store-black.svg" height="60" /></a>
</p>

[![Get Windows Installer](https://img.shields.io/badge/Windows_Installer-Get-blue?style=for-the-badge&logo=windows&logoColor=%23fff&color=%230078D4)](https://github.com/reiniiriarios/wordwyrm/releases/latest) &nbsp;
[![Static Badge](https://img.shields.io/badge/Windows_Portable-Get-blue?style=for-the-badge&logo=windows&logoColor=%23fff&color=%2362ac06)](https://github.com/reiniiriarios/wordwyrm/releases/latest) &nbsp;
[![Static Badge](https://img.shields.io/badge/macOS-Get-blue?style=for-the-badge&logo=apple&logoColor=%23fff&color=%23222)](https://github.com/reiniiriarios/wordwyrm/releases/latest)

[![Static Badge](https://img.shields.io/badge/Debian_%20_Package-Get-blue?style=for-the-badge&logo=debian&logoColor=%23fff&color=%23A81D33)](https://github.com/reiniiriarios/wordwyrm/releases/latest) &nbsp;
[![Static Badge](https://img.shields.io/badge/Red_%20_Hat_%20_Package-Get-blue?style=for-the-badge&logo=redhat&logoColor=%23fff&color=%23cc0000)](https://github.com/reiniiriarios/wordwyrm/releases/latest) &nbsp;
[![Static Badge](https://img.shields.io/badge/AppImage-Get-blue?style=for-the-badge&logo=linux&logoColor=%23fff&color=%23FCC624)](https://github.com/reiniiriarios/wordwyrm/releases/latest)

## Data

When first using, set a directory under :gear: settings to store book data. Data is stored in
easy-to-parse yaml files, with cover images stored alongside them, within author directories. To
share data between devices, you can simply select a directory in a file sharing app like OneDrive,
Google Drive, Dropbox, etc.

![](docs/screenshot-data-01-linux.png)

```yaml
version: "2"
title: Gideon the Ninth
authors:
  - name: Tamsyn Muir
tags:
  - Science Fiction
  - Fantasy
  - Dark Fantasy
series: Locked Tomb
datePublished: "2019-09-10"
dateRead: "2021-04-15"
timestampAdded: 1712277340024
images:
  hasImage: true
  imageUpdated: 1712277341293
ids:
  isbn: "1101443316"
  googleBooksId: HHJwDwAAQBAJ
  goodreadsId: "42036538"
  openLibraryId: /works/OL20128158W
  wikidataId: Q100708760
  internetArchiveId: gideonninth0000muir
```

## Google Cloud for Book Cover Images

In order to enable Google Image Search for book covers **in-app**, you will need a Google Cloud account.
[Create an API key](https://console.cloud.google.com/apis/credentials) that has permissions to
use the **Custom Search API**. You will also need a
[Programmable Search Engine](https://programmablesearchengine.google.com/) id. Enable
"Image search" and "Search the entire web" in its settings. Your
[API Key](https://console.cloud.google.com/apis/credentials) will also need the
**Custom Search API** enabled.
