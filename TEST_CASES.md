# 试验详情页图表功能测试用例

## 功能概述

试验详情页在数字卡片区下方新增了3张图表，用于可视化展示单个试验的统计数据：
- **受试者状态分布**：环形饼图（受试者5种状态）
- **访视完成情况**：柱状图（访视5种状态）
- **AE 严重程度分布**：柱状图（AE 5个严重等级）

**关键修复点**：本次修复确保了图表在任何数据情况下（包括0值类别）都能完整展示所有状态类别，而不是仅显示有数据的类别。

---

## 一、API层测试用例

### TC-01-API 空试验统计接口返回值结构验证

**前置条件**：数据库中存在一个没有任何受试者、访视、不良事件的试验（Trial ID = 空试验ID）

**测试步骤**：
1. 调用接口 `GET /api/trials/{空试验ID}`
2. 检查响应结构中 `data.statistics` 字段

**预期结果**：
```json
{
  "data": {
    "statistics": {
      "subjectStatusDistribution": {
        "SCREENING": 0,
        "ENROLLED": 0,
        "ACTIVE": 0,
        "WITHDRAWN": 0,
        "COMPLETED": 0
      },
      "visitStatusDistribution": {
        "SCHEDULED": 0,
        "IN_PROGRESS": 0,
        "COMPLETED": 0,
        "MISSED": 0,
        "CANCELLED": 0
      },
      "aeSeverityDistribution": {
        "MILD": 0,
        "MODERATE": 0,
        "SEVERE": 0,
        "LIFE_THREATENING": 0,
        "FATAL": 0
      }
    }
  }
}
```
- ✅ 3个 distribution 对象的键必须齐全（5+5+5=15个枚举值），任何一个键缺失均为 FAIL
- ✅ 全部值为 0

---

### TC-02-API 部分数据统计返回值验证

**前置条件**：试验A已配置以下业务数据：
- 受试者：筛选中 × 2，已入组 × 3，在研中 × 1，退出 × 0，完成 × 0
- 访视：待访视 × 5，进行中 ×