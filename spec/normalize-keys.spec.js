import { expect } from 'chai'
import sinon from 'sinon'
import changeCase from 'change-case'
import normalize from '../src/normalize-keys'
import { determine } from '../src/helpers'

describe('qstring', () => {
  describe('_convertKey', () => {
    let isFunctionStub
    let camelStub

    beforeEach(() => {
      isFunctionStub = sinon.stub(determine, 'isFunction')
      camelStub = sinon.stub(changeCase, 'camel')
    })

    afterEach(() => {
      isFunctionStub.restore()
      camelStub.restore()
    })

    it('calls convert if it is a function', () => {
      isFunctionStub.returns(true)
      const fakeFunction = () => 'foobar'
      expect(normalize._convertKey('foo', fakeFunction)).to.equal('foobar')
      expect(isFunctionStub.calledOnce).to.equal(true)
    })

    it('calls the correct change-case function if it is a string', () => {
      isFunctionStub.returns(false)
      camelStub.returns('foobar')
      expect(normalize._convertKey('foo', 'camel')).to.equal('foobar')
      expect(isFunctionStub.calledOnce).to.equal(true)
      expect(camelStub.calledOnce).to.equal(true)
    })
  })

  describe('_applyOnArray', () => {
    let applyToKeysStub

    beforeEach(() => {
      applyToKeysStub = sinon.stub(normalize, '_applyToKeys')
    })

    afterEach(() => {
      applyToKeysStub.restore()
    })

    it('calls applyToKeys on each item in an array', () => {
      applyToKeysStub.returns('bar')
      expect(normalize._applyOnArray(['foo', 'foofoo'], 'foobar')).to.deep.equal(['bar', 'bar'])
      expect(applyToKeysStub.calledTwice).to.equal(true)
    })
  })

  describe('_applyOnObject', () => {
    let applyToKeysStub
    let convertKeyStub

    beforeEach(() => {
      applyToKeysStub = sinon.stub(normalize, '_applyToKeys')
      convertKeyStub = sinon.stub(normalize, '_convertKey')
    })

    afterEach(() => {
      applyToKeysStub.restore()
      convertKeyStub.restore()
    })

    it('calls applyToKeys on each key in an object', () => {
      applyToKeysStub.returns('bar')
      convertKeyStub.onFirstCall().returns('foo')
      convertKeyStub.onSecondCall().returns('bar')

      const initialObject = { fo: true, ba: false }
      const expectedObject = { foo: 'bar', bar: 'bar' } // we wouldn't normally change the values

      expect(normalize._applyOnObject(initialObject, 'foobar')).to.deep.equal(expectedObject)
      expect(applyToKeysStub.calledTwice).to.equal(true)
      expect(convertKeyStub.calledTwice).to.equal(true)
    })
  })

  describe('_applyToKeys', () => {
    let sandbox
    let applyOnArrayStub
    let applyOnObjectStub
    let isObjectStub
    let isArrayStub
    let isDateStub

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      applyOnArrayStub = sandbox.stub(normalize, '_applyOnArray').returns('foo')
      applyOnObjectStub = sandbox.stub(normalize, '_applyOnObject').returns('bar')
      isObjectStub = sandbox.stub(determine, 'isObject').returns(true)
      isArrayStub = sandbox.stub(determine, 'isArray').returns(false)
      isDateStub = sandbox.stub(determine, 'isDate').returns(false)
    })

    afterEach(() => {
      sandbox.restore()
    })

    it('calls _applyOnObject when isObject => true && isArray => false (default stubs)', () => {
      const result = normalize._applyToKeys('foodoo', 'bar')
      expect(result).to.equal('bar')
      expect(isObjectStub.calledOnce).to.equal(true)
      expect(applyOnObjectStub.calledOnce).to.equal(true)
      expect(applyOnObjectStub.calledWithExactly('foo', 'bar'))
      expect(applyOnArrayStub.called).to.equal(false)
    })

    it('calls _applyOnArray when isObject => true && isArray => true', () => {
      isArrayStub.returns(true)
      const result = normalize._applyToKeys('foodoo', 'bar')
      expect(result).to.equal('foo')
      expect(applyOnArrayStub.calledOnce).to.equal(true)
      expect(applyOnArrayStub.calledWithExactly('foo', 'bar'))
      expect(applyOnObjectStub.called).to.equal(false)
    })

    it('returns the primitive when input isObject => false && isArray => false', () => {
      isObjectStub.returns(false)
      const result = normalize._applyToKeys('foodoo', 'bar')
      expect(result).to.equal('foodoo')
      expect(applyOnArrayStub.called).to.equal(false)
      expect(applyOnObjectStub.called).to.equal(false)
    })

    it('returns the primitive when input isObject => true && isPrimitive => true', () => {
      isDateStub.returns(true)
      const result = normalize._applyToKeys('foodoo', 'bar')
      expect(result).to.equal('foodoo')
      expect(applyOnArrayStub.called).to.equal(false)
      expect(applyOnObjectStub.called).to.equal(false)
    })
  })

  describe('normalize', () => {
    let applyToKeysStub
    let nextSpy
    let fakeReq

    beforeEach(() => {
      applyToKeysStub = sinon.stub(normalize, '_applyToKeys')
      nextSpy = sinon.spy()
      fakeReq = {}
    })

    afterEach(() => {
      applyToKeysStub.restore()
    })

    it('handles no options being passed', () => {
      applyToKeysStub.returns('bar')
      fakeReq.query = {}
      normalize.normalize()(fakeReq, {}, nextSpy)
      expect(fakeReq.query).to.equal('bar')
      expect(applyToKeysStub.calledOnce).to.equal(true)
      expect(nextSpy.calledOnce).to.equal(true)
    })

    it('handles no options being passed', () => {
      applyToKeysStub.returns('bar')
      fakeReq.query = {}
      normalize.normalize()(fakeReq, {}, nextSpy)
      expect(fakeReq.query).to.equal('bar')
      expect(applyToKeysStub.calledOnce).to.equal(true)
      expect(applyToKeysStub.calledWith({}, 'camel')).to.equal(true)
      expect(nextSpy.calledOnce).to.equal(true)
    })

    it('handles a target being passed', () => {
      applyToKeysStub.returns('bar')
      const fakeOptions = { target: 'foobar' }
      fakeReq.foobar = { foo: 'blah' }
      normalize.normalize(fakeOptions)(fakeReq, {}, nextSpy)
      expect(fakeReq.foobar).to.equal('bar')
      expect(applyToKeysStub.calledOnce).to.equal(true)
      expect(applyToKeysStub.calledWith({ foo: 'blah' }, 'camel')).to.equal(true)
      expect(nextSpy.calledOnce).to.equal(true)
    })

    it('handles a convert being passed', () => {
      applyToKeysStub.returns('bar')
      const fakeOptions = { convert: 'fooCase' }
      fakeReq.query = { foo: 'dah' }
      normalize.normalize(fakeOptions)(fakeReq, {}, nextSpy)
      expect(fakeReq.query).to.equal('bar')
      expect(applyToKeysStub.calledOnce).to.equal(true)
      expect(applyToKeysStub.calledWith({ foo: 'dah' }, 'fooCase')).to.equal(true)
      expect(nextSpy.calledOnce).to.equal(true)
    })

    it('handles a convert && target being passed', () => {
      applyToKeysStub.returns('bar')
      const fakeOptions = { convert: 'fooCase', target: 'normalizeMe' }
      fakeReq.normalizeMe = { foo: 'me' }
      normalize.normalize(fakeOptions)(fakeReq, {}, nextSpy)
      expect(fakeReq.normalizeMe).to.equal('bar')
      expect(applyToKeysStub.calledOnce).to.equal(true)
      expect(applyToKeysStub.calledWith({ foo: 'me' }, 'fooCase')).to.equal(true)
      expect(nextSpy.calledOnce).to.equal(true)
    })
  })

  describe('E2E', () => {
    let fakeReq

    beforeEach(() => {
      fakeReq = {}
    })

    it('normalizes all keys to camelCase', () => {
      const initialObject = {
        'foo-bar': '',
        'FooBar2': ''
      }
      const expectedObject = {
        'fooBar': '',
        'fooBar2': ''
      }

      fakeReq.query = initialObject
      normalize.normalize()(fakeReq, null, () => null)

      expect(fakeReq.query).to.deep.equal(expectedObject)
    })

    it('normalizes all keys to snakeCase', () => {
      const initialObject = {
        'foo-bar': '',
        'FooBar2': ''
      }

      const expectedObject = {
        'foo_bar': '',
        'foo_bar2': ''
      }

      const options = {
        target: 'normKey',
        convert: 'snake'
      }

      fakeReq.normKey = initialObject
      normalize.normalize(options)(fakeReq, null, () => null)

      expect(fakeReq.normKey).to.deep.equal(expectedObject)
    })

    it('handles a custom function being passed in', () => {
      const initialObject = {
        'foo-bar': '',
        'FooBar2': ''
      }

      const expectedObject = {
        'foo-bar!': '',
        'FooBar2!': ''
      }

      const options = {
        target: 'normKey',
        convert: (str) => str + '!'
      }

      fakeReq.normKey = initialObject
      normalize.normalize(options)(fakeReq, null, () => null)

      expect(fakeReq.normKey).to.deep.equal(expectedObject)
    })

    it('handles nested objects', () => {
      const initialObject = {
        'foo-bar': '',
        'FooBar2': {
          'foo_Bar_3': '',
          'FOO-BAR-4': {
            'fooBar5': '',
            'FOO bar 6': ''
          }
        }
      }

      const expectedObject = {
        'fooBar': '',
        'fooBar2': {
          'fooBar_3': '',
          'fooBar_4': {
            'fooBar5': '',
            'fooBar_6': ''
          }
        }
      }

      const options = {
        target: 'normKey',
        convert: 'camel'
      }

      fakeReq.normKey = initialObject
      normalize.normalize(options)(fakeReq, null, () => null)

      expect(fakeReq.normKey).to.deep.equal(expectedObject)
    })

    it('handles arrays & nested arrays of objects', () => {
      const initialObject =
        [
          {
            'foo-bar-1': '',
            '_FOO_bar_two': ''
          }, {
            'fooBar3': ''
          },
          [
            {
              'foo_bar_4': ''
            },
            {
              '1_FOO_BAR_5': ''
            },
            [
              {
                'fooBar6': {
                  'foo_bar_7': /A-Z/
                }
              }
            ]
          ]
        ]

      const expectedObject =
        [
          {
            'fooBar_1': '',
            'fooBarTwo': ''
          }, {
            'fooBar3': ''
          },
          [
            {
              'fooBar_4': ''
            },
            {
              '1FooBar_5': ''
            },
            [
              {
                'fooBar6': {
                  'fooBar_7': /A-Z/
                }
              }
            ]
          ]
        ]

      const options = {
        target: 'normKey',
        convert: 'camel'
      }

      fakeReq.normKey = initialObject
      normalize.normalize(options)(fakeReq, null, () => null)

      expect(fakeReq.normKey).to.deep.equal(expectedObject)
    })

    it('puts normalized object onto a different key when "name" option passed in', () => {
      const initialObject = {
        'foo-bar': '',
        'FooBar2': ''
      }

      const expectedObject = {
        'foo-bar!': '',
        'FooBar2!': ''
      }

      const options = {
        target: 'normKey',
        name: 'newKey',
        convert: (str) => str + '!'
      }

      fakeReq.normKey = initialObject
      normalize.normalize(options)(fakeReq, null, () => null)

      expect(fakeReq.newKey).to.deep.equal(expectedObject)
    })

    it('handles an empty target being passed in', () => {
      const options = {
        target: 'normKey',
        name: 'newKey',
        convert: (str) => str + '!'
      }

      normalize.normalize(options)(fakeReq, null, () => null)

      expect(fakeReq.normKey).to.deep.equal({})
      expect(fakeReq.newKey).to.deep.equal({})
    })
  })

  describe('exports', () => {
    it('exports changeCase functions', () => {
      expect(normalize.changeCase).to.be.an('object')
      expect(normalize.changeCase.camel).to.be.a('function')
      expect(normalize.changeCase.pascal).to.be.a('function')
      expect(normalize.changeCase.snake).to.be.a('function')
    })

    it('exports normalize, which returns a function', () => {
      expect(normalize.normalize).to.be.a('function')
      expect(normalize.normalize()).to.be.a('function')
    })
  })
})
