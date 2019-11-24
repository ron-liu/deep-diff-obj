export type Value = any
export type GetKey = (t: any) => string

export type Option = {
  path: string | RegExp
  ignore?: boolean
  array?: {
    orderSensitive: boolean
    getKey?: GetKey
  }
}

export type DiffResult =
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

export enum DiffResultTypeEnum {
  Editted = 'E',
  Added = 'A',
  Deleted = 'D'
}

export type Diff = (
  left: Value,
  right: Value,
  options?: Option[],
  currentPath?: string
) => DiffResult[]
