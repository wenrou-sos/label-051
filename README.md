# 临床药物试验受试者管理平台 (CTMS)

## 项目概述

本项目是一个基于 Next.js 14 + MySQL 的临床药物试验受试者管理平台，专为符合 GCP（药物临床试验质量管理规范）要求而设计。平台提供完整的临床试验管理功能，包括试验项目管理、受试者随访管理、不良事件警戒、访视时间线可视化以及分级权限控制，同时具备完整的审计日志和数据追溯功能，确保临床试验数据的完整性和可追溯性。

## 环境要求

- **Node.js** >= 18.0
- **MySQL** >= 8.0
- **npm** 或 **yarn** 包管理器

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| UI | React 18 + TailwindCSS |
| 数据库 | MySQL 8.0 + Prisma ORM |
| 认证 | NextAuth.js |
| 图表 | Recharts |
| 图标 | Lucide React |
| 密码加密 | bcryptjs |
| 表单验证 | Zod |
| 日期处理 | date-fns |

## 功能模块说明

### 1. 试验项目管理

- **试验项目管理**：支持试验项目的创建、编辑、查询、删除操作
- **状态跟踪**：草稿 / 招募中 / 进行中 / 暂停 / 已完成 / 终止
- **项目信息**：试验编号、标题、药物名称、适应症、申办方、CRO、研究中心等
- **关联查看**：每个试验项目可查看关联的受试者列表、访视记录和不良事件

### 2. 受试者随访管理

- **受试者信息**：录入、编辑、查询受试者基本信息
- **状态管理**：筛选中 / 已入组 / 在研中 / 退出 / 完成
- **随访计划**：制定与执行受试者的随访计划
- **访视类型**：筛查访视 / 基线访视 / 随访 / 研究结束 / 非计划访视
- **访视窗口**：灵活的访视窗口管理，确保访视在规定时间范围内完成

### 3. 不良事件警戒系统

- **不良事件记录**：不良事件（AE）的完整记录与管理
- **SAE 标记**：严重不良事件（SAE）标记与快速报告功能
- **严重程度分级**：轻度 / 中度 / 重度 / 危及生命 / 死亡
- **关联性评价**：无关 / 不太可能 / 可能 / 很可能 / 肯定
- **处理措施**：记录处理措施与结局
- **伦理委员会报告**：追踪向伦理委员会的报告情况

### 4. 访视时间线检索

- **可视化展示**：受试者访视与不良事件的时间线可视化
- **多维度筛选**：按试验、受试者、日期范围等维度筛选
- **事件配色**：访视事件与不良事件采用不同配色方案区分
- **统计汇总**：总事件数、访视数、不良事件数的统计汇总

### 5. 分级权限控制

- **5 种角色**：系统管理员、研究者、医生、协调员、监查员
- **RBAC 权限控制**：基于角色的访问控制（RBAC）
- **权限粒度**：支持 CRUD 操作级别的精细权限控制

## 安装步骤

1. **克隆项目**到本地
2. **安装依赖**：
   ```bash
   npm install
   ```
3. **配置环境变量**：创建 `.env` 文件（详见配置说明）
4. **启动 MySQL**：确保 MySQL 服务正常运行，并创建数据库 `clinical_trial_db`
5. **初始化数据库**：
   ```bash
   npm run db:init
   ```
6. **启动开发服务器**：
   ```bash
   npm run dev
   ```

## 配置说明

### 数据库配置

- **DATABASE_URL**：MySQL 连接字符串，格式为 `mysql://用户名:密码@主机:端口/数据库名`
- 默认配置：使用 root 用户，密码 password，端口 3306，数据库名 clinical_trial_db

### NextAuth 配置

- **NEXTAUTH_URL**：应用 URL，本地开发环境为 `http://localhost:3000`
- **NEXTAUTH_SECRET**：JWT 签名密钥，**生产环境必须修改为安全的随机字符串**

## 数据库初始化

项目内置种子数据，通过 `npm run db:init` 命令可自动初始化以下测试数据：

- 5 个测试用户账号（覆盖全部角色）
- 3 个试验项目
- 11 个受试者
- 多条访视记录和不良事件记录

## 测试账号

所有测试账号的默认密码均为：**password**

| 邮箱 | 角色 | 说明 |
|------|------|------|
| admin@clinical.com | 系统管理员 | 拥有全部功能权限 |
| investigator@clinical.com | 研究者 | 试验项目负责人权限 |
| doctor@clinical.com | 医生 | 临床操作相关权限 |
| coordinator@clinical.com | 协调员 | 日常协调工作权限 |
| monitor@clinical.com | 监查员 | 数据监查权限 |

