'use strict'

/**
 * docketjs
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const chai = require('chai')
const expect = chai.expect
const path = require('path')
const fs = require('fs')
const cheerio = require('cheerio')
const Markdown = require('../src/Markdown')

describe('Markdown', function () {
  it('should render a markdown file to html', function () {
    const md = new Markdown()
    const mdFile = path.join(__dirname, './docs/abc.md')
    const doc = md.convert(fs.readFileSync(mdFile, 'utf-8'))
    expect(doc).to.have.property('html')
    expect(doc).to.have.property('meta')
  })

  it('should replace toc placeholder within the html', function () {
    const md = new Markdown()
    const mdFile = path.join(__dirname, './docs/toc.md')
    const doc = md.convert(fs.readFileSync(mdFile, 'utf-8'))
    const $ = cheerio.load(doc.html)
    expect($('ul li').length).to.equal(2)
    expect($('ul li').eq(0).find('a').attr('href')).to.equal('#hello-world')
    expect($('ul li').eq(1).find('a').attr('href')).to.equal('#another-one')
  })
})
