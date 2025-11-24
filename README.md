# 前端刷题系统

基于 Vue 3 + TypeScript + Vite 构建的刷题应用

## 功能特性

- 题库选择与难度筛选
- 在线答题：单选/多选/简答/填空
- 结果统计：正确率、用时、错题回顾
- 数据驱动：支持“多文件 + 索引”的题库管理
- 响应式设计：题号导航分页与页码列表随屏幕宽度自适应
- 练习/背题双模式：进度独立保存，首页分别展示横幅并可独立继续/删除

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
src/
├── views/           # 页面组件
│   ├── Home.vue     # 首页
│   ├── Quiz.vue     # 答题页（题号导航、分页、图例、响应式）
│   └── Result.vue   # 结果页（错题回顾与统计）
├── composables/     # 组合式函数
│   └── useQuiz.ts   # 答题逻辑与进度存储
├── types/           # TypeScript 类型
├── router/          # 路由配置
└── main.ts          # 入口文件

public/
└── data/
    ├── banks.json   # 题库索引（名称与文件路径）
    ├── data.json    # 示例题库（数据库）
    └── javascript.json 等 # 其它题库文件
```

## 数据与题库管理

采用“多文件 + 索引”的方案：

- 索引文件 `public/data/banks.json`（示例）：

```json
{
  "banks": [
    { "name": "数据库", "file": "/data/data.json" },
    { "name": "JavaScript", "file": "/data/javascript.json" }
  ]
}
```

- 题库文件统一格式（支持扁平或嵌套数组）：

```json
{
  "bank": "数据库",
  "questions": [
    {
      "category": "chapter1_intro",
      "type": "single",
      "question": "题目内容",
      "options": ["A", "B", "C", "D"],
      "answer": 0,
      "explanation": "解析内容",
      "difficulty": "easy",
      "status": "active"
    }
  ]
}
```

- 简答/填空题格式：

```json
{
  "type": "short",              // 或 "fill"
  "question": "题目内容",
  "answer": ["标准答案", "等价表达"],
  "explanation": "解析内容",
  "difficulty": "medium",
  "status": "active"
}
```

### 新增题库步骤
1. 在 `public/data/` 下新增题库文件，例如 `javascript.json`
2. 在 `public/data/banks.json` 中新增一项 `{ "name": "JavaScript", "file": "/data/javascript.json" }`
3. 首页将自动读取索引并按需加载对应题库文件；题量由页面读取文件后自动统计，无需手动维护

### 进度存储与模式
- 支持练习（practice）与背题（memorize）双模式，进度分库分模式独立保存：
  - 练习：`quiz_progress_practice`
  - 背题：`quiz_progress_memorize`
- 首页同时展示两个横幅（如两种模式都有进度），可分别“继续/删除”，并显示各自百分比与完成数

### 答题页说明
- 右侧题号导航支持分页与响应式，自适应页码个数；状态图例区分“正确/错误/已查看/未查看”
- 简答/填空题点击“显示答案”会在输入框中填入标准答案，并计入错误；练习统计按实际正确提交计算

新增或更新题库时：在服务器的 `data/` 目录下新增/替换对应题库 JSON，并在 `banks.json` 中填写即可。
