import { suite, test } from 'node:test'

import {
  extractTextFromHtml,
  isHtmlString,
  slugify,
  slugifyAddress,
  splitAddress,
  toCamelCase,
  toTitleCase,
  trimKeyPrefix,
  truncateByWord,
} from './string.mjs'

suite('string', () => {
  suite('toTitleCase', () => {
    test('should convert camelCase to title case', ({ assert }) => {
      const result = toTitleCase('helloWorld')
      assert.strictEqual(result, 'Hello World')
    })

    test('should convert PascalCase to title case', ({ assert }) => {
      const result = toTitleCase('HelloWorld')
      assert.strictEqual(result, 'Hello World')
    })

    test('should handle single word', ({ assert }) => {
      const result = toTitleCase('hello')
      assert.strictEqual(result, 'Hello')
    })

    test('should return non-string values as is', ({ assert }) => {
      assert.strictEqual(toTitleCase(123), 123)
      assert.strictEqual(toTitleCase(null), null)
      assert.strictEqual(toTitleCase(undefined), undefined)
    })

    test('should return strings with spaces as is', ({ assert }) => {
      const result = toTitleCase('hello world')
      assert.strictEqual(result, 'hello world')
    })
  })

  suite('toCamelCase', () => {
    test('should convert kebab-case to camelCase', ({ assert }) => {
      const result = toCamelCase('hello-world')
      assert.strictEqual(result, 'helloWorld')
    })

    test('should convert snake_case to camelCase', ({ assert }) => {
      const result = toCamelCase('hello_world')
      assert.strictEqual(result, 'helloWorld')
    })

    test('should handle mixed separators', ({ assert }) => {
      const result = toCamelCase('hello-world_test')
      assert.strictEqual(result, 'helloWorldTest')
    })

    test('should remove spaces and convert to camelCase', ({ assert }) => {
      const result = toCamelCase('hello world test')
      assert.strictEqual(result, 'helloworldtest')
    })

    test('should handle already camelCase strings', ({ assert }) => {
      const result = toCamelCase('helloWorld')
      assert.strictEqual(result, 'helloWorld')
    })

    test('should lowercase first character', ({ assert }) => {
      const result = toCamelCase('Hello-World')
      assert.strictEqual(result, 'helloWorld')
    })
  })

  suite('slugify', () => {
    test('should convert string to slug with default separator', ({ assert }) => {
      const result = slugify('Hello World')
      assert.strictEqual(result, 'hello-world')
    })

    test('should convert string to slug with custom separator', ({ assert }) => {
      const result = slugify('Hello World', '_')
      assert.strictEqual(result, 'hello_world')
    })

    test('should remove accents', ({ assert }) => {
      const result = slugify('Héllo Wörld')
      assert.strictEqual(result, 'hello-world')
    })

    test('should remove special characters', ({ assert }) => {
      const result = slugify('Hello@World!')
      assert.strictEqual(result, 'helloworld')
    })

    test('should trim whitespace', ({ assert }) => {
      const result = slugify('  Hello World  ')
      assert.strictEqual(result, 'hello-world')
    })

    test('should handle numbers', ({ assert }) => {
      const result = slugify('Test 123 456')
      assert.strictEqual(result, 'test-123-456')
    })

    test('should handle multiple spaces', ({ assert }) => {
      const result = slugify('Hello    World')
      assert.strictEqual(result, 'hello-world')
    })
  })

  suite('splitAddress', () => {
    test('should split dot notation', ({ assert }) => {
      const result = splitAddress('a.b.c')
      assert.deepStrictEqual(result, ['a', 'b', 'c'])
    })

    test('should split bracket notation', ({ assert }) => {
      const result = splitAddress('a[b][c]')
      assert.deepStrictEqual(result, ['a', 'b', 'c'])
    })

    test('should split mixed notation', ({ assert }) => {
      const result = splitAddress('a.b[c].d')
      assert.deepStrictEqual(result, ['a', 'b', 'c', 'd'])
    })

    test('should return array as is', ({ assert }) => {
      const arr = ['a', 'b', 'c']
      const result = splitAddress(arr)
      assert.strictEqual(result, arr)
    })

    test('should handle single segment', ({ assert }) => {
      const result = splitAddress('a')
      assert.deepStrictEqual(result, ['a'])
    })

    test('should filter out empty segments', ({ assert }) => {
      const result = splitAddress('a..b')
      assert.deepStrictEqual(result, ['a', 'b'])
    })
  })

  suite('slugifyAddress', () => {
    test('should slugify address with default separator', ({ assert }) => {
      const result = slugifyAddress('a.b.c')
      assert.strictEqual(result, 'a-b-c')
    })

    test('should slugify address with custom separator', ({ assert }) => {
      const result = slugifyAddress('a.b[c]', '_')
      assert.strictEqual(result, 'a_b_c')
    })

    test('should handle bracket notation', ({ assert }) => {
      const result = slugifyAddress('a[b][c]')
      assert.strictEqual(result, 'a-b-c')
    })
  })

  suite('isHtmlString', () => {
    test('should return true for valid HTML string', ({ assert }) => {
      const result = isHtmlString('<div>Hello World</div>')
      assert.strictEqual(result, true)
    })

    test('should return true for complex HTML', ({ assert }) => {
      const result = isHtmlString('<div class="test">Hello <span>World</span></div>')
      assert.strictEqual(result, true)
    })

    test('should return false for non-HTML string', ({ assert }) => {
      const result = isHtmlString('Hello World')
      assert.strictEqual(result, false)
    })

    test('should return false for partial HTML', ({ assert }) => {
      const result = isHtmlString('<div>Hello')
      assert.strictEqual(result, false)
    })

    test('should return false for empty string', ({ assert }) => {
      const result = isHtmlString('')
      assert.strictEqual(result, false)
    })
  })

  suite('extractTextFromHtml', () => {
    test('should extract text from simple HTML', ({ assert }) => {
      const result = extractTextFromHtml('<div>Hello World</div>')
      assert.strictEqual(result, 'Hello World')
    })

    test('should extract text from nested HTML', ({ assert }) => {
      const result = extractTextFromHtml('<div>Hello <span>World</span></div>')
      assert.strictEqual(result, 'Hello World')
    })

    test('should handle multiple elements', ({ assert }) => {
      const result = extractTextFromHtml('<p>First</p><p>Second</p>')
      assert.strictEqual(result, 'FirstSecond')
    })

    test('should handle empty HTML', ({ assert }) => {
      const result = extractTextFromHtml('<div></div>')
      assert.strictEqual(result, '')
    })
  })

  suite('truncateByWord', () => {
    test('should not truncate if string is shorter than maxLength', ({ assert }) => {
      const result = truncateByWord('Hello', 10)
      assert.strictEqual(result, 'Hello')
    })

    test('should truncate at word boundary', ({ assert }) => {
      const result = truncateByWord('Hello World Test', 12)
      assert.strictEqual(result, 'Hello World…')
    })

    test('should use custom tail', ({ assert }) => {
      const result = truncateByWord('Hello World Test', 12, '...')
      assert.strictEqual(result, 'Hello World...')
    })

    test('should truncate without tail when tail is empty', ({ assert }) => {
      const result = truncateByWord('Hello World Test', 12, '')
      assert.strictEqual(result, 'Hello World')
    })

    test('should truncate even if no space found', ({ assert }) => {
      const result = truncateByWord('HelloWorldTest', 8)
      assert.strictEqual(result, 'HelloWor…')
    })

    test('should handle maxLength equal to string length', ({ assert }) => {
      const result = truncateByWord('Hello', 5)
      assert.strictEqual(result, 'Hello')
    })
  })

  suite('trimKeyPrefix', () => {
    test('should remove attrs prefix', ({ assert }) => {
      const result = trimKeyPrefix('attrs.name')
      assert.strictEqual(result, 'name')
    })

    test('should remove meta prefix', ({ assert }) => {
      const result = trimKeyPrefix('meta.title')
      assert.strictEqual(result, 'title')
    })

    test('should remove options prefix', ({ assert }) => {
      const result = trimKeyPrefix('options.value')
      assert.strictEqual(result, 'value')
    })

    test('should not modify string without prefix', ({ assert }) => {
      const result = trimKeyPrefix('name')
      assert.strictEqual(result, 'name')
    })

    test('should handle multiple prefixes', ({ assert }) => {
      const result = trimKeyPrefix('attrs.meta.name')
      assert.strictEqual(result, 'meta.name')
    })
  })
})
