1️⃣ Vite + Tree Shaking 的前提
  Vite（基于 Rollup）能做到按需打包，但需要满足：

  使用 ES Module（ESM）输出
  没有破坏 tree-shaking 的写法（比如副作用）
  组件是 按模块导出（而不是一个大 bundle）

  👉 正确示例：

  // index.ts
  export { FlowComponent } from './flow/FlowComponent'
  export { Button } from './Button'

  只要用户：

  import { Button } from 'your-lib'

👉 FlowComponent 以及它依赖的 React Flow 不会被打包

2️⃣ 最大的坑：React Flow 被“提前打进库”
  如果你在构建组件库时：

  vite build

  并且 没有 external 掉 React Flow

  👉 那么会发生：

  React Flow 会被直接打进你的组件库 bundle
  → 用户即使不用 FlowComponent，也会被迫带上它

  ✅ 正确做法（非常关键）

  在 vite.config.ts：

  export default defineConfig({
    build: {
      lib: {
        entry: 'src/index.ts',
        formats: ['es']
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'reactflow'], // 👈 关键
      }
    }
  })

  👉 这样 React Flow 不会被打进你的库，而是交给用户项目自己处理

3️⃣ dependencies vs peerDependencies（很重要）

  你需要决定 React Flow 放在哪里：

  ❌ 放在 dependencies
  "dependencies": {
    "reactflow": "^11"
  }

  👉 用户安装你的库 → 一定安装 React Flow
  👉 即使不用 FlowComponent → 也会下载（但不一定打包）

  ✅ 推荐：放在 peerDependencies
  "peerDependencies": {
    "reactflow": "^11"
  }

  👉 含义：

  只有用户用到 Flow 组件时才需要安装
  避免重复打包
  更符合组件库设计
4️⃣ 更进一步优化（可选但推荐）

  如果你想做到极致按需，可以拆入口：

  // main entry
  export * from './basic'

  // flow entry
  export * from './flow'

  然后：

  "exports": {
    ".": "./dist/index.js",
    "./flow": "./dist/flow.js"
  }

  👉 用户：

  import { Button } from 'your-lib'

  不会碰 React Flow

  import { FlowComponent } from 'your-lib/flow'

  才会引入

5️⃣ 一个现实判断标准

  你可以这样验证：

  npm pack

  看打出来的包：

  如果里面包含 React Flow 代码 → ❌ 有问题
  如果只是 import 语句 → ✅ 正确