import RollupTypescript from 'rollup-plugin-typescript2'
import RollupCommonjs from '@rollup/plugin-commonjs'
import path from "path"
import fs from "fs"

const pkgPath = path.resolve(__dirname, "../../packages")
const distPath = path.resolve(__dirname, "../../dist/node_modules")
export const resolvePkgPath = (pkgName, isDist) => {
  if (isDist) {
    return `${distPath}/${pkgName}`
  }
  return `${pkgPath}/${pkgName}`
}

export const getBaseRollupPlugins = () => {
  return [RollupTypescript({}),RollupCommonjs()]
}

export const getPkgJson = (pkgName) => {
  const path = `${resolvePkgPath(pkgName)}/package.json`
  const str = fs.readFileSync(path, {encoding: 'utf-8'})
  return JSON.parse(str)
}