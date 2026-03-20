# 当前顺序：完整主链路（风格测评 -> 项目中心）

## 当前顺序口径
- 主链路范围：`/style-eval`（风格测评） -> `/leads`（线索） -> `/budget-breakdown`（初步预算拆解） -> `/register`（注册） -> `/contracts`（合同签署） -> `/deep-eval`（深度测评） -> `/projects`（项目列表） -> `/home`（项目中心）。
- 风格测评：`/style-eval` 内按 `src/pages/StyleEval/data/questions.ts` 的 `q1..q10` 顺序答题，随后进入“结果页”（文档用 `result` 标识）。
- 深度测评：`/deep-eval` 按 `src/utils/navigationConfig.ts` 的 `q2-4..q2-21` 顺序执行（文档用 `Q2-x`/`q2-x` 标识），并在每条给出路由参数 `?step=`（与目录配置一致）。
- 目录标号（NavigationMenu）：基于 `src/utils/navigationConfig.ts` 的 `NAVIGATION_STEPS`，在“非 `from=requirements` 补齐流程”场景下（即 `reqFlow=false`）计算 `index + 1`。
  - 注意：`/projects` 与 `/home` 不在 `NavigationMenu` 目录配置中，因此这两页的“目录标号”为 `-`。

---

## 风格测评（共 11 页）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识 | 路由 |
| --- | --- | --- | --- |
| 1 | 2 | `q1` | `/style-eval` |
| 2 | 2 | `q2` | `/style-eval` |
| 3 | 2 | `q3` | `/style-eval` |
| 4 | 2 | `q4` | `/style-eval` |
| 5 | 2 | `q5` | `/style-eval` |
| 6 | 2 | `q6` | `/style-eval` |
| 7 | 2 | `q7` | `/style-eval` |
| 8 | 2 | `q8` | `/style-eval` |
| 9 | 2 | `q9` | `/style-eval` |
| 10 | 2 | `q10` | `/style-eval` |
| 11 | 2 | `result`（风格测评结果页） | `/style-eval` |

---

## 线索收集（共 2 页）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识 | 路由 |
| --- | --- | --- | --- |
| 12 | 3 | `leads-1` / `DE-1`（项目概况） | `/leads?step=1` |
| 13 | 4 | `leads-2` / `DE-2`（您的信息） | `/leads?step=2` |

---

## 初步预算拆解（共 1 页）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识 | 路由 |
| --- | --- | --- | --- |
| 14 | 5 | `budget-breakdown`（项目预算拆解） | `/budget-breakdown` |

---

## 注册（共 1 页）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识 | 路由 |
| --- | --- | --- | --- |
| 15 | 6 | `register` | `/register` |

---

## 合同签署（共 2 页）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识 | 路由 |
| --- | --- | --- | --- |
| 16 | 7 | `contract-1`（意向金合同） | `/contracts?step=1` |
| 17 | 8 | `contract-2`（支付账号） | `/contracts?step=2` |

---

## 深度测评（共 19 步，至结束）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识（Q2） | qId（路由 step 配置） | `?step=` | 标题（目录显示） | 路由 |
| --- | --- | --- | --- | --- | --- | --- |
| 18 | 9 | `Q2-4` | `q2-4` | 0 | 房型资料同步 | `/deep-eval?step=0` |
| 19 | 10 | `Q2-5` | `q2-5` | 1 | 房屋现状 | `/deep-eval?step=1` |
| 20 | 11 | `Q2-6` | `q2-6` | 2 | 核心成员 | `/deep-eval?step=2` |
| 21 | 12 | `Q2-6-1` | `q2-6-1` | 3 | 家庭成员 | `/deep-eval?step=3` |
| 22 | 13 | `Q2-7` | `q2-7` | 4 | 协作方式 | `/deep-eval?step=4` |
| 23 | 14 | `Q2-8` | `q2-8` | 5 | 计划节奏 | `/deep-eval?step=5` |
| 24 | 15 | `Q2-9` | `q2-9` | 6 | 空间规划 | `/deep-eval?step=6` |
| 25 | 16 | `Q2-10` | `q2-10` | 7 | 成长变化 | `/deep-eval?step=7` |
| 26 | 17 | `Q2-11` | `q2-11` | 8 | 烹饪习惯 | `/deep-eval?step=8` |
| 27 | 18 | `Q2-12` | `q2-12` | 9 | 聚餐习惯 | `/deep-eval?step=9` |
| 28 | 19 | `Q2-13` | `q2-13` | 10 | 客厅习惯 | `/deep-eval?step=10` |
| 29 | 20 | `Q2-14` | `q2-14` | 11 | 储物重点 | `/deep-eval?step=11` |
| 30 | 21 | `Q2-15` | `q2-15` | 12 | 卫浴偏好 | `/deep-eval?step=12` |
| 31 | 22 | `Q2-16` | `q2-16` | 13 | 底线需求 | `/deep-eval?step=13` |
| 32 | 23 | `Q2-17` | `q2-17` | 14 | 风水禁忌 | `/deep-eval?step=14` |
| 33 | 24 | `Q2-18` | `q2-18` | 15 | 智能家居 | `/deep-eval?step=15` |
| 34 | 25 | `Q2-19` | `q2-19` | 16 | 适老/无障碍 | `/deep-eval?step=16` |
| 35 | 26 | `Q2-20` | `q2-20` | 17 | 旧物处理 | `/deep-eval?step=17` |
| 36 | 27 | `Q2-21` | `q2-21` | 18 | 其他需求 | `/deep-eval?step=18` |

---

## 项目列表（共 1 页）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识 | 路由 |
| --- | --- | --- | --- |
| 37 | - | `projects` | `/projects`（可能带 `?highlight=leadId`） |

---

## 项目中心（共 1 页）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识 | 路由 |
| --- | --- | --- | --- |
| 38 | - | `home` / Project Center | `/home`（可能根据来源打开特定 tab） |

