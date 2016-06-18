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
const Menu = require('../src/Menu')
const fsExtra = require('fs-extra')
const Q = require('q')
require('co-mocha')

describe('Menu', function () {
  it('should add a new item to the list', function () {
    const menu = new Menu()
    menu.addChild('Routing', 'routing', ['basics'])
    expect(menu.tree()).deep.equal({basics: [{title: 'Routing', permalink: 'routing', weight: 0}]})
  })

  it('should add multiple items to the menu list', function () {
    const menu = new Menu()
    menu.addChild('Routing', 'routing', ['basics'])
    menu.addChild('Controllers', 'controllers', ['basics'])
    expect(menu.tree()).deep.equal({basics: [{title: 'Routing', permalink: 'routing', weight: 0}, {title: 'Controllers', permalink: 'controllers', weight: 0}]})
  })

  it('should add same child to multiple categories', function () {
    const menu = new Menu()
    menu.addChild('Ioc', 'ioc-container', ['basics', 'fundamentals'])
    expect(menu.tree()).deep.equal({fundamentals: [{title: 'Ioc', permalink: 'ioc-container', weight: 0}], basics: [{title: 'Ioc', permalink: 'ioc-container', weight: 0}]})
  })

  it('should add same childs to root categories when no categories are defined', function () {
    const menu = new Menu()
    menu.addChild('Ioc', 'ioc-container')
    expect(menu.tree()).deep.equal({root: [{title: 'Ioc', permalink: 'ioc-container', weight: 0}]})
  })

  it('should return item using the permalink', function () {
    const menu = new Menu()
    menu.addChild('Ioc', 'ioc-container', ['basics', 'fundamentals'])
    menu.addChild('Routing', 'routing', ['basics'])
    menu.addChild('Controllers', 'controllers', ['basics'])
    const child = menu.getChild('ioc-container')
    expect(child).deep.equal({permalink: 'ioc-container', title: 'Ioc', weight: 0})
    const routes = menu.getChild('routing')
    expect(routes).deep.equal({permalink: 'routing', title: 'Routing', weight: 0})
  })

  it('should return undefined when unable to find item using the permalink', function () {
    const menu = new Menu()
    menu.addChild('Ioc', 'ioc-container', ['basics', 'fundamentals'])
    menu.addChild('Routing', 'routing', ['basics'])
    menu.addChild('Controllers', 'controllers', ['basics'])
    const child = menu.getChild('ioc')
    expect(child).to.equal(undefined)
  })

  it('should return the tree sorted by childs weight', function () {
    const menu = new Menu()
    menu.addChild('Routing', 'routing', ['basics'], 1)
    menu.addChild('Controllers', 'controllers', ['basics'], 0)
    expect(menu.tree()).deep.equal({basics: [{title: 'Controllers', permalink: 'controllers', weight: 0}, {title: 'Routing', permalink: 'routing', weight: 1}]})
  })

  it('should return tree only for the defined categories', function () {
    const menu = new Menu()
    menu.addChild('Routing', 'routing', ['basics'])
    menu.addChild('Controllers', 'controllers', ['basics'])
    menu.addChild('Model', 'model', ['database'])
    expect(menu.tree(['database'])).deep.equal({database: [{title: 'Model', permalink: 'model', weight: 0}]})
  })

  it('should be able to load menu items from a json file', function * () {
    const menu = new Menu(path.join(__dirname, './docs/menu.json'))
    menu.load()
    expect(menu.tree()).deep.equal({basics: [{title: 'Routing', permalink: 'routing', weight: 0}, {title: 'Request', permalink: 'request', weight: 0}]})
  })

  it('should be able to override load path by passing it to the load method', function * () {
    const menu = new Menu('foo/bar/menu.json')
    menu.load(path.join(__dirname, './docs/menu.json'))
    expect(menu.tree()).deep.equal({basics: [{title: 'Routing', permalink: 'routing', weight: 0}, {title: 'Request', permalink: 'request', weight: 0}]})
  })

  it('should write menu items to a file', function * () {
    const menuFilePath = path.join(__dirname, './docs/menu-new.json')
    const menu = new Menu(menuFilePath)
    menu.addChild('Routing', 'routing', ['basics'])
    menu.addChild('Controllers', 'controllers', ['basics'])
    menu.addChild('Model', 'model', ['database'])
    yield menu.write()
    const contents = yield Q.nfcall(fsExtra.readJSON, menuFilePath)
    expect(contents).deep.equal(menu.items)
  })

  it('should return previous child to the permalink', function * () {
    const menu = new Menu()
    const menuTree = {
      basics: [
        {
          permalink: 'introduction'
        },
        {
          permalink: 'routing'
        }
      ]
    }
    const previous = menu.getPreviousChild(menuTree, 'routing')
    expect(previous).deep.equal({permalink: 'introduction'})
  })

  it('should return child from the previous category when permalink is the first child', function * () {
    const menu = new Menu()
    const menuTree = {
      basics: [
        {
          permalink: 'introduction'
        },
        {
          permalink: 'routing'
        }
      ],
      database: [
        {
          permalink: 'database-setup'
        }
      ]
    }
    const previous = menu.getPreviousChild(menuTree, 'database-setup')
    expect(previous).deep.equal({permalink: 'routing'})
  })

  it('should null when first child of the first leaf is passed as permalink', function * () {
    const menu = new Menu()
    const menuTree = {
      basics: [
        {
          permalink: 'introduction'
        },
        {
          permalink: 'routing'
        }
      ],
      database: [
        {
          permalink: 'database-setup'
        }
      ]
    }
    const previous = menu.getPreviousChild(menuTree, 'introduction')
    expect(previous).to.equal(null)
  })

  it('should return next child to the permalink', function * () {
    const menu = new Menu()
    const menuTree = {
      basics: [
        {
          permalink: 'introduction'
        },
        {
          permalink: 'routing'
        }
      ]
    }
    const next = menu.getNextChild(menuTree, 'introduction')
    expect(next).deep.equal({permalink: 'routing'})
  })

  it('should return child from the next category when permalink is the last child', function * () {
    const menu = new Menu()
    const menuTree = {
      basics: [
        {
          permalink: 'introduction'
        },
        {
          permalink: 'routing'
        }
      ],
      database: [
        {
          permalink: 'database-setup'
        }
      ]
    }
    const next = menu.getNextChild(menuTree, 'routing')
    expect(next).deep.equal({permalink: 'database-setup'})
  })

  it('should null when last child of the last leaf is passed as permalink', function * () {
    const menu = new Menu()
    const menuTree = {
      basics: [
        {
          permalink: 'introduction'
        },
        {
          permalink: 'routing'
        }
      ],
      database: [
        {
          permalink: 'database-setup'
        }
      ]
    }
    const next = menu.getNextChild(menuTree, 'database-setup')
    expect(next).to.equal(null)
  })
})
