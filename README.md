# Diff javascript [![Build Status](https://travis-ci.org/ron-liu/deep-diff-obj.svg?branch=master)](https://travis-ci.org/ron-liu/deep-diff-obj) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Why I another library to diff object

I knew there are already many libraries dealing with comparing two objects, like the below.

However, none of them support compare arrays with order insensitive, like `[1, 2]` and `[2, 1]` should be equal if we want to compare them with order insensitive.

Also this package support the following features other libraries didn't support like:

- certain path level configuration
- path level configuration with regex supported
- support arrays with order insensitive
- wrote in typescript

## How to use it

### Installation

`npm i deep-diff-obj`

### Usage

```typescript
type diff = (
  left: Value,
  right: Value,
  options?: Option[],
  currentPath?: string
) => DiffResult[]

type Option = {
  path: string | RegExp
  ignore?: boolean
  array?: ArrayOptions
}

type DiffResult =
  | {
      type: DiffResultTypeEnum.Added
      path: string
      right: Value
    }
  | { type: DiffResultTypeEnum.Deleted; path: string; left: Value }
  | {
      type: DiffResultTypeEnum.Editted
      path: string
      left: Value
      right: Value
    }

enum DiffResultTypeEnum {
  Editted = 'E',
  Added = 'A',
  Deleted = 'D'
}
```

- compare two primitives

```typescript
import { diff } from 'deep-diff-obj'
diff(1, 2) // [{ path: '', type: 'E', left: 1, right: 2 }]
```

- compare two simple objects

```typescript
import { diff } from 'deep-diff-obj'
diff({ a: 1 }, { a: 2 }) // [{ path: 'a', left: 1, right: 2, type: 'E' }]
```

- compare two arrays (order sensitive)

```typescript
diff([1, 2], [1, 2, 3]) // [ { path: '[2]', type: 'A', right: 3 } ]
```

-- compare two array (order insensitive)

```typescript
diff([1, 2], [2, 1], [{ path: '', array: { orderSensitive: false } }]) // []
diff([1, 2], [2, 1, 3], [{ path: '', array: { orderSensitive: false } }]) // [{ path: '(3)', type: 'A', right: 3 }]
```

> If diff array with order insensitive, the path is the key surrounded by `()`

- compare two object array: order insensitive, ignore undefined key (by default)

```typescript
diff(
  [{ id: 1 }, { id: 2 }, { noid: 3 }],
  [{ id: 1 }, { id: 2 }],
  [
    {
      path: '',
      array: {
        getKey: x => (x.id ? x.id.toString() : undefined),
        orderSensitive: false
      }
    }
  ]
) // []
```

- compare two object array: order insensitive, ignore undefined key

```typescript
diff(
  [{ id: 1 }, { id: 2 }, { noid: 3 }],
  [{ id: 1 }, { id: 2 }],
  [
    {
      path: '',
      array: {
        getKey: x => (x.id ? x.id.toString() : undefined),
        orderSensitive: false,
        ignoreUndefinedKey: false
      }
    }
  ]
) // [{ path: '(undefined)', type: 'D', left: { noid: 3 } }]
```

- ignore certain path

```typescript
diff({ a: 1, b: 2 }, { a: 1, b: 3 }, [{ path: 'b', ignore: true }]) // []
```

- ignore certain path by regex

```typescript
diff({ a: 1, b1: 2, b2: 3 }, { a: 1, b1: 3, b2: 4 }, [
  { path: /^b/, ignore: true }
]) // []
```

> See more examples in the [unit tests](./src/__tests__/index.test.ts)

## Plans

- [x] setup project
  - [x] setup semantic-release
  - [x] setup npm package
  - [x] setup travis ci

## Logs

- 20/11 2h
- 21/11 10m
- 22/11 20m
- 23/11 2h
- 26/11 2h

```

```
