/*
 * Copyright (c) 2018 Linagora.
 *
 * This file is part of Linto-Utility
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */


var assert = require("assert")
const ParserNlu = new require('../lib/parser/nluParser')
const parser = new ParserNlu()

const appName = 'linto'
const filePath = process.cwd() + '/test/data/parser.md'

describe('parser nlu', () => {
  it('it should contains the default structure data after a parse', async function () {
    await parser.process(appName, filePath)
      .then((dataParsed) => {
        assert.ok(dataParsed)
        assert.equal(dataParsed.applicationName, 'app:' + appName)
        assert.equal(dataParsed.sentences.length, 14)
        assert.ok(dataParsed.sentences[0].intent)
        assert.ok(dataParsed.sentences[0].entities)
        assert.ok(dataParsed.sentences[0].language)
        assert.ok(dataParsed.sentences[0].text)
        assert.ok(dataParsed.sentences[0].origin)
      })
  })

  it('it should contains these first data after parsing data/parser.md', async function () {
    await parser.process(appName, filePath)
      .then((dataParsed) => {
        assert.equal(dataParsed.sentences[0].intent, 'app:testNameIntent')
        assert.equal(dataParsed.sentences[0].language, 'en')
        assert.equal(dataParsed.sentences[0].text, 'here is my first input acronyme1')
        assert.equal(dataParsed.sentences[0].origin, 'here is my first input [acronyme1](acronyme)')
      })
  })

  it('it should contains these last data after parsing data/parser.md', async function () {
    await parser.process(appName, filePath)
      .then((dataParsed) => {
        let lastIndex = dataParsed.sentences.length -1

        assert.equal(dataParsed.sentences[lastIndex].intent, 'app:testNameIntent')
        assert.equal(dataParsed.sentences[lastIndex].language, 'fr')
        assert.equal(dataParsed.sentences[lastIndex].text, 'suivit du dernier acronymeEntitie2')
        assert.equal(dataParsed.sentences[lastIndex].origin, 'suivit du dernier [acronymeEntitie2](acronyme)')
      })
  })

  it('it should throw an error when file is not found', async function () {
    assert.throws(() => parser.process(appName, 'fake/path'))
    assert.throws(() => parser.process(appName, undefined))
    assert.throws(() => parser.process(undefined, filePath))
    assert.throws(() => parser.process(undefined, 'fake/path'))
  })
})