# 当前顺序：完整主链路（风格测评 -> 项目中心）

## 当前顺序口径
- 主链路范围：`/style-eval`（风格测评） -> `/leads`（线索） -> `/budget-breakdown`（初步预算拆解） -> `/register`（注册） -> `/deep-eval`（深度测评） -> `/contracts`（合同签署） -> `/projects`（项目列表） -> `/home`（项目中心）。
- 风格测评：`/style-eval` 内按 `src/pages/StyleEval/data/questions.ts` 的 `q1..q10` 顺序答题，随后进入“结果页”（文档用 `result` 标识）。
- 深度测评：`/deep-eval` 按 `src/utils/navigationConfig.ts` 的 `q2-4..q2-21` 顺序执行（文档用 `Q2-x`/`q2-x` 标识），并在每条给出路由参数 `?step=`（与目录配置一致）。
- 目录标号（NavigationMenu）：基于 `src/utils/navigationConfig.ts` 的 `NAVIGATION_STEPS`，在“非 `from=requirements` 补齐流程”场景下（即 `reqFlow=false`）计算 `index + 1`。
  - 注意：`/projects` 与 `/home` 不在 `NavigationMenu` 目录配置中，因此这两页的“目录标号”为 `-`。

---

## 风格测评（共 8 页）

q8、q9、q10 在文档中已移至「深度测评」中 Q2-5 与 Q2-6 之间（见下方）。

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识 | 路由 | 标题 |
| --- | --- | --- | --- | --- |
| 1 | 2 | `q1` | `/style-eval` | 关于光感 |
| 2 | 2 | `q2` | `/style-eval` | 关于色温 |
| 3 | 2 | `q3` | `/style-eval` | 关于质地 |
| 4 | 2 | `q4` | `/style-eval` | 关于密度 |
| 5 | 2 | `q5` | `/style-eval` | 关于时代 |
| 6 | 2 | `q6` | `/style-eval` | 关于秩序 |
| 7 | 2 | `q7` | `/style-eval` | 关于社交 |
| 8 | 2 | `result`| `/style-eval` | 风格测评结果页 |

---

## 线索收集（共 2 页）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识 | 路由 |
| --- | --- | --- | --- |
| 9 | 3 | `leads-1` / `DE-1`（项目概况） | `/leads?step=1` |
| 10 | 4 | `leads-2` / `DE-2`（您的信息） | `/leads?step=2` |

---

## 初步预算拆解（共 1 页）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识 | 路由 |
| --- | --- | --- | --- |
| 11 | 5 | `budget-breakdown`（项目预算拆解） | `/budget-breakdown` |

---

## 注册（共 1 页）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识 | 路由 |
| --- | --- | --- | --- |
| 12 | 6 | `register` | `/register` |

---

## 深度测评（含风格测评的q8-q10挪到深度测评的Q2-5和Q2-6之间，共 22 步）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识（Q2） | qId（路由 step 配置） | `?step=` | 标题（目录显示） | 路由 |
| --- | --- | --- | --- | --- | --- | --- |
| 13 | 9 | `Q2-4` | `q2-4` | 0 | 房型资料同步 | `/deep-eval?step=0` |
| 14 | 10 | `Q2-5` | `q2-5` | 1 | 房屋现状 | `/deep-eval?step=1` |
| 15 | 2 | `q8`（风格，已移入） | - | - | 居住定位 | `/style-eval` |
| 16 | 2 | `q9`（风格，已移入） | - | - | 居住成员 | `/style-eval` |
| 17 | 2 | `q10`（风格，已移入） | - | - | 家庭爱好 | `/style-eval` |
| 18 | 11 | `Q2-6` | `q2-6` | 2 | 核心成员 | `/deep-eval?step=2` |
| 19 | 12 | `Q2-6-1` | `q2-6-1` | 3 | 家庭成员 | `/deep-eval?step=3` |
| 20 | 13 | `Q2-7` | `q2-7` | 4 | 协作方式 | `/deep-eval?step=4` |
| 21 | 14 | `Q2-8` | `q2-8` | 5 | 计划节奏 | `/deep-eval?step=5` |
| 22 | 15 | `Q2-9` | `q2-9` | 6 | 空间规划 | `/deep-eval?step=6` |
| 23 | 16 | `Q2-10` | `q2-10` | 7 | 成长变化 | `/deep-eval?step=7` |
| 24 | 17 | `Q2-11` | `q2-11` | 8 | 烹饪习惯 | `/deep-eval?step=8` |
| 25 | 18 | `Q2-12` | `q2-12` | 9 | 聚餐习惯 | `/deep-eval?step=9` |
| 26 | 19 | `Q2-13` | `q2-13` | 10 | 客厅习惯 | `/deep-eval?step=10` |
| 27 | 20 | `Q2-14` | `q2-14` | 11 | 储物重点 | `/deep-eval?step=11` |
| 28 | 21 | `Q2-15` | `q2-15` | 12 | 卫浴偏好 | `/deep-eval?step=12` |
| 29 | 22 | `Q2-16` | `q2-16` | 13 | 底线需求 | `/deep-eval?step=13` |
| 30 | 23 | `Q2-17` | `q2-17` | 14 | 风水禁忌 | `/deep-eval?step=14` |
| 31 | 24 | `Q2-18` | `q2-18` | 15 | 智能家居 | `/deep-eval?step=15` |
| 32 | 25 | `Q2-19` | `q2-19` | 16 | 适老/无障碍 | `/deep-eval?step=16` |
| 33 | 26 | `Q2-20` | `q2-20` | 17 | 旧物处理 | `/deep-eval?step=17` |
| 34 | 27 | `Q2-21` | `q2-21` | 18 | 其他需求 | `/deep-eval?step=18` |

---

## 合同签署（共 2 页）

| 文档顺序号 | 目录标号（NavigationMenu） | 页面标识 | 路由 |
| --- | --- | --- | --- |
| 35 | 7 | `contract-1`（意向金合同） | `/contracts?step=1` |
| 36 | 8 | `contract-2`（支付账号） | `/contracts?step=2` |

---