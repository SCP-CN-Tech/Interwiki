# Interwiki

This is the Interwiki module made by the [SCP Wiki](https://scpwiki.com),
the English-speaking branch of SCP, for all branches of the [international
SCP](http://scp-int.wikidot.com/) and [Wanderers'
Library](http://wanderers-library.wikidot.com/) communities.

This Interwiki module is [forked](https://github.com/SCP-CN-Tech/Interwiki)
from [SCP 基金会](http://scp-wiki-cn.wikidot.com/), the Chinese branch of
SCP, and was originally made by **[@7happy7](https://github.com/7happy7)**
and **[@Sekai-s](https://github.com/Sekai-s)**.

The Interwiki is for cross-linking translations of articles between
international branches. Placed on any page in the SCP or WL community, the
Interwiki will list pages with a matching 'fullname' / 'UNIX name' / URL
from other branches of that community.

The Interwiki can be styled with CSS and has no limit on the number of
styles that can be applied to it.

# Usage

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
[[div class="scpnet-interwiki-wrapper interwiki-stylable"]]
[[module ListPages range="." limit="1"]]
[[embed]]
<iframe src="//SITE.wdfiles.com/local--files/PAGE/interwikiFrame.html?lang=LANG&community=COMMUNITY&pagename=%%fullname%%" allowtransparency="true" class="html-block-iframe scpnet-interwiki-frame"></iframe>
[[/embed]]
[[/module]]
[[/div]]
```

There are a few placeholders in that URL that must be changed:

- **`SITE`:** The UNIX name of the Wikidot site that `interwikiFrame.html`
  has been uploaded to. The SCP Wiki (`scp-wiki`) has this file uploaded
  already, so you can just set it to that, unless you wish to upload the
  file to your wiki yourself.
- **`PAGE`:** The fullname (a.k.a. page UNIX name) of the page that
  `interwikiFrame.html` has been uploaded to. This SCP wiki has this file
  uploaded to the page at fullname `nav:side`.
- **`LANG`:** The language code of your site, as defined in either
  [`js/branches-info-scp.js`](js/branches-info-scp.js) or
  [`js/branches-info-wl.js`](js/branches-info-wl.js), depending on the
  community.
- **`COMMUNITY:`** The community that the current page belongs to. Can be
  either `scp` or `wl`. If your site hosts pages from only one community,
  just add it; if your site hosts pages from both communities, you may wish
  to use ListPages to detect which one the current page belongs to (see
  collapsible below).

If you are using the SCP Wiki's copy of `interwikiFrame.html` (and
`styleFrame.html`), you do not need to upload any files to Wikidot.

Note that the URL in the iframe starts with `//` rather than `http://` or
`https://`. This is a protocol-relative URL, which will preserve the type of
connection the user is using, and ensures that the Interwiki works
regardless of whether the site is configured to use HTTP or HTTPS (or
both).

Note the `interwiki-stylable` class in the wrapping container. This
indicates to CSS themes that the interwiki is capable of being styled
itself, and does not need to have styles externally approximated (e.g. by
using CSS filters). This is used by themes targeting multiple sites with
Interwikis that may or may not be this new Interwiki, such as Black
Highlighter, for example.

<details>
<summary>
<b>Example of using ListPages to determine community</b>
</summary>

This example uses two ListPages modules with category filters to determine
which community the current page belongs to. This specific example assumes
that pages in the `wanderers` or `wanderers-adult` categories belong to WL,
and any others belong to SCP.

The category filters are mutually-exclusive, so this will never produce
more than one Interwiki per page.

```Soong
[[div class="scpnet-interwiki-wrapper interwiki-stylable"]]
[[module ListPages range="." limit="1" category="-wanderers -wanderers-adult"]]
[[embed]]
<iframe src="//SITE.wdfiles.com/local--files/PAGE/interwikiFrame.html?lang=LANG&community=scp&pagename=%%fullname%%" class="html-block-iframe scpnet-interwiki-frame"></iframe>
[[/embed]]
[[/module]]

[[module ListPages range="." limit="1" category="wanderers wanderers-adult"]]
[[embed]]
<iframe src="//SITE.wdfiles.com/local--files/PAGE/interwikiFrame.html?lang=LANG&community=wl&pagename=%%fullname%%" class="html-block-iframe scpnet-interwiki-frame"></iframe>
[[/embed]]
[[/module]]
[[/div]]
```

</details>

## Styling the Interwiki

The Interwiki, by default, only has default Wikidot styling. To style it
further, a `styleFrame` must be added. A `styleFrame` applies CSS styling
to the `interwikiFrame`.

To add a `styleFrame` to a Wikidot page:

```Soong
[[embed]]
<iframe src="//SITE.wdfiles.com/local--files/PAGE/styleFrame.html?priority=PRIORITY&theme=THEME&css=CSS" style="display: none;"></iframe>
[[/embed]]
```

There are a few placeholders in that URL that must be changed:

- **`SITE`:** The UNIX name of the Wikidot site that `styleFrame.html` has
  been uploaded to. The SCP Wiki (`scp-wiki`) has this file uploaded
  already, so you can just set it to that, unless you wish to upload the
  file to your wiki yourself.
- **`PAGE`:** The fullname (a.k.a. page UNIX name) of the page that
  `styleFrame.html` has been uploaded to. The SCP wiki has this file
  uploaded to the page at fullname `nav:side`.
- **`PRIORITY`:** The priority of the styling that this `styleFrame`
  applies. Corresponds to the internal sort order of the CSS. The base
  theme of the site should have a priority of 0. The priority number of any
  other CSS theme should be the priority number of the theme it extends,
  plus one. The Interwiki will raise a warning in the browser console if it
  encounters two styles with the same priority number.
- **`THEME`:** A pointer to a CSS stylesheet to apply to the Interwiki. May
  be one of the following values:
  - The fullname of a page on the same site as the Interwiki's language
    code. The first [code
    block](https://www.wikidot.com/doc-wiki-syntax:code-blocks) on that
    page will be imported as CSS.
  - A fullname of page on that site, with `/code/n` appended to refer to
    the `n`th code block.
  - A full URL to any CSS stylesheet on any site. (Useful for e.g. sandbox
    wikis that do not have their own Interwiki configuration.)
- **`CSS`:** [URI-encoded](https://meyerweb.com/eric/tools/dencoder/) CSS
  to apply directly to the Interwiki.

The `theme` and `css` parameters determine the CSS styling that the
`styleFrame` adds. At least one must be present for the `styleFrame` to do
anything. If both are present, the styling from `theme` will be added
_before_ the styling from `css`.

Note the `style="display: none;"` at the end of the `styleFrame` iframe.
This just hides the iframe &mdash; it doesn't set the style of the
Interwiki.

### Adding default styling

To add default styling to your site's Interwiki, on **the same page as the
`interwikiFrame` iframe**, add a `styleFrame` with `priority=0`.

For example, the following `interwikiFrame` and `styleFrame` would be on
the page `nav:side` of the SCP Wiki:

```Soong
[[module ListPages range="." limit="1"]]
[[embed]]
<iframe src="//scp-wiki.wdfiles.com/local--files/nav:side/interwikiFrame.html?lang=en&community=scp&pagename=%%fullname%%" class="html-block-iframe scpnet-interwiki-frame"></iframe>
[[/embed]]
[[/module]]

[[embed]]
<iframe src="//scp-wiki.wdfiles.com/local--files/nav:side/styleFrame.html?priority=0&theme=component:theme" style="display: none;"></iframe>
[[/embed]]
```

### Adding additional styling

To add additional styling (e.g. for a CSS theme to add its own styling to
the Interwiki), another `styleFrame` should be added to that theme, with a
higher `priority` number.

CSS themes hosted on your site are expected to be used via Wikidot
[`[[include]]`](https://www.wikidot.com/doc-wiki-syntax:include). If this
is the case, `[[include]]`ing CSS themes that style the Interwiki should
result in styling being applied as expected, so long as all CSS themes used
have the correct `priority` number.

For example, for a CSS theme on the SCP Wiki located at the page
`theme:my-theme`, with a single code block containing all the CSS including
CSS that will be applied to the Interwiki, intended to be used via
`[[include theme:my-theme]]`:

```Soong
[[iframe https://scp-wiki.wdfiles.com/local--files/nav:side/styleFrame.html?priority=1&theme=theme:my-theme style="display: none;"]]
```

In this example, the theme `theme:my-theme` is an extension to Sigma-9
(which, being the base theme of the site, has a priority number of 0), so
its priority is 1 (Sigma-9's priority plus one).

### Writing CSS

The internal structure of the Interwiki is designed to be consistent with
the standard sidebar used on SCP sites.

The Interwiki is a single `html#interwiki body div.side-block`. Inside is a
`div.heading p`, which is the title of the side block. Beneath the
`.heading`, a series of `div.menu-item[name]` will be created, with the
value of `name` corresponding to the branch's language code. If the link
points to the original article rather than a translation, the element will
also have class `.original.`. Inside each `.menu-item` is an `img.image`
containing the Sigma-9 bullet point, followed by an `a[href]` for the
translation link.

Do not add margin or padding to either `html` or `body`, as this will cause
a vertical scrollbar to appear on the Interwiki.

# Development

Install locally with [NPM](https://www.npmjs.com/): `npm install`

We use [Prettier](https://prettier.io/) for formatting: `npm run format`

To test locally, run `npm run serve`, note the local IP for the server, and
follow the usual setup instructions using it as the hosted location. On
page refresh the iframe will be reloaded with any new changes without
needing to be recompiled.

To build, run `npm run build`. Output can be found in the `dist/` directly,
and all files present should be hosted for usage.

All JavaScript should be written in ES5.