## 使用指南

1. 启动开发服务器后，在浏览器中访问 **http://localhost:3000**
2. 使用上述测试账号登录系统
3. 通过左侧**侧边栏**导航至各功能模块
4. 建议首次体验使用**管理员账号**（admin@clinical.com），可体验全部功能

## 数据库表结构

### 核心表说明

#### User（用户表）
用户信息表，存储系统用户的基本信息、角色和权限
- 字段：id, email, password, name, role, phone, department, title, isActive, lastLoginAt, createdAt, updatedAt
- 关联：创建的试验项目、受试者、访视、不良事件

#### Trial（试验项目表）
临床试验项目信息表
- 字段：id, trialNumber, title, shortName, description, protocolNumber, indication, drugName, phase, status, startDate, endDate, plannedSubjects, actualSubjects, sponsor, cro, siteName, piName, notes, createdById
- 关联：受试者列表、访视列表、不良事件列表

#### Subject（受试者表）
试验受试者信息表
- 字段：id, subjectNumber, initials, gender, birthDate, age, status, enrollmentDate, withdrawalDate, withdrawalReason, trialId, createdById
- 关联：所属试验、访视记录、不良事件记录

#### Visit（访视/随访表）
受试者访视记录表
- 字段：id, visitNumber, name, type, status, scheduledDate, actualDate, windowStart, windowEnd, location, notes, subjectId, trialId, createdById, completedById
- 关联：受试者、试验、创建者、完成者

#### AdverseEvent（不良事件表）
不良事件（AE）记录表
- 字段：id, aeNumber, term, description, startDate, endDate, severity, seriousness, relationship, outcome, action, isSAE, saeReportedDate, reportedToEthics, subjectId, trialId, createdById
- 关联：受试者、试验、创建者

#### AuditLog（审计日志表）
系统审计日志，记录所有数据变更操作
- 字段：id, action, entityType, entityId, fieldName, oldValue, newValue, userId, userEmail, ipAddress, createdAt

### 枚举类型说明

| 枚举名 | 值 |
|--------|-----|
| RoleType | ADMIN, INVESTIGATOR, DOCTOR, COORDINATOR, MONITOR |
| TrialStatus | DRAFT, RECRUITING, ACTIVE, SUSPENDED, COMPLETED, TERMINATED |
| SubjectStatus | SCREENING, ENROLLED, ACTIVE, WITHDRAWN, COMPLETED |
| VisitStatus | SCHEDULED, IN_PROGRESS, COMPLETED, MISSED, CANCELLED |
| VisitType | SCREENING, BASELINE, FOLLOW_UP, END_OF_STUDY, UNSCHEDULED |
| AESeverity | MILD, MODERATE, SEVERE, LIFE_THREATENING, FATAL |
| AERelationship | UNRELATED, UNLIKELY, POSSIBLE, PROBABLE, DEFINITE |
| AEOutcome | RECOVERED, RECOVERING, NOT_RECOVERED, SEQUELAE, FATAL |
| AEAction | NONE, DOSE_REDUCED, DRUG_WITHDRAWN, TREATMENT_GIVEN, HOSPITALIZATION |

## 项目脚本说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 运行 ESLint 代码检查 |
| `npm run db:push` | 将 Prisma schema 推送到数据库（不执行迁移） |
| `npm run db:seed` | 执行数据库种子数据填充 |
| `npm run db:init` | 数据库初始化（推送 schema + 填充种子数据） |

## 合规与安全说明

本平台严格遵循 GCP（药物临床试验质量管理规范）要求，采用以下措施确保数据安全与合规：

### 数据完整性
- **审计日志（AuditLog）**：记录所有 CRUD 操作，包括操作类型、实体类型、字段变更的旧值/新值、操作人、时间、IP 地址等，确保所有数据变更可追溯
- **时间戳字段**：所有核心表均包含 `createdAt` 和 `updatedAt` 字段，自动记录创建和更新时间

### 数据保密性
- **密码加密**：使用 bcryptjs 对用户密码进行加盐哈希存储，确保密码明文不入库
- **JWT 会话管理**：使用 NextAuth.js + JWT 实现安全的用户会话管理
- **权限控制**：基于角色的访问控制（RBAC），确保用户只能访问其权限范围内的数据和功能

### 生产环境建议
- 修改 `NEXTAUTH_SECRET` 为高强度随机密钥
- 使用 HTTPS 协议部署应用
- 配置适当的数据库访问权限
- 定期备份数据库
- 启用防火墙和网络安全策略
