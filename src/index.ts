import {
  Diff,
  Option,
  GetKey,
  Value,
  DiffResult,
  DiffResultTypeEnum
} from './types'
export const diff: Diff = (left, right, options = [], currentPath = '') => {
  options = options.map(x => ({ ...defaultOption, ...x }))
  const option = getOption(options, currentPath)
  if (option.ignore) {
    return []
  }
  if (isUndefined(left) && isUndefined(right)) {
    return []
  }
  if (isUndefined(left)) {
    return [{ path: currentPath, type: DiffResultTypeEnum.Added, right }]
  }
  if (isUndefined(right)) {
    return [{ path: currentPath, type: DiffResultTypeEnum.Deleted, left }]
  }
  if (isPrimitiveType(left)) {
    return left === right
      ? []
      : [{ path: currentPath, type: DiffResultTypeEnum.Editted, left, right }]
  }
  if (isObject(left)) {
    right = right || {}
    const aKeys = Object.keys(left)
    const keysOnlyBHas = Object.keys(right).filter(key => !aKeys.includes(key))
    const mismatches = aKeys.reduce<DiffResult[]>(
      (prev, key) => [
        ...prev,
        ...diff(left[key], right[key], options, createPath(currentPath, key))
      ],
      []
    )
    const missings = keysOnlyBHas.reduce<DiffResult[]>(
      (prev, key) => [
        ...prev,
        ...diff(left[key], right[key], options, createPath(currentPath, key))
      ],
      []
    )

    return [...mismatches, ...missings]
  }
  if (isArray(left)) {
    right = right || []
    const {
      array: { getKey = (x: any) => x, orderSensitive } = defaultArrayOption
    } = {
      ...defaultOption,
      ...(option || {})
    }

    return orderSensitive
      ? diffArrayWithOrder(left, right)
      : diffArrayWithoutOrder(left, right, getKey)
  }
  return []

  function diffArrayWithoutOrder(x1: any[], x2: any[], getKeyFn: GetKey) {
    const aKeys = x1.map(getKeyFn).filter(x => !isUndefined(x))
    const keysOnlyBHas = x2
      .map(getKeyFn)
      .filter(key => !aKeys.includes(key))
      .filter(x => !isUndefined(x))

    const findByKey = (array: any[], key: string): DiffResult[] =>
      array.find(item => getKeyFn(item) === key)
    const mismatches = aKeys.reduce<DiffResult[]>(
      (prev, key) => [
        ...prev,
        ...diff(
          findByKey(x1, key),
          findByKey(x2, key),
          options,
          createPathToNonOrderedArray(currentPath, key)
        )
      ],
      []
    )
    const missings = keysOnlyBHas.reduce<DiffResult[]>(
      (prev, key) => [
        ...prev,
        ...diff(
          findByKey(x1, key),
          findByKey(x2, key),
          options,
          createPathToNonOrderedArray(currentPath, key)
        )
      ],
      []
    )
    return [...mismatches, ...missings]
  }

  function diffArrayWithOrder(x1: any[], x2: any[]) {
    const maxLength = Math.max(x1.length, x2.length)
    return range(maxLength).reduce<DiffResult[]>(
      (prev, index) => [
        ...prev,
        ...diff(
          x1[index],
          x2[index],
          options,
          createPathToOrderedArray(currentPath, index)
        )
      ],
      []
    )
  }
}
const defaultArrayOption = { getKey: (x: any) => x, orderSensitive: true }
const defaultOption: Option = {
  path: '',
  ignore: false
}

const isUndefined = (x: any) => typeof x === 'undefined'
const isPrimitiveType = (x: any) =>
  ['string', 'number', 'boolean'].includes(typeof x)
const isArray = (x: any) => Array.isArray(x)
const isObject = (x: any) => typeof x === 'object' && !isArray(x)
const createPath = (currentLoc: string, name: string): string =>
  !currentLoc ? name : `${currentLoc}.${name}`
const createPathToOrderedArray = (currentLoc: string, index: number): string =>
  `${currentLoc}[${index}]`
const createPathToNonOrderedArray = (currentLoc: string, key: string): string =>
  `${currentLoc}(${key})`
const range = (max: number) => Array.from(Array(max).keys())
const getOption = (options: Option[] = [], loc: string): Option => {
  const filterMatched = ({ path }: Option) => {
    if (typeof path === 'string') {
      return loc === path
    }
    if (path instanceof RegExp) {
      return path.test(loc)
    }
    return false
  }
  return options
    .filter(filterMatched)
    .reduce(
      (aggr, { path, ...option }) => ({ ...aggr, ...option }),
      defaultOption
    )
}
