import { getBaseRollupPlugins, getPkgJson, resolvePkgPath } from "./utils";
import path from "path";
import generatePackageJson from "rollup-plugin-generate-package-json";

const {name, module} = getPkgJson('react')
const pkgPath = resolvePkgPath(name)
const pkgDistPath = resolvePkgPath(name, true)

export default [
  {
    input:  path.join(pkgPath, module),
    output: {
      file: `${pkgDistPath}/index.js`,
      name: 'index.js',
      format: 'umd'
    },
    plugins: [...getBaseRollupPlugins(), generatePackageJson({
      inputFolder: pkgPath,
      outputFolder: pkgDistPath,
      baseContents: ({name, description, version}) => ({name, description, version, main: 'index.js'})
    })],
  },
  {
    input:  path.join(pkgPath, 'src/jsx.ts'),
    output: [
      {
        file: `${pkgDistPath}/jsx-runtime.js`,
        name: 'jsx-runtime.js',
        format: 'umd'
      },
      {
        file: `${pkgDistPath}/jsx-dev-runtime.js`,
        name: 'jsx-dev-runtime.js',
        format: 'umd'
      }
    ],
    plugins: [...getBaseRollupPlugins()],
  }
]