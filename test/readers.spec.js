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
const FSReader = require('../src/Readers/FS')
const GithubReader = require('../src/Readers/Github')
require('co-mocha')

describe('Readers', function () {
  context('Fs Reader', function () {
    it('should return an array of all markdown files from a given directory', function * () {
      const fsReader = new FSReader(path.join(__dirname, './docs'), ['.md'])
      const docs = yield fsReader.getDocs()
      expect(docs).to.be.an('array')
      expect(docs.length).to.equal(3)
      docs.forEach((doc) => {
        expect(doc.path.endsWith('.md')).to.equal(true)
        expect(doc.contents).to.exist
      })
    })

    it('should be able to define doc extensions for the files to be returned', function * () {
      const fsReader = new FSReader(path.join(__dirname, './docs'), ['.aciidoc'])
      const docs = yield fsReader.getDocs()
      expect(docs).to.be.an('array')
      expect(docs.length).to.equal(0)
    })
  })

  context('Github Reader', function () {
    it('should return an array of all markdown files from a given directory', function * () {
      this.timeout(0)
      const ghReader = new GithubReader('adonisjs/docs', 'develop', '3.0')
      const docs = yield ghReader.getDocs()
      expect(docs).to.be.an('array')
      docs.forEach((doc) => {
        expect(doc.path.endsWith('.md')).to.equal(true)
        expect(doc.contents).to.exist
      })
    })

    it('should be able to read docs recursively from github', function * () {
      this.timeout(0)
      const ghReader = new GithubReader('adonisjs/docs', 'develop', '3.0')
      const docs = yield ghReader.getDocs()
      expect(docs).to.be.an('array')
      const databaseSetup = docs.filter((doc) => doc.path.endsWith('database/database-setup.md'))
      expect(databaseSetup[0]).to.exist
    })

    it('should be able to define doc extensions for the files to be returned', function * () {
      this.timeout(0)
      const ghReader = new GithubReader('adonisjs/docs', 'develop', '3.0', ['.adoc'])
      const docs = yield ghReader.getDocs()
      expect(docs).to.be.an('array')
      expect(docs).length(0)
    })
  })
})
