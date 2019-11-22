export const diff: Diff = (l, r, options) => {
  return []
}

type Option = {
  path: string | RegExp
  ignore: boolean
  array?: {
    orderSensitive: boolean
    getKey: <T>(t: T) => string
  }
}

type DiffResult =
  | {
      type: DiffResultTypeEnum.Added
      left: any
    }
  | { type: DiffResultTypeEnum.Deleted; right: any }
  | { type: DiffResultTypeEnum.Editted; left: any; right: any }

enum DiffResultTypeEnum {
  Editted = 'E',
  Added = 'A',
  Deleted = 'D'
}

type Diff = (l: any, r: any, options: Option[]) => DiffResult[]
