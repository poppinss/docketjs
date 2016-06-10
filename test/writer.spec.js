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
const FSWriter = require('../src/Writers/FS')
const fsExtra = require('fs-extra')
const Q = require('q')
require('co-mocha')

describe('Writers', function () {
  before(function * () {
    yield Q.nfcall(fsExtra.ensureDir, path.join(__dirname, './html'))
  })

  after(function * () {
    yield Q.nfcall(fsExtra.emptyDir, path.join(__dirname, './html'))
  })

  context('Fs Writer', function () {
    it('should write doc file to a given destination', function * () {
      const fsWriter = new FSWriter(path.join(__dirname, './html'))
      yield fsWriter.writeDoc('hello.html', '<h2> Hello world </h2>')
      const helloHtmlFile = yield Q.nfcall(fsExtra.readFile, path.join(__dirname, './html/hello.html'), 'utf-8')
      expect(helloHtmlFile.trim()).to.equal('<h2> Hello world </h2>')
    })
  })
})
