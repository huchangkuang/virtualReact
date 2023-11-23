import { getBaseRollupPlugins, getPkgJson, resolvePkgPath } from "./utils";
import path from "path";
import generatePackageJson from "rollup-plugin-generate-package-json";
import alias from "@rollup/plugin-alias";

const {name, module} = getPkgJson('react-dom')
const pkgPath = resolvePkgPath(name)
const pkgDistPath = resolvePkgPath(name, true)

export default [
  {
    input:  path.join(pkgPath, module),
    output: [
      {
        file: `${pkgDistPath}/index.js`,
        name: 'index.js',
        format: 'umd'
      },
      {
        file: `${pkgDistPath}/client.js`,
        name: 'client.js',
        format: 'umd'
      }
    ],
    plugins: [...getBaseRollupPlugins(), generatePackageJson({
      inputFolder: pkgPath,
      outputFolder: pkgDistPath,
      baseContents: ({name, description, version}) => ({name, description, version, main: 'index.js'})
    }), alias({
      entries: {
        "hostConfig": `${pkgPath}/src/hostConfig.ts`
      }
    })],
  }
]