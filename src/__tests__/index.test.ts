import { diff } from '../index'

it('when diffing primitive types, it should work', () => {
  expect(diff(1, 1)).toHaveLength(0)
  expect(diff(1, 2)).toEqual([{ path: '', type: 'E', left: 1, right: 2 }])
  expect(diff('1', '1')).toHaveLength(0)
  expect(diff('1', '2')).toEqual([
    { path: '', type: 'E', left: '1', right: '2' }
  ])
  expect(diff(true, true)).toHaveLength(0)
  expect(diff(true, false)).toEqual([
    { path: '', type: 'E', left: true, right: false }
  ])
})

it('when diffing object, it should work', () => {
  expect(diff({ a: 1 }, { a: 1 })).toHaveLength(0)
  expect(diff({ a: 1 }, { a: 2 })).toEqual([
    { path: 'a', left: 1, right: 2, type: 'E' }
  ])
  expect(diff({ a: 1 }, { b: 2 })).toEqual([
    { path: 'a', type: 'D', left: 1 },
    { path: 'b', type: 'A', right: 2 }
  ])
  expect(diff({ a: 1 }, undefined)).toEqual([
    { path: '', type: 'D', left: { a: 1 } }
  ])
})

it('when diffing deep object, it should work', () => {
  expect(diff({ a: { b: 1 } }, { a: { b: 1 } })).toHaveLength(0)
  expect(diff({ a: { b: 1 } }, { a: { b: 2 } })).toEqual([
    { path: 'a.b', type: 'E', left: 1, right: 2 }
  ])
  expect(diff({ a: { b: 1 }, c: 2 }, { a: { d: 2 } })).toEqual([
    { path: 'a.b', type: 'D', left: 1 },
    { path: 'a.d', type: 'A', right: 2 },
    { path: 'c', type: 'D', left: 2 }
  ])
})

it('when diffing array with primitive, by default it should order specific', () => {
  expect(diff([1, 2, 3], [1, 2, 3])).toHaveLength(0)
  expect(diff([1, 3, 2], [1, 2, 3])).toEqual([
    { path: '[1]', type: 'E', left: 3, right: 2 },
    { path: '[2]', type: 'E', left: 2, right: 3 }
  ])
  expect(diff([1, 2], [1, 2, 3])).toEqual([
    { path: '[2]', type: 'A', right: 3 }
  ])
})

it('when diffing array with object, by default it should order specific', () => {
  expect(diff([{ a: 1, b: 2 }, { c: 1 }], [{ a: 2, b: 2 }, { d: 1 }])).toEqual([
    { path: '[0].a', type: 'E', left: 1, right: 2 },
    { path: '[1].c', type: 'D', left: 1 },
    { path: '[1].d', type: 'A', right: 1 }
  ])
  expect(diff([{ a: 1 }, { c: 1 }], [{ a: 1 }, { c: 1 }])).toHaveLength(0)
})

it('when diffing array without order specific, it should work', () => {
  expect(
    diff([1, 2], [2, 1], [{ path: '', array: { orderSensitive: false } }])
  ).toHaveLength(0)
  expect(
    diff([1, 2], [2, 1, 3], [{ path: '', array: { orderSensitive: false } }])
  ).toEqual([{ path: '(3)', type: 'A', right: 3 }])
})

it('when diffing array without order censitive, it should ingnore keys undfined', () => {
  expect(
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
    )
  ).toHaveLength(0)
  expect(
    diff(
      [{ id: 1 }, { id: 2 }],
      [{ id: 1 }, { id: 2 }, { noid: 3 }],
      [{ path: '', array: { orderSensitive: false, getKey: x => x.id } }]
    )
  ).toHaveLength(0)
})

it('when diffing array without order specific, it should ingnore keys undfined if it is configured', () => {
  expect(
    diff(
      [{ id: 1 }, { id: 2 }, { noid: 3 }],
      [{ id: 1 }, { id: 2 }],
      [
        {
          path: '',
          array: {
            orderSensitive: false,
            getKey: x => (x.id ? x.id.toString() : undefined),
            ignoreUndefinedKey: false
          }
        }
      ]
    )
  ).toEqual([{ path: '(undefined)', type: 'D', left: { noid: 3 } }])
  expect(
    diff(
      [{ id: 1 }, { id: 2 }],
      [{ id: 1 }, { id: 2 }, { noid: 3 }],
      [
        {
          path: '',
          array: {
            orderSensitive: false,
            ignoreUndefinedKey: false,
            getKey: x => (x.id ? x.id.toString() : undefined)
          }
        }
      ]
    )
  ).toEqual([{ path: '(undefined)', type: 'A', right: { noid: 3 } }])
})

it('should ignore diff certain path when set ignore to certain path', () => {
  expect(
    diff({ a: 1, b: 2 }, { a: 1, b: 3 }, [{ path: 'b', ignore: true }])
  ).toHaveLength(0)
})

it('when compare complex ones, it should work', () => {
  const a = {
    type: 'a',
    items: [
      { price: 80, name: 'sto', fullPrice: 100 },
      { price: 550, billing: { type: 'payable' }, name: 'pro' }
    ]
  }
  const b = {
    type: 'b',
    items: [
      { price: 90, name: 'sto' },
      { price: 550, name: 'pro', billing: { type: 'credit' }, level: 'D' }
    ]
  }
  expect(
    diff(a, b, [
      {
        path: 'items',
        array: { orderSensitive: false, getKey: item => item.name }
      }
    ])
  ).toEqual([
    { path: 'type', type: 'E', left: 'a', right: 'b' },
    { path: 'items(sto).price', type: 'E', left: 80, right: 90 },
    { path: 'items(sto).fullPrice', type: 'D', left: 100 },
    {
      path: 'items(pro).billing.type',
      type: 'E',
      left: 'payable',
      right: 'credit'
    },
    { path: 'items(pro).level', type: 'A', right: 'D' }
  ])
})
