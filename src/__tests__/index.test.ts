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

// type Value = { id: number }
// it('when diffing array without order specific, it should ingnore keys undfined', () => {
//   expect(
//     diff(
//       [{ id: 1 }, { id: 2 }, { noid: 3 }] as Value[],
//       [{ id: 1 }, { id: 2 }] as Value[],
//       [
//         {
//           path: '',
//           array: {
//             getKey: (x: Value): string => x.id.toString(),
//             orderSensitive: false
//           }
//         }
//       ]
//     )
//   ).toHaveLength(0)
//   expect(
//     diff(
//       [{ id: 1 }, { id: 2 }],
//       [{ id: 1 }, { id: 2 }, { noid: 3 }],
//       [['', { byOrder: false, getKey: x => x.id }]]
//     )
//   ).toHaveLength(0)
// })

// it('when diffing array without order specific, it should ingnore keys undfined if it is configured', () => {
//   expect(
//     diff(
//       [{ id: 1 }, { id: 2 }, { noid: 3 }] as Value[],
//       [{ id: 1 }, { id: 2 }] as Value[],
//       [
//         {
//           path: '',
//           array: {
//             orderSensitive: false,
//             getKey: (x: Value) => x.id.toString()
//           }
//         }
//       ]
//     )
//   ).toEqual([['(undefined)', { noid: 3 }, undefined]])
//   expect(
//     diff(
//       [{ id: 1 }, { id: 2 }],
//       [{ id: 1 }, { id: 2 }, { noid: 3 }],
//       [['', { byOrder: false, getKey: x => x.id, ignoreKeyUndefined: false }]]
//     )
//   ).toEqual([['(undefined)', undefined, { noid: 3 }]])
// })

// it('when passing in ignore, it should ignre diff certain path', () => {
//   expect(
//     diff({ a: 1, b: 2 }, { a: 1, b: 3 }, [['b', { ignore: true }]])
//   ).toHaveLength(0)
// })

// it('when diffing array without order specific, it should ingnore keys undfined', () => {
//   expect(
//     diff(
//       [{ id: 1 }, { id: 2 }, { noid: 3 }],
//       [{ id: 1 }, { id: 2 }],
//       [['', { byOrder: false, getKey: x => x.id }]]
//     )
//   ).toHaveLength(0)
//   expect(
//     diff(
//       [{ id: 1 }, { id: 2 }],
//       [{ id: 1 }, { id: 2 }, { noid: 3 }],
//       [['', { byOrder: false, getKey: x => x.id }]]
//     )
//   ).toHaveLength(0)
// })

// it('when diffing array without order specific, it should ingnore keys undfined if it is configured', () => {
//   expect(
//     diff(
//       [{ id: 1 }, { id: 2 }, { noid: 3 }],
//       [{ id: 1 }, { id: 2 }],
//       [['', { byOrder: false, getKey: x => x.id, ignoreKeyUndefined: false }]]
//     )
//   ).toEqual([['(undefined)', { noid: 3 }, undefined]])
//   expect(
//     diff(
//       [{ id: 1 }, { id: 2 }],
//       [{ id: 1 }, { id: 2 }, { noid: 3 }],
//       [['', { byOrder: false, getKey: x => x.id, ignoreKeyUndefined: false }]]
//     )
//   ).toEqual([['(undefined)', undefined, { noid: 3 }]])
// })

// it('when compare complex ones, it should work', () => {
//   const a = {
//     type: 'a',
//     items: [
//       { price: 80, name: 'sto' },
//       { price: 550, billing: { type: 'payable' }, name: 'pro' }
//     ]
//   }
//   const b = {
//     type: 'b',
//     items: [
//       { price: 90, name: 'sto' },
//       { price: 550, name: 'pro', billing: { type: 'credit' } }
//     ]
//   }
//   expect(
//     diff(a, b, [['items', { byOrder: false, getKey: item => item.name }]])
//   ).toEqual([
//     ['type', 'a', 'b'],
//     ['items(sto).price', 80, 90],
//     ['items(pro).billing.type', 'payable', 'credit']
//   ])
// })
