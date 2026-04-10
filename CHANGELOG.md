# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

- 补充开源基础文档：`CONTRIBUTING.md`、`CHANGELOG.md`、`.env.example`

### Changed

- 修复 TypeScript strict/erasableSyntaxOnly 相关构建报错，`npm run build` 恢复通过
- README 对齐当前产品能力与路由结构
- `.gitignore` 增加 `.env*` 忽略规则并保留 `.env.example`
- `.env.development` / `.env.production` 改为本地默认值模板


## 2026-04-10 开发日志

### 今日完成

#### 1. 提交已有修改 (commit 87c2d6d)
- **文件**: `src/utils/markdown.ts`, `src/views/dashboard/DashboardPage.vue`
- **内容**: 
  - 修复 `markdown.ts` 中 DOMPurify SSR 问题（浏览器环境 null check）
  - Dashboard chart TypeScript 类型修复

#### 2. R-03: Office 智能体工坊完善 (commit 311374f)
- **后端已就绪**: `/api/office/agents` 和 `/api/office/templates` API 已实现（server/office.js）
- **前端新增**:
  - `src/stores/office.ts`: 新增 `fetchTemplates()`, `fetchOfficeAgents()` 函数
  - `loadOfficeData()` 扩展为并行加载: agents + sessions + templates + office agents
  - 自动同步 office agents 到后端持久化
  - 模板列表 fallback：API 不可用时使用默认 5 个模板

#### 3. R-04: MyWorld 虚拟公司完善 (commit 311374f)
- **后端已就绪**: `/api/myworld/companies` 和 `/api/myworld/members` API 已实现（server/myworld.js）
- **前端新增**:
  - **`src/stores/myworld.ts`** (新建): 完整的 myworld store
    - `fetchCompanies()` / `createCompany()` / `updateCompany()` / `deleteCompany()`
    - `fetchMembers()` / `addMember()` / `removeMember()`
    - `fetchMyMemberships()` / `ensureDemoCompany()`
  - `src/views/myworld/MyWorldPage.vue`: 集成 myworldStore，自动初始化演示公司

#### 4. TS 修复 (内含历史遗留问题)
| 文件 | 问题 | 修复 |
|------|------|------|
| `markdown.ts` | `import type { SanitizeOptions } from 'dompurify'` 类型找不到 | 移除未使用导入 |
| `DashboardPage.vue` | `formatter: params: Array<{value:number}>` 缺少 `name` | 改为 `{name,value}` |
| `DashboardPage.vue` | `mockData` 只声明了 `metrics` 属性 | 补全所有数据属性类型 |
| `DashboardPage.vue` | `StatusData` 缺少 `itemStyle` | 新增 `itemStyle?: {color:string}` |
| `DashboardPage.vue` | `params[0]` possibly undefined | 加 `?.` 可选链 |
| `OfficePage.vue` | `latest` possibly undefined | 提前解包，加 if guard |
| `MyWorldPage.vue` | 同上 | 同上 |
| `office.ts` | `templates` / `templatesLoading` 状态缺失 | 补充 ref 和 return |

#### 5. Build 验证
```
vue-tsc -b && vite build  ✓ built in 20.18s
```

#### 6. Git 推送
- 分支 `ai` 推送到 origin
- 2 个 commit: `87c2d6d` (fix) + `311374f` (feat)

### 待续：P0 剩余项目
- R-01: 多用户 + RBAC（store `rbac.ts` 已存在，需 UI 集成）
- R-02: 通知中心 + 告警渠道（store `notification.ts` 已存在，后端 `server/notifications.js` 已实现）
