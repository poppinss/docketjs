# Docket Js

[![Version](https://img.shields.io/npm/v/docketjs.svg?style=flat-square)](https://www.npmjs.com/package/docketjs)
[![Build Status](https://img.shields.io/travis/poppinss/docketjs/master.svg?style=flat-square)](https://travis-ci.org/poppinss/docketjs)
[![Coverage Status](https://img.shields.io/coveralls/poppinss/docketjs/master.svg?style=flat-square)](https://coveralls.io/github/poppinss/docketjs?branch=master)
[![License](https://img.shields.io/npm/l/docketjs.svg?style=flat-square)](https://opensource.org/licenses/MIT)

DocketJs is a battery included Markdown to HTML converter for Node.js. 
It has everything you need to successfully convert a bunch of markdown files to HTML and generate toc and a menu file.


## Features

1. Support GFM Syntax.
2. Parses Front matter
3. Generates a menu JSON file to be used for showing up the menu in HTML.
4. Generates TOC for each markdown document.
5. Markdown readers to read files from Github and local disk.
6. Writer to write files to disk.

## Basic Example

```javascript
const Docket = require('docketjs')
const path = require('path')
const reader = new Docket.FSReader(path.join(__dirname, 'docs/markdown'))
const menu = new Docket.Menu(path.join(__dirname, 'docs/menu.json'))
const writer = new Docket.FSWriter(path.join(__dirname, 'docs/html'))
const markdown = new Docket.Markdown()

new Docket.Manager(reader, markdown, writer, menu)
  .convert()
  .then(() => {
    console.log('All went good')
  })
  .catch(console.error)
```

## Listening For Events

Also you can listen for different events to track the progress of converting markdown documents to HTML.

```javascript
const docket = new Docket.Manager(reader, markdown, writer, menu)

docket.on('converting', (docPath) => {
  console.log(`converting ${docPath}`)
})
docket.on('converted', (docPath) => {
  console.log(`converted ${docPath}`)
})
docket.on('writing', (doc) => {
  console.log(`writing ${doc.meta.permalink}`)
})

docket
  .convert()
  .then(() => {
    console.log('All went good')
  })
  .catch(console.error)
```


## Standards For YAML Front Matter

YAML front matter helps you in defining setting for a markdown document. DocketJs makes use of it to build the menu tree for you and you are required to follow some rules when defining front matter.

```markdown
---
title: Adonis 101
permalink: adonis-101
weight: 0
categories:
  - basics
---

And here goes your markdown document
```

| key | Required | Default Value | Description |
|-----|----------|---------------|-------------|
| title | Yes | null | Document title |
| permalink | Yes | null | Document url and html file name|
| weight | No | 0 | Weight defines the position of a document inside the menu tree |
| categories | No | ['root'] | Array of categories a doc belongs to |

## Components

DocketJs is divided into multiple classes to keep all the concerns seperated. You can also add your own implementations of these components.


#### Readers

`Readers` are used to read markdown files and return them as an array. DocketJs has two in-built readers:

1. Read files from a folder on your computer.
2. Read files from Github using Github v3 API.

#### Markdown Parser

Markdown parser makes use of [marked](https://github.com/chjj/marked) to parse the markdown documents to HTML and at the same time and parses a lot of other information for your markdown documents.

1. Parses YAML front matter using [gray matter](https://www.npmjs.com/package/gray-matter).
2. Auto generate TOC for each markdown document.
3. Parse markdown to HTML with GFM support.


#### Menu Builder

Menu builder generates a menu tree of all the documents. Menu builder is dependent upon YAML front matter to read the `permalink`, `title` and `weight` of the document.

`weight` defines the position of a document link inside a the menu. It is really helpful to keep menu items organized.

#### Writers

`Writers` are opposite of `Readers` and they write all the Markdown to HTML converted documents back to local folder.


## Menu Service

Menu service can also be used to load a file from disk and then perform operations like, **get tree to display in HTML**, or **get a document meta for a given permalink**

```javascript
const Menu = require('docketjs').Menu
const path = require('path')
const menu = new Menu()

menu.load('menu.json') // loading previously save file

console.log(menu.tree())
```

#### tree([categories])

Returns menu tree with all childs sorted according to their weight. Optionally you can also pass an array of categories to be used for sorting categories.

```javascript
menu.load('menu.json')
const tree = menu.tree()
```

#### getChild(permalink)

Returns child for a given `permalink`

```javascript
menu.load('menu.json')
const routing = menu.getChild('routing')
/**
  {
    title: 'Routing',
    permalink: 'routing',
    weight: 0
  }
 */
```


## Github Reader

Just like `FSReader` you can make use of `GithubReader` to read the documents from a Github repo.

```javascript
const reader = new Docket.GithubReader('adonisjs/docs', 'master', '3.0')
```

Next you need to pass this reader to the Docket Manager and it will fetch the docs for you.

Optionally it can make use of **Github Token** to make an authenticated request, which has better rate limits.

```javascript
process.env.GH_TOKEN = '<your github token>'
const reader = new Docket.GithubReader('adonisjs/docs', 'master', '3.0')
```
