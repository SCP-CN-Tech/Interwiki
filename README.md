# Interwiki

This is the Interwiki module for the [SCP Wiki](https://scpwiki.com), the
English-speaking branch of SCP, used for displaying translations of
articles in the [international SCP community](http://scp-int.wikidot.com/).

This Interwiki module is [forked](https://github.com/SCP-CN-Tech/Interwiki)
from [SCP 基金会](http://scp-wiki-cn.wikidot.com/), the Chinese branch of
SCP, and was originally made by 7happy7.

# Deployment

To use the Interwiki on your [Wikidot](https://www.wikidot.com/) site:

## Installing the base Interwiki

You need to know which page is going to contain the Interwiki. The contents
of this page must appear on every page that intend to link to its
translations, so choices are limited:

- SCP sites typically place the Interwiki in the sidebar, which is
  configured to appear on every page, and by convention is located at
  fullname `nav:side`.
- WL sites typically place the Interwiki in the default page template, the
  contents of which by definition appear on every page, located at fullname
  `_template`.

On this page, create an iframe containing the
[`html/interwikiFrame.html`](html/interwikiFrame.html) file, passing it
some URL query parameters. Use a [ListPages
module](https://www.wikidot.com/doc-modules:listpages-module) to pass it
information about the current page.

```Soong
[[module ListPages range="." limit="1"]]
[[iframe https://SITE.wdfiles.com/local--files/PAGE/interwikiFrame.html?lang=LANG&community=COMMUNITY&pagename=%%fullname%%]]
[[/module]]
```

There are a few placeholders in that URL that must be changed:

- **`SITE`:** The UNIX name of the Wikidot site that the
  `interwikiFrame.html` has been uploaded to. The SCP Wiki (`scp-wiki`) has
  this file uploaded already, so you can just set it to that, unless you
  wish to upload the file to your wiki yourself.
- **`PAGE`:** The fullname (a.k.a. page UNIX name) of the page that
  `interwikiFrame.html` has been uploaded to. This SCP wiki has this file
  uploaded to the page at fullname `nav:side`.
- **`LANG`:** The language code of your site, as defined in either
  [`js/branches-info-scp.js`](js/branches-info-scp.js) or
  [`js/branches-info-wl.js`](js/branches-info-wl.js), depending on the
  community.
- **`COMMUNITY:`** The community that the current page belongs to. Can be
  either `scp` or `wl`. If your site hosts pages from only one community,
  just add it; if your site hosts pages from either community, you may wish
  to use ListPages to detect which one the current page belongs to (see below).

<details>
<summary>
Example of using ListPages to determine community
</summary>

This example uses two ListPages modules with category filters to determine
which community the current page belongs to. This specific example assumes
that pages in the `wanderers` or `wanderers-adult` categories belong to WL,
and any others belong to SCP.

The category filters are mutually-exclusive, so this will never produce
more than one Interwiki per page.

```Soong
[[module ListPages range="." limit="1" category="-wanderers -wanderers-adult"]]
[[iframe https://SITE.wdfiles.com/local--files/PAGE/interwikiFrame.html?lang=LANG&community=scp&pagename=%%fullname%%]]
[[/module]]

[[module ListPages range="." limit="1" category="wanderers wanderers-adult"]]
[[iframe https://SITE.wdfiles.com/local--files/PAGE/interwikiFrame.html?lang=LANG&community=wl&pagename=%%fullname%%]]
[[/module]]
```

</details>

## Styling the Interwiki

# Development

Install locally with [NPM](https://www.npmjs.com/):

```shell
npm install
```

We use [Prettier](https://prettier.io/) for formatting:

```shell
npm run format
```

Development is intentionally simple and we have no compile step. New code
should be written in ES5 and be executable on older browsers.
