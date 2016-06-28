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
    const child = {title: 'Routing', permalink: 'routing', categories: ['basics']}
    menu.addChild(child)
    expect(menu.tree()).deep.equal({basics: [child]})
  })

  it('should add multiple items to the menu list', function () {
    const menu = new Menu()
    const child1 = {title: 'Routing', permalink: 'routing', categories: ['basics']}
    const child2 = {title: 'Controllers', permalink: 'controllers', categories: ['basics']}
    menu.addChild(child1)
    menu.addChild(child2)
    expect(menu.tree()).deep.equal({basics: [child1, child2]})
  })

  it('should add same child to multiple categories', function () {
    const menu = new Menu()
    const child = {title: 'Ioc', permalink: 'ioc-container', categories: ['basics', 'fundamentals']}
    menu.addChild(child)
    expect(menu.tree()).deep.equal({fundamentals: [child], basics: [child]})
  })

  it('should add same childs to root categories when no categories are defined', function () {
    const menu = new Menu()
    const child = {title: 'Ioc', permalink: 'ioc-container'}
    menu.addChild(child)
    expect(menu.tree()).deep.equal({root: [child]})
  })

  it('should return item using the permalink', function () {
    const menu = new Menu()
    const child1 = {title: 'Ioc', permalink: 'ioc-container', categories: ['basics', 'fundamentals']}
    const child2 = {title: 'Routing', permalink: 'routing', categories: ['basics']}
    const child3 = {title: 'Controllers', permalink: 'controllers', categories: ['basics']}
    menu.addChild(child1)
    menu.addChild(child2)
    menu.addChild(child3)
    const ioc = menu.getChild('ioc-container')
    expect(ioc).deep.equal(child1)
    const routes = menu.getChild('routing')
    expect(routes).deep.equal(child2)
  })

  it('should return undefined when unable to find item using the permalink', function () {
    const menu = new Menu()
    const child = {title: 'Ioc', permalink: 'ioc-container', categories: ['basics', 'fundamentals']}
    menu.addChild(child)
    const ioc = menu.getChild('ioc')
    expect(ioc).to.equal(undefined)
  })

  it('should return the tree sorted by childs weight', function () {
    const menu = new Menu()
    const child1 = {title: 'Routing', permalink: 'routing', categories: ['basics'], weight: 1}
    const child2 = {title: 'Controllers', permalink: 'controllers', categories: ['basics'], weight: 0}
    menu.addChild(child1)
    menu.addChild(child2)
    expect(menu.tree()).deep.equal({basics: [child2, child1]})
  })

  it('should return tree only for the defined categories', function () {
    const menu = new Menu()
    const child1 = {title: 'Routing', permalink: 'routing', categories: ['basics']}
    const child2 = {title: 'Controllers', permalink: 'controllers', categories: ['basics']}
    const child3 = {title: 'Model', permalink: 'model', categories: ['database']}
    menu.addChild(child1)
    menu.addChild(child2)
    menu.addChild(child3)
    expect(menu.tree(['database'])).deep.equal({database: [child3]})
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
    const child1 = {title: 'Routing', permalink: 'routing', categories: ['basics']}
    const child2 = {title: 'Controllers', permalink: 'controllers', categories: ['basics']}
    const child3 = {title: 'Model', permalink: 'model', categories: ['database']}
    menu.addChild(child1)
    menu.addChild(child2)
    menu.addChild(child3)
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
