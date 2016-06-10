'use strict'

/**
 * docketjs
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

module.exports = {
  FSReader: require('./src/Readers/FS'),
  GithubReader: require('./src/Readers/Github'),
  Menu: require('./src/Menu'),
  FSWriter: require('./src/Writers/FS'),
  Markdown: require('./src/Markdown'),
  Manager: require('./src/Manager')
}
