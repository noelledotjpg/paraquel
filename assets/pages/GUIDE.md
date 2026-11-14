# MSPFA-Like Page Format Guide

This project uses **JSON5** files to define pages for your web adventure.

Each page is rendered dynamically with JavaScript and supports ordered text, media,

spoilers, pesterlogs, and navigation.

## File Structure

```
./assets/pages/
├─ chapter-1/
│  ├─ 1.json5
│  ├─ 2.json5
│  └─ ...
├─ chapter-2/
│  ├─ 1.json5
│  └─ ...
└─ index.json5   (generated automatically)
```

Each page lives at:

```
/assets/pages/chapter-{chapterNumber}/{pageNumber}.json5
```

## Top-Level Page Format

Each page file defines **one page** and uses this structure:

```js
{
  title: string,
  command: string,
  content: { blocks: [...] },

  pesterlog?: { ... },
  meta?: { ... }
}
```

## Required Fields

| Field     | Type   | Description                               |
|-----------|--------|-------------------------------------------|
| `title`   | string | Page title (used for browser tabs)        |
| `command` | string | Command text (e.g. `>YOU: Do the thing.`) |
| `content` | object | Contains ordered render blocks            |

## Optional Fields

| Field       | Description                                       |
|-------------|---------------------------------------------------|
| `pesterlog` | Chatlog data (rendered via block reference)       |
| `meta`      | Metadata used for logs, search, indexing, credits |

## Content Block System

`content.blocks` is an **array**.

Blocks render **in order**.

You can repeat **any block type** as many times as you want.

## Supported Block Types

### 1. Text Block

```js
{
  type: 'text',
  html: [
    'Raw HTML strings',
    '<br>',
    'joined together'
  ]
}
```

- HTML is inserted directly
- Can appear anywhere
- Useful for formatting, spans, italics, etc.

### 2. Media Block

```js
{
  type: 'media',
  items: [ mediaItem, mediaItem ]
}
```

A media block renders one or more media items in order.  
Each item is centered and separated vertically.
<br><br>

**Supported Media Types**

| Type     | Description                                  |
|----------|----------------------------------------------|
| `image`  | Standard `<img>`                             |
| `gif`    | Treated the same as image                    |
| `video`  | HTML5 video (with native or custom controls) |
| `iframe` | Embedded external content                    |

<br>

**Media Attributes**

| Field    | Type     | Description                       |
|----------|----------|-----------------------------------|
| `src`    | `string` | Single video source URL           |
| `class`  | `string` | CSS hook (currently does nothing) |
| `width`  | `number` | Width in pixels                   |
| `height` | `number` | Height in pixels                  |

```js
{
  type: 'image' | 'gif' | 'video' | 'iframe',
  class?: string,
  width?: number,
  height?: number
}
```

### 2.1 Video Media Type

Videos use the HTML5 `<video>` element and support multiple sources.

<br>

**Video Fields**

```js
{
  type: 'video',

  // source options (use one or the other)
  src?: string,
  sources?: [
    {
      src: string,
      type?: string
    }
  ],

  controls?: boolean,
  autoplay?: boolean,
  loop?: boolean,
  muted?: boolean,
  preload?: 'none' | 'metadata' | 'auto',
  poster?: string,

  class?: string,
  width?: number,
  height?: number
}
```
<br>

**Video Specific Attributes**

| Field      | Type                                    | Description                                                |
|------------|-----------------------------------------|------------------------------------------------------------|
| `src`      | `string`                                | Single video source URL                                    |
| `sources`  | `Array<{ src: string, type?: string }>` | Multiple sources for format fallback (`mp4`, `webm`, etc.) |
| `controls` | `boolean`                               | Show native browser controls (default: `true`)             |
| `autoplay` | `boolean`                               | Autoplays a video (usually requires `muted: true`)         |
| `loop`     | `boolean`                               | Loop playback                                              |
| `muted`    | `boolean`                               | Start muted                                                |
| `preload`  | `'none' \| 'metadata' \| 'auto'`        | Video preload behavior (default: `'metadata'`)             |
| `poster`   | `string`                                | Poster image shown before playback                         |
| `width`    | `number`                                | Width in pixels (recommended for layout consistency)       |
| `height`   | `number`                                | Optional fixed height (rarely needed)                      |

> If both `src` and `sources` are provided, `sources` takes priority.

<br>

> [!NOTE]
> ### Hosting files
>If you're hosting on Neocities (especially with free tier), avoid storing large media locally
>
> Consider using external hosts like **https://filegarden.com** when possible

### 3. Spoiler Block

```js
{
  type: 'spoiler',
  button: {
    open: 'OPEN TEXT',
    close: 'CLOSE TEXT'
  },
  children: [ blocks... ]
}
```

- Can contain **any block type**
- Nested spoilers are allowed
- Commonly used for content warnings at the start of an adventure or pesterlogs and such

### 4. Pesterlog Block

```js
{
  type: 'pesterlog'
}
```

- Doesn't do anything other than rendering the first `pesterlog` block present in the .json5 file
- Commonly placed inside spoiler blocks, but not required at all

### 5. Next Page Link

```js
{
  type: 'next',
  page: number,
  label: string
}
```

- Creates a navigation arrow
- Can point to any page
- The `label` parameter usually uses `'==>'` as a string  
- Multiple `next` blocks per page are supported, though not recommended

## Pesterlog Format

Defined only once per page and referenced by `{ type: 'pesterlog' }`.

```js
pesterlog: {
  title: 'PESTERLOG:',
  lines: [ ... ]
}
```

### Supported Line Types

| Type        | Description        |
|-------------|--------------------|
| `system`    | System messages    |
| `chat`      | Character dialogue |
| `narration` | Narrative text     |

### Line Fields

```js
{
  type: 'chat',
  time: '22:41',
  handle: 'username',
  color: '#ff0000',
  text: 'dialogue text (HTML allowed)'
}
```

- `handle` and `color` only apply to `chat`
- `text` may contain inline HTML

## Metadata (`meta`)

Metadata is not rendered directly, but is used for **Adventure Logs** and **Search page indexing**.

```js
meta: {
  chapter: number,
  page: number,
  timestamp: string,
  author?: string,
  notes?: string
}
```

### Common Metadata Fields

| Field       | Description                       |
|-------------|-----------------------------------|
| `chapter`   | Chapter number                    |
| `page`      | Page number                       |
| `timestamp` | Display date (e.g. `Jan 06 2026`) |
| `author`    | Page author(s)                    |
| `notes`     | Internal notes                    |

## Page Indexing

A Node.js tool automatically generates:

```
/assets/pages/index.json5
```

The index contains:

- All chapters
- All page numbers
- Used by search and navigation

*See `TOOLS.md` in `./tools` for how you can update your index after creating new pages*

> [!NOTE]
> ### JSON5 Formatting & Other notes
> JSON5 allows comments, trailing commas, and unquoted keys <br>
> All rendering is data-driven <br>
> Pages can safely be reordered or expanded without breaking old links

