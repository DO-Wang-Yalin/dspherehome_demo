import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// 轻量替代：ai-studio 无 antd，用 console 模拟 message
const message = {
  info: (content: string, _duration?: number) => {
    // eslint-disable-next-line no-console
    console.log(content)
  },
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type StatusGroup = '意向期' | '订购期' | '交付期' | '验收期' | '维保期'

export interface IncomeEntry {
  id: string
  date: string
  displayDate: string
  amount: number // 万元, 0 = date marker only
  status: StatusGroup
  isToday?: boolean
  isFuture?: boolean
  isUnpaid?: boolean
}

export interface Milestone {
  id: string
  name: string
  budgetMin: number
  budgetMax: number
  dueDate: string
}

export interface Order {
  id: string
  number: string
  title: string
  status: StatusGroup
  milestoneId: string
  budgetMin: number
  budgetMax: number
  /** 状态码，如 S01、S07 */
  statusCode?: string
  /** 状态名称，如 意向沟通中、订单验收中 */
  statusName?: string
}

/** Optional data prop: when provided, Sankey uses this instead of built-in mock. */
export interface BudgetSankeyData {
  incomeEntries: IncomeEntry[]
  milestones: Milestone[]
  orders: Order[]
  totalBudget: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<StatusGroup, string> = {
  意向期: '#d0d7d6',
  订购期: '#4887ff',
  交付期: '#B300FA',
  验收期: '#ff9c3e',
  维保期: '#7BC80E',
}

const STATUS_LIST: StatusGroup[] = ['意向期', '订购期', '交付期', '验收期', '维保期']

function interpolateColor(c1: string, c2: string, factor: number) {
  const r1 = parseInt(c1.slice(1, 3), 16)
  const g1 = parseInt(c1.slice(3, 5), 16)
  const b1 = parseInt(c1.slice(5, 7), 16)
  const r2 = parseInt(c2.slice(1, 4), 16) || parseInt(c2.slice(1, 3), 16)
  const g2 = parseInt(c2.slice(3, 6), 16) || parseInt(c2.slice(3, 5), 16)
  const b2 = parseInt(c2.slice(5, 8), 16) || parseInt(c2.slice(5, 7), 16)
  const r = Math.round(r1 + factor * (r2 - r1))
  const g = Math.round(g1 + factor * (g2 - g1))
  const b = Math.round(b1 + factor * (b2 - b1))
  return `rgb(${r},${g},${b})`
}



const UNPAID_COLOR = '#d0d7d6'
const INCOME_COLOR = '#FBBF24'
const FEATHER_PX = 10

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INCOME_ENTRIES: IncomeEntry[] = [
  { id: 'inc1', date: '2026-01-10', displayDate: '2026.01.10', amount: 10.0, status: '验收期' },
  { id: 'inc2', date: '2026-02-15', displayDate: '2026.02.15', amount: 25.0, status: '维保期' },
  { id: 'inc3', date: '2026-03-01', displayDate: '2026.03.01', amount: 15.0, status: '交付期' },
  { id: 'inc-today', date: '2026-03-18', displayDate: '今天', amount: 0, status: '订购期', isToday: true },
  // 未入金：预计最晚入金时间
  { id: 'inc-unpaid1', date: '2026-06-30', displayDate: '预计最晚 2026.06.30', amount: 15.0, status: '意向期', isFuture: true, isUnpaid: true },
  { id: 'inc-unpaid2', date: '2026-09-15', displayDate: '预计最晚 2026.09.15', amount: 20.0, status: '意向期', isFuture: true, isUnpaid: true },
  { id: 'inc-unpaid3', date: '2026-12-31', displayDate: '预计最晚 2026.12.31', amount: 15.0, status: '意向期', isFuture: true, isUnpaid: true },
]

const MILESTONES: Milestone[] = [
  { id: 'ms00', name: '里程碑 00-设计意向协议签署', budgetMin: 15.0, budgetMax: 15.0, dueDate: '2026.01.10' },
  { id: 'ms01', name: '里程碑 01-意向方案成果交付', budgetMin: 8.0, budgetMax: 8.0, dueDate: '2026.02.15' },
  { id: 'ms02', name: '里程碑 02-全案框架协议签署', budgetMin: 5.0, budgetMax: 5.0, dueDate: '2026.03.01' },
  { id: 'ms03', name: '里程碑 03-全案设计选品确认', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.03.15' },
  { id: 'ms04', name: '里程碑 04-项目施工许可获批', budgetMin: 3.0, budgetMax: 3.0, dueDate: '2026.04.10' },
  { id: 'ms05', name: '里程碑 05-施工现场筹备完成', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms06', name: '里程碑 06-拆除工程验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms07', name: '里程碑 07-构建工程验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms08', name: '里程碑 08-水电工程验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms09', name: '里程碑 09-防水测试验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms10', name: '里程碑 10-泥水工程验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms11', name: '里程碑 11-木作工程验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms12', name: '里程碑 12-涂料工程验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms13', name: '里程碑 13-空间产品验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms14', name: '里程碑 14-全屋系统验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms15', name: '里程碑 15-表面处理验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms16', name: '里程碑 16-园林景观验收合格', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms17', name: '里程碑 17-全案项目交付完成', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms18', name: '里程碑 18-维保升级订单成交', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms19', name: '里程碑 19-维保升级验收完工', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
  { id: 'ms20', name: '里程碑 20-最终结项验收完毕', budgetMin: 4.0, budgetMax: 4.0, dueDate: '2026.12.31' },
]

const ORDERS: Order[] = [
  // MS00: 15.0w，3 个订单分属 意向期/交付期/验收期，里程碑取最早 意向期
  { id: 'ord00-1', number: 'ORD-2026-0001', title: '核心机房核心交换机采购', status: '验收期', milestoneId: 'ms00', budgetMin: 12.0, budgetMax: 12.0, statusCode: 'S07', statusName: '订单验收中' },
  { id: 'ord00-2', number: 'ORD-2026-0002', title: '机房防静电地板铺设', status: '交付期', milestoneId: 'ms00', budgetMin: 2.0, budgetMax: 2.0, statusCode: 'S06-01', statusName: '交付设计中' },
  { id: 'ord00-3', number: 'ORD-2026-0003', title: '机柜标志标牌', status: '意向期', milestoneId: 'ms00', budgetMin: 1.0, budgetMax: 1.0, statusCode: 'S01', statusName: '意向沟通中' },

  // MS01: 8.0w，3 个订单分属 订购期/验收期/维保期，里程碑取最早 订购期
  { id: 'ord01-1', number: 'ORD-2026-0004', title: '智能化中央控制系统年度巡检', status: '维保期', milestoneId: 'ms01', budgetMin: 6.0, budgetMax: 6.0, statusCode: 'S10', statusName: '订单维保中' },
  { id: 'ord01-2', number: 'ORD-2026-0005', title: '摄像头支架更换', status: '验收期', milestoneId: 'ms01', budgetMin: 1.5, budgetMax: 1.5, statusCode: 'S09', statusName: '订单整改中' },
  { id: 'ord01-3', number: 'ORD-2026-0006', title: '系统软件小版本升级', status: '订购期', milestoneId: 'ms01', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S03', statusName: '订购确认中' },

  // MS02 (交付期): 5.0w
  { id: 'ord02-1', number: 'ORD-2026-0007', title: '暖通空调主机交付', status: '交付期', milestoneId: 'ms02', budgetMin: 3.5, budgetMax: 3.5, statusCode: 'S06-01', statusName: '交付设计中' },
  { id: 'ord02-2', number: 'ORD-2026-0008', title: '末端风口配送', status: '交付期', milestoneId: 'ms02', budgetMin: 1.0, budgetMax: 1.0, statusCode: 'S06-02', statusName: '方案汇报中' },
  { id: 'ord02-3', number: 'ORD-2026-0009', title: '辅材辅料打包', status: '交付期', milestoneId: 'ms02', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S06-03', statusName: '交付备货中' },

  // MS03 (订购期): 4.0w
  { id: 'ord03-1', number: 'ORD-2026-0010', title: '意向转提案合同', status: '订购期', milestoneId: 'ms03', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S03', statusName: '订购确认中' },
  { id: 'ord03-2', number: 'ORD-2026-0011', title: '材料样品打样', status: '订购期', milestoneId: 'ms03', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S02-01', statusName: '提案设计中' },
  { id: 'ord03-3', number: 'ORD-2026-0012', title: '初期选品会审', status: '订购期', milestoneId: 'ms03', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S02-02', statusName: '订购报价中' },

  // MS04 (订购期): 3.0w
  { id: 'ord04-1', number: 'ORD-2026-0013', title: '幕墙玻璃大样', status: '订购期', milestoneId: 'ms04', budgetMin: 2.0, budgetMax: 2.0, statusCode: 'S03', statusName: '订购确认中' },
  { id: 'ord04-2', number: 'ORD-2026-0014', title: '龙骨材料订购', status: '订购期', milestoneId: 'ms04', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S02-01', statusName: '提案设计中' },
  { id: 'ord04-3', number: 'ORD-2026-0015', title: '密封结构胶', status: '订购期', milestoneId: 'ms04', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S02-02', statusName: '订购报价中' },

  // MS05 - MS20 (意向期): 每组 3 个种子单项，模拟海量储备
  { id: 'ord05-1', number: 'ORD-2026-0016', title: '全案储备-基础施工', status: '意向期', milestoneId: 'ms05', budgetMin: 2.0, budgetMax: 2.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord05-2', number: 'ORD-2026-0017', title: '全案储备-水电改造', status: '意向期', milestoneId: 'ms05', budgetMin: 1.0, budgetMax: 1.0, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord05-3', number: 'ORD-2026-0018', title: '全案储备-地面找平', status: '意向期', milestoneId: 'ms05', budgetMin: 1.0, budgetMax: 1.0, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord06-1', number: 'ORD-2026-0019', title: '全案储备-木作吊顶', status: '意向期', milestoneId: 'ms06', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord06-2', number: 'ORD-2026-0020', title: '全案储备-内切封口', status: '意向期', milestoneId: 'ms06', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord06-3', number: 'ORD-2026-0021', title: '全案储备-表面打磨', status: '意向期', milestoneId: 'ms06', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord07-1', number: 'ORD-2026-0022', title: '全案储备-瓷砖铺贴', status: '意向期', milestoneId: 'ms07', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord07-2', number: 'ORD-2026-0023', title: '全案储备-填缝美缝', status: '意向期', milestoneId: 'ms07', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord07-3', number: 'ORD-2026-0024', title: '全案储备-阳角磨边', status: '意向期', milestoneId: 'ms07', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord08-1', number: 'ORD-2026-0025', title: '全案储备-油漆涂料', status: '意向期', milestoneId: 'ms08', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord08-2', number: 'ORD-2026-0026', title: '全案储备-底漆修补', status: '意向期', milestoneId: 'ms08', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord08-3', number: 'ORD-2026-0027', title: '全案储备-面刷滚刷', status: '意向期', milestoneId: 'ms08', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord09-1', number: 'ORD-2026-0028', title: '全案储备-卫浴洁具', status: '意向期', milestoneId: 'ms09', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord09-2', number: 'ORD-2026-0029', title: '全案储备-五金挂件', status: '意向期', milestoneId: 'ms09', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord09-3', number: 'ORD-2026-0030', title: '全案储备-打胶密封', status: '意向期', milestoneId: 'ms09', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord10-1', number: 'ORD-2026-0031', title: '全案储备-灯具选购', status: '意向期', milestoneId: 'ms10', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord10-2', number: 'ORD-2026-0032', title: '全案储备-开关插座', status: '意向期', milestoneId: 'ms10', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord10-3', number: 'ORD-2026-0033', title: '全案储备-布线校准', status: '意向期', milestoneId: 'ms10', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord11-1', number: 'ORD-2026-0034', title: '全案储备-软装窗帘', status: '意向期', milestoneId: 'ms11', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord11-2', number: 'ORD-2026-0035', title: '全案储备-窗轨安装', status: '意向期', milestoneId: 'ms11', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord11-3', number: 'ORD-2026-0036', title: '全案储备-垂挂调试', status: '意向期', milestoneId: 'ms11', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord12-1', number: 'ORD-2026-0037', title: '全案储备-全屋保洁', status: '意向期', milestoneId: 'ms12', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord12-2', number: 'ORD-2026-0038', title: '全案储备-甲醛检测', status: '意向期', milestoneId: 'ms12', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord12-3', number: 'ORD-2026-0039', title: '全案储备-异味清除', status: '意向期', milestoneId: 'ms12', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord13-1', number: 'ORD-2026-0040', title: '全案储备-智能安防', status: '意向期', milestoneId: 'ms13', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord13-2', number: 'ORD-2026-0041', title: '全案储备-报警系统', status: '意向期', milestoneId: 'ms13', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord13-3', number: 'ORD-2026-0042', title: '全案储备-中控调绘', status: '意向期', milestoneId: 'ms13', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord14-1', number: 'ORD-2026-0043', title: '全案储备-环境监测', status: '意向期', milestoneId: 'ms14', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord14-2', number: 'ORD-2026-0044', title: '全案储备-PM2.5监控', status: '意向期', milestoneId: 'ms14', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord14-3', number: 'ORD-2026-0045', title: '全案储备-过滤耗材', status: '意向期', milestoneId: 'ms14', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord15-1', number: 'ORD-2026-0046', title: '全案储备-净水系统', status: '意向期', milestoneId: 'ms15', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord15-2', number: 'ORD-2026-0047', title: '全案储备-滤芯预埋', status: '意向期', milestoneId: 'ms15', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord15-3', number: 'ORD-2026-0048', title: '全案储备-水路加压', status: '意向期', milestoneId: 'ms15', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord16-1', number: 'ORD-2026-0049', title: '全案储备-网络覆盖', status: '意向期', milestoneId: 'ms16', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord16-2', number: 'ORD-2026-0050', title: '全案储备-AP部署', status: '意向期', milestoneId: 'ms16', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord16-3', number: 'ORD-2026-0051', title: '全案储备-路由调优', status: '意向期', milestoneId: 'ms16', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord17-1', number: 'ORD-2026-0052', title: '全案储备-备用电源', status: '意向期', milestoneId: 'ms17', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord17-2', number: 'ORD-2026-0053', title: '全案储备-UPS安装', status: '意向期', milestoneId: 'ms17', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord17-3', number: 'ORD-2026-0054', title: '全案储备-续航测试', status: '意向期', milestoneId: 'ms17', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord18-1', number: 'ORD-2026-0055', title: '全案储备-维保协议', status: '意向期', milestoneId: 'ms18', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord18-2', number: 'ORD-2026-0056', title: '全案储备-权益细化', status: '意向期', milestoneId: 'ms18', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord18-3', number: 'ORD-2026-0057', title: '全案储备-客户回访', status: '意向期', milestoneId: 'ms18', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord19-1', number: 'ORD-2026-0058', title: '全案储备-结项报告', status: '意向期', milestoneId: 'ms19', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord19-2', number: 'ORD-2026-0059', title: '全案储备-手册编制', status: '意向期', milestoneId: 'ms19', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord19-3', number: 'ORD-2026-0060', title: '全案储备-流程归档', status: '意向期', milestoneId: 'ms19', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },

  { id: 'ord20-1', number: 'ORD-2026-0061', title: '全案储备-尾款核算', status: '意向期', milestoneId: 'ms20', budgetMin: 3.0, budgetMax: 3.0, statusCode: 'S00', statusName: '方案筹备中' },
  { id: 'ord20-2', number: 'ORD-2026-0062', title: '全案储备-票据开具', status: '意向期', milestoneId: 'ms20', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S01', statusName: '意向沟通中' },
  { id: 'ord20-3', number: 'ORD-2026-0063', title: '全案储备-满意度调查', status: '意向期', milestoneId: 'ms20', budgetMin: 0.5, budgetMax: 0.5, statusCode: 'S05', statusName: '客户决策中' },
]


const TOTAL_BUDGET = 100 // 万元

// ─── Layout Config ────────────────────────────────────────────────────────────

const VB_W = 1200

const X = {
  dateDot: 172,
  incomeLeft: 188,
  incomeRight: 250,
  // 巧妙绑定：以后只要动了 UI_CONFIG 里的间距，所有的右侧节点顺推过去，连线全部自适应重绘不留死角！
  get budgetLeft() { return this.incomeRight + UI_CONFIG.GAP_INC_TO_BUDGET },
  get budgetRight() { return this.budgetLeft + 44 }, // 总预算柱子本身宽度固定44
  get msLeft() { return this.budgetRight + UI_CONFIG.GAP_BUDGET_TO_MS },
  get msRight() { return this.msLeft + 186 },        // 里程碑容器自身宽度固定186
  get ordLeft() { return this.msRight + UI_CONFIG.GAP_MS_TO_ORD },
  get ordRight() { return this.ordLeft + 184 },      // 订单容器自身宽度固定184
  get ordLabelLeft() { return this.ordRight + 10 },
}

const CHART_TOP_MARGIN = 72
const CHART_BOTTOM_MARGIN = 50
const MS_GAP = 12
const ORD_GAP = 16

const TODAY_COLOR = '#F97316'
const INCOME_GAP = 20 // <-- 在此调整入金节点的垂直间隙 (像素值)
const INCOME_MIN_GAP = 16

// ─── Helpers ───────────────────────────────────────────────────────────────────

function rgba(hex: string, a: number): string {
  if (!hex) return `rgba(208,215,214,${a})`
  // 处理带 # 的色号
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

function bandPath(
  x1: number,
  top1: number,
  bot1: number,
  x2: number,
  top2: number,
  bot2: number,
  curveRatio: number = 0.5
): string {
  const mx = x1 + (x2 - x1) * curveRatio
  return (
    `M${x1},${top1} C${mx},${top1} ${mx},${top2} ${x2},${top2}` +
    ` L${x2},${bot2} C${mx},${bot2} ${mx},${bot1} ${x1},${bot1} Z`
  )
}

function normalizeOrderNumber(rawNumber: string): string {
  const raw = (rawNumber || '').trim()
  if (!raw) return raw

  // 兼容历史格式：PSO-OD-LHJCF-00001 / PSO-OD_LHJCF-00001
  const psoMatch = raw.match(/^PSO-OD[-_]([A-Z0-9]+)-(\d+)$/i)
  if (psoMatch) {
    const projectCode = psoMatch[1].toUpperCase()
    const seq = String(parseInt(psoMatch[2], 10)).padStart(5, '0')
    return `PSO-OD_${projectCode}-${seq}`
  }

  // 兼容 mock 格式：ORD-2026-0001 -> PSO-OD_LHJCF-00584（与现有主数据区间对齐）
  const ordMatch = raw.match(/^ORD-\d{4}-(\d+)$/i)
  if (ordMatch) {
    const seq = parseInt(ordMatch[1], 10) + 583
    return `PSO-OD_LHJCF-${String(seq).padStart(5, '0')}`
  }

  return raw
}

/** 生成状态展示文案：优先 statusCode + statusName，缺失时回退为 status（阶段） */
function formatStatusDisplay(ord: Order): string {
  if (ord.statusCode && ord.statusName) return `${ord.statusCode} ${ord.statusName}`
  return ord.status
}

/** 兜底：确保订单节点颜色与阶段一致，支持 statusCode 推断 */
function getOrderPhaseForColor(ord: Order): StatusGroup {
  const valid: StatusGroup[] = ['意向期', '订购期', '交付期', '验收期', '维保期']
  if (valid.includes(ord.status)) return ord.status
  const code = ord.statusCode || String(ord.status)
  if (code.startsWith('S11') || code.startsWith('S10')) return '维保期'
  if (code.startsWith('S07') || code.startsWith('S09') || code.startsWith('S08')) return '验收期'
  if (code.startsWith('S06') || code.startsWith('S13')) return '交付期'
  if (code.startsWith('S02') || code.startsWith('S03')) return '订购期'
  if (code.startsWith('S00') || code.startsWith('S01') || code.startsWith('S05')) return '意向期'
  if (code.startsWith('S04') || code.startsWith('S12')) return '验收期'
  return '意向期'
}

// ─── 核心算法：带下界约束的水桶分配算法 ─────────────────────────────────────
// 解决：既要确保节点之间的相对高度按金额比例诚实呈现，又要保证极小金额节点有一个能放下文字的保底高度。
function distributeHeights(
  items: { id: string; budget: number; customMinH?: number }[],
  targetTotalH: number,
  globalMinH: number
): Record<string, number> {
  const result: Record<string, number> = {}
  const unlocked = [...items]
  let remainingH = targetTotalH
  let remainingBudget = items.reduce((sum, item) => sum + item.budget, 0)

  // 极端情况保底：如果总高度甚至不够给所有人发低保，直接撑大总盘子
  const absoluteMinHSum = unlocked.reduce((sum, item) => sum + (item.customMinH ?? globalMinH), 0)
  if (remainingH < absoluteMinHSum) {
    remainingH = absoluteMinHSum
  }

  // 循环判定是否有低于保底高度的“困难户”
  let hasNewLocked = true
  while (hasNewLocked && unlocked.length > 0 && remainingBudget > 0) {
    hasNewLocked = false
    const currentRatio = remainingH / remainingBudget

    for (let i = unlocked.length - 1; i >= 0; i--) {
      const item = unlocked[i]
      const h = item.budget * currentRatio
      const minH = item.customMinH ?? globalMinH
      if (h <= minH) {
        // 发现困难户，锁定其底线高度
        result[item.id] = minH
        remainingH -= minH
        remainingBudget -= item.budget
        unlocked.splice(i, 1)
        hasNewLocked = true // 盘子被拿走一块，其他人得重新用剩下的钱和空间算比例，所以必须重测
      }
    }
  }

  // 剩下的空间由所有“大户”按自己预算的真正比例瓜分
  const finalRatio = remainingBudget > 0 ? remainingH / remainingBudget : 0
  for (const item of unlocked) {
    result[item.id] = item.budget * finalRatio
  }

  // 如果某些节点金额是0，上面处理后如果还在unlocked里，均摊剩下高度（兜底）
  if (remainingBudget === 0 && unlocked.length > 0) {
    const extra = remainingH / unlocked.length
    for (const item of unlocked) {
      result[item.id] = extra
    }
  }

  return result
}

// ─── 用户可见 UI 配置参数 ──────────────────────────────────────────────────
const UI_CONFIG = {
  /** 
   * 视觉缩放系数 (Height Scale Factor)
   * 如果觉得图表太臃肿，可调小此值（如 0.6）；如果觉得太扁平，可调大（如 1.2）。
   */
  HEIGHT_SCALE: 1.0,

  // TOTAL_HEIGHT: 1200, (已由倒推算法接管)
  // 调节指南：[里程碑色块最小高度] 控制每个里程碑节点哪怕只有 0.1w，也必须最低保留的高度，以容纳文字。
  MIN_MS_HEIGHT: 46,
  // 调节指南：[里程碑垂直间距] 里程碑板块之间留出的纵向缝隙。
  MS_GAP: 12,
  // 调节指南：[订单物理高度底座] 每个订单板块的最低保底像素高度。
  ORDER_MIN_H: 40,
  // 调节指南：[订单金额拉伸系数] 每 1w 金额额外增加的像素高度。调大此值会让大单看起来非常有排面。
  ORDER_PX_RATIO: 3,
  // 调节指南：[订单垂直间距] 最右侧订单板块之间留出的纵向缝隙。
  ORD_GAP: 20,

  // 调节指南：[节点自身透明度] 里程碑与订单本身的高亮层级
  OPACITY_NODE_NORMAL: 1,    // 鼠标未悬停或聚焦自身时的正常透明度
  OPACITY_NODE_MUTED: 0.5,  // 鼠标聚焦在其他节点时的变暗弱化透明度

  // 调节指南：[右侧主线连线透明度] 里程碑与订单区域连流向的透明感
  OPACITY_BAND_NORMAL: 0.1, // 鼠标未悬停时的默认透明度
  OPACITY_BAND_HOVER: 0.3,   // 鼠标悬停聚焦时的透明度（高亮强调）
  OPACITY_BAND_MUTED: 0.1,  // 鼠标悬停在其他节点时，未被聚焦连线的透明度（变暗弱化）

  // 调节指南：[连线平滑曲率] 收紧/转弯的位置占比
  // 0.5 为默认（在中点折弯）；越靠近 1，连线会越晚折向右侧节点；靠近 0 则提早折弯
  FLOW_CURVE_RATIO: 0.5,

  // 调节指南：[左侧入金连线透明度] 左侧入金汇流向总预算柱子的连线透明度
  OPACITY_INC_NORMAL: 0.1,  // 常态透明度
  OPACITY_INC_MUTED: 0.1,   // 其他节点激活时的变暗透明度

  // 调节指南：[各级大版块横向间距] 调整相邻两大容器版块之间的“水管/连线”的物理宽度
  GAP_INC_TO_BUDGET: 150,  // 入金层 -> 总预算层 的连线距离
  GAP_BUDGET_TO_MS: 150,   // 总预算层 -> 里程碑层 的连线距离
  GAP_MS_TO_ORD: 160,      // 里程碑层 -> 订单追踪 的连线距离
}

// ─── Computed Layout ──────────────────────────────────────────────────────────

// 全局辅助：判断里程碑的主状态（取所含订单中最早期的颜色）
// 阶段顺序：意向期 → 订购期 → 交付期 → 验收期 → 维保期
function getMsPrimaryStatus(msId: string, orders: Order[]): StatusGroup {
  const priority: StatusGroup[] = ['意向期', '订购期', '交付期', '验收期', '维保期']
  const ords = orders.filter((o) => o.milestoneId === msId)
  for (const sp of priority) {
    if (ords.some((o) => getOrderPhaseForColor(o) === sp)) return sp
  }
  return '意向期'
}

function useLayout(
  incomeEntries: IncomeEntry[],
  milestones: Milestone[],
  orders: Order[],
  totalBudget: number,
  expandedMsIds: string[],
  msIntentionCollapsed: boolean
) {
  return useMemo(() => {
    // ═══════════════════════════════════════════════════════════════════════
    // 【从右向左：订单基准倒推架构】
    // 1. pxPerWan: 由最小订单金额对应 40px 反推。
    // 2. 订单高度: 严格比例，无底座。
    // 3. 里程碑高度: 展开时物理包裹订单(含间距)，收起时保底 46px。
    // 4. 预算柱: 总高度对齐里程碑总高度，彩色区域对齐入金比例。
    // 5. 入金层: 范围严格限制在预算柱彩色部分。
    // ═══════════════════════════════════════════════════════════════════════

    // ---- 1. 计算全局比例尺 (根据订单) ----
    const validOrders = orders.filter(o => (o.budgetMin + o.budgetMax) > 0)
    const minOrderBudget = validOrders.length > 0
      ? Math.min(...validOrders.map(o => (o.budgetMin + o.budgetMax) / 2))
      : 1
    // 基准比例：(40px / 最小订单金额) * 缩放系数
    const pxPerWan = (40 / minOrderBudget) * UI_CONFIG.HEIGHT_SCALE

    // ---- 2. 预计算里程碑与订单布局 (处理展开收起) ----
    const ORD_GAP = 20
    const MS_GAP = 12
    let currentMsY = CHART_TOP_MARGIN

    const msLayout: any[] = []
    const ordLayout: any[] = []
    const collapsedLayout: any[] = []

    // 区分意向阶段 (用于折叠逻辑)
    const intentionMilestones = milestones.filter(m => getMsPrimaryStatus(m.id, orders) === '意向期')
    const otherMilestones = milestones.filter(m => getMsPrimaryStatus(m.id, orders) !== '意向期')

    // 处理意向阶段合并节点
    if (msIntentionCollapsed && intentionMilestones.length > 0) {
      const groupH = 80 // 折叠组给个明显高度
      msLayout.push({
        id: 'group_intention',
        name: `意向阶段里程碑 (${intentionMilestones.length}个)`,
        h: groupH,
        y: currentMsY,
        isGroup: true,
        memberIds: intentionMilestones.map(m => m.id),
        status: '意向期'
      })
      currentMsY += groupH + MS_GAP
    }

    // 全部收起时：里程碑按金额比例分配高度（最小 46px），与展开时订单逻辑一致
    const allCollapsed = expandedMsIds.length === 0
    const listToRender = msIntentionCollapsed ? otherMilestones : milestones
    const msItemsForDist = listToRender
      .filter(ms => orders.some(o => o.milestoneId === ms.id))
      .map(ms => ({
        id: ms.id,
        budget: orders.filter(o => o.milestoneId === ms.id).reduce((s, o) => s + (o.budgetMin + o.budgetMax) / 2, 0),
      }))
    const minMsBudget = msItemsForDist.length > 0 ? Math.min(...msItemsForDist.map(m => m.budget || 1)) : 1
    const targetCollapsedH = msItemsForDist.reduce((s, m) => s + (m.budget || 0), 0) * (UI_CONFIG.MIN_MS_HEIGHT / minMsBudget)
    const collapsedHeights = allCollapsed && msItemsForDist.length > 0
      ? distributeHeights(msItemsForDist, targetCollapsedH, UI_CONFIG.MIN_MS_HEIGHT)
      : {} as Record<string, number>

    listToRender.forEach((ms) => {
      const msOrders = orders.filter(o => o.milestoneId === ms.id)
      const isExpanded = expandedMsIds.includes(ms.id)

      let msH = UI_CONFIG.MIN_MS_HEIGHT

      if (msOrders.length > 0) {
        if (isExpanded) {
          // 展开状态：物理高度 = 所有订单高度 + 间距
          let innerOrdY = currentMsY
          msOrders.forEach((ord) => {
            const budget = (ord.budgetMin + ord.budgetMax) / 2
            const h = Math.max(2, budget * pxPerWan)
            ordLayout.push({ ...ord, y: innerOrdY, h, isExpanded: true })
            innerOrdY += h + ORD_GAP
          })
          msH = innerOrdY - ORD_GAP - currentMsY
        } else {
          // 收缩状态：全部收起时按金额高度，否则固定 46px
          msH = allCollapsed && collapsedHeights[ms.id] != null
            ? collapsedHeights[ms.id]
            : UI_CONFIG.MIN_MS_HEIGHT
          msOrders.forEach((ord) => {
            ordLayout.push({ ...ord, y: currentMsY, h: msH, isExpanded: false })
          })
        }
      }

      msLayout.push({ ...ms, y: currentMsY, h: msH })

      if (msOrders.length > 0) {
        collapsedLayout.push({
          id: `col_${ms.id}`,
          milestoneId: ms.id,
          y: isExpanded ? (currentMsY + msH / 2 - 20) : currentMsY,
          h: 40,
          count: msOrders.length,
          isExpanded
        })
      }

      currentMsY += msH + MS_GAP
    })

    // ---- 3. 预算柱与入金对齐逻辑 ----
    // 终极对齐：预算柱的总高度必须 100% 对齐里程碑侧的总垂直跨度（包含间距像素）
    // 但在预算柱侧，我们将这些间隙像素“分摊”给每一条连线的宽度，从而保持其“无缝紧贴”的实心感
    const budgetBot = currentMsY - MS_GAP
    const budgetTotalH = budgetBot - CHART_TOP_MARGIN

    // 计算入金实付比例 (彩色部分)
    const paidSoFar = incomeEntries.filter(i => !i.isFuture && !i.isToday).reduce((s, i) => s + i.amount, 0)
    const futureTotal = incomeEntries.filter(i => i.isFuture).reduce((s, i) => s + i.amount, 0)
    const paidRatio = Math.min(1, paidSoFar / (totalBudget || 1))
    const budgetColoredH = budgetTotalH * paidRatio

    // 入金层布局：已入金 + 未入金，总高度严格对齐预算柱
    const sortedAllIncome = [...incomeEntries]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const totalAmount = paidSoFar + futureTotal || 1
    const n = sortedAllIncome.length
    const gapsTotal = Math.max(0, n - 1) * INCOME_GAP
    const todayMinH = 28
    const heightsPool = budgetTotalH - gapsTotal - todayMinH
    const pxPerWanIncome = heightsPool / totalAmount

    let incAreaY = CHART_TOP_MARGIN
    const incomeLayout = sortedAllIncome.map((inc) => {
      const h = inc.isToday ? todayMinH : Math.max(4, inc.amount * pxPerWanIncome)
      const centerY = incAreaY + h / 2
      const node = { ...inc, h, actualY: centerY, idealY: centerY, timeRatio: 0 }
      incAreaY += h + INCOME_GAP
      return node
    })

    // 画布高度：入金层总高已对齐 budgetTotalH，取与里程碑侧较大值
    const incBot = incAreaY - INCOME_GAP
    const VB_H = Math.max(budgetBot, incBot) + CHART_BOTTOM_MARGIN

    return {
      msLayout,
      ordLayout,
      collapsedLayout,
      budgetTop: CHART_TOP_MARGIN,
      budgetH: budgetTotalH,
      budgetBot,
      budgetColoredH, // 传递给 SVG 用于绘制填充
      paidSoFar,
      futureTotal: incomeEntries.filter(i => i.isFuture).reduce((s, i) => s + i.amount, 0),
      incomeLayout,
      VB_H,
      availableHeight: budgetTotalH,
      totalBudget,
      pxPerWan,
    }
  }, [incomeEntries, milestones, orders, totalBudget, expandedMsIds, msIntentionCollapsed])
}

// ─── Legend Component ─────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {STATUS_LIST.map((s) => (
        <div key={s} className="flex items-center gap-1.5">
          <span
            className="shrink-0 rounded-full inline-block"
            style={{ width: 8, height: 8, background: STATUS_COLORS[s] }}
          />
          <span className="text-gray-500" style={{ fontSize: 12 }}>
            {s}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface BudgetSankeyProps {
  /** When provided, use this data instead of built-in mock. */
  data?: BudgetSankeyData | null
  /** Optional subtitle (e.g. project name). */
  subtitle?: string
  /** Override main heading (e.g. 订单预算树). */
  title?: string
  /** 外层已由面板包卡片时去掉内层白底卡片 */
  unstyled?: boolean
}

const animStyle = { transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }

function BudgetSankey({ data, subtitle, title, unstyled }: BudgetSankeyProps = {}) {
  const incomeEntries = data?.incomeEntries ?? INCOME_ENTRIES
  const rawMilestones = data?.milestones ?? MILESTONES
  const orders = data?.orders ?? ORDERS
  const totalBudget = data?.totalBudget ?? TOTAL_BUDGET

  // 动态向上汇总：里程碑的金额区间 100% 由子订单推导而来，确保绝对守恒
  const milestones = useMemo(() => {
    return rawMilestones.map((ms) => {
      const children = orders.filter((o) => o.milestoneId === ms.id)
      if (children.length === 0) return ms
      const budgetMin = children.reduce((s, o) => s + (o.budgetMin || 0), 0)
      const budgetMax = children.reduce((s, o) => s + (o.budgetMax || 0), 0)
      return {
        ...ms,
        budgetMin: Number(budgetMin.toFixed(2)),
        budgetMax: Number(budgetMax.toFixed(2))
      }
    })
  }, [rawMilestones, orders])

  const [expandedMsIds, setExpandedMsIds] = useState<string[]>([])
  const [hovered, setHovered] = useState<string | null>(null)
  const [msIntentionCollapsed, setMsIntentionCollapsed] = useState(false)

  // 判定是否激活 (用于连线高亮)
  const layout = useLayout(incomeEntries, milestones, orders, totalBudget, expandedMsIds, msIntentionCollapsed)
  const {
    msLayout,
    ordLayout,
    budgetTop,
    budgetH,
    budgetBot,
    msScale,
    paidSoFar,
    futureTotal,
    incomeLayout,
    VB_H,
    availableHeight,
    totalBudget: layoutTotalBudget,
  } = layout

  // 辅助函数：判断里程碑是否为最后一期彩色节点（MS12 / 验收期）
  // 辅助函数：判断里程碑是否为最后一期彩色节点（MS12 / 验收期）
  const msPrimaryStatus = useCallback((msId: string): StatusGroup => {
    return getMsPrimaryStatus(msId, orders)
  }, [orders])

  const getGradientColorAtRatio = useCallback((ratio: number) => {
    const incomeRatio = layoutTotalBudget > 0 ? (paidSoFar / layoutTotalBudget) : 0
    const feather = budgetH > 0 ? (FEATHER_PX / budgetH) : 0.01
    const start = Math.max(0, incomeRatio - feather)
    if (ratio < start) return INCOME_COLOR
    if (ratio > incomeRatio) return UNPAID_COLOR
    const factor = (ratio - start) / feather
    return interpolateColor(INCOME_COLOR, UNPAID_COLOR, factor)
  }, [paidSoFar, layoutTotalBudget, budgetH])



  const isLit = useCallback(
    (id: string): boolean => {
      if (!hovered) return true
      if (hovered === id) return true
      if (hovered.startsWith('ms')) {
        const ord = ordLayout.find((o) => o.id === id)
        return id === hovered || (!!ord && ord.milestoneId === hovered)
      }
      if (hovered.startsWith('ord')) {
        const ord = ordLayout.find((o) => o.id === hovered)
        if (!ord) return false
        return id === hovered || id === ord.milestoneId
      }
      return true
    },
    [hovered, ordLayout]
  )

  const bandOpacity = useCallback(
    (id: string): number => {
      if (!hovered) return UI_CONFIG.OPACITY_BAND_NORMAL
      return isLit(id) ? UI_CONFIG.OPACITY_BAND_HOVER : UI_CONFIG.OPACITY_BAND_MUTED
    },
    [hovered, isLit]
  )

  const incBandOpacity = !hovered ? UI_CONFIG.OPACITY_INC_NORMAL : UI_CONFIG.OPACITY_INC_MUTED

  // 【核心重构：双向喇叭模型】
  const msBudgetSegments = useMemo(() => {
    // 方案 B：张力喇叭模型。左侧（预算柱侧）严丝合缝紧贴，右侧（里程碑侧）发散对齐。
    const totalMsBudg = milestones.reduce((s, m) => s + (m.budgetMin + m.budgetMax) / 2, 0)
    const groupIntention = msLayout.find(n => n.id === 'group_intention')
    let accumLeftY = budgetTop

    return milestones.map((ms) => {
      const b = (ms.budgetMin + ms.budgetMax) / 2
      // 预算柱侧高度占位：纯按金额权重在紧凑的 budgetH 中分摊
      const hLeft = (b / (totalMsBudg || 1)) * budgetH
      const segTop = accumLeftY
      const segBot = accumLeftY + hLeft
      accumLeftY = segBot

      // 里程碑侧对齐物理色块
      let destY = 0, destH = 0
      if (msIntentionCollapsed && getMsPrimaryStatus(ms.id, orders) === '意向期') {
        destY = groupIntention?.y || 0
        destH = groupIntention?.h || 0
      } else {
        const node = msLayout.find(m => m.id === ms.id)
        destY = node?.y || 0
        destH = node?.h || 0
      }
      return { id: ms.id, segTop, segBot, y: destY, h: destH }
    })
  }, [milestones, budgetTop, budgetH, msLayout, msIntentionCollapsed, orders])

  const incSegments = useMemo(() => {
    // 方案 B：汇聚模型。左侧（入金节点）有间隙，右侧（预算柱侧）无缝紧贴。
    // 排除 amount<=0 的节点（如「今天」时间标记），避免无节点却有 flow 的异常
    let accumRightY = budgetTop
    const paidIncomes = incomeLayout.filter(i => !i.isFuture && i.amount > 0)

    return paidIncomes.map((inc) => {
      const hRight = (inc.amount / (paidSoFar || 1)) * (layout.budgetColoredH || 0)
      const top = accumRightY
      const bot = accumRightY + hRight
      accumRightY = bot
      return { inc, budgetTop: top, budgetBot: bot }
    })
  }, [budgetTop, layout.budgetColoredH, incomeLayout, paidSoFar])

  const handleBudgetClick = useCallback(() => {
    message.info(`预计总预算：¥${layoutTotalBudget}w`, 3)
  }, [layoutTotalBudget])

  const handleOrderClick = useCallback((ord: Order) => {
    const orderNumber = normalizeOrderNumber(ord.number)
    const amountStr = ord.budgetMin === ord.budgetMax ? String(ord.budgetMin) : `${ord.budgetMin}~${ord.budgetMax}`
    const statusStr = formatStatusDisplay(ord)
    message.info(
      `${orderNumber} · ${ord.title} · ${statusStr} · ¥${amountStr}w`,
      3.5
    )
  }, [])

  const expandAll = () => setExpandedMsIds(milestones.map(m => m.id))
  const collapseAll = () => setExpandedMsIds([])

  const todayIncome = incomeLayout.find((inc) => inc.isToday)
  const todayY = todayIncome ? todayIncome.actualY + todayIncome.h / 2 : null

  // 全部展开/收起逻辑整合
  const allExpanded = expandedMsIds.length === milestones.length
  const toggleAll = () => {
    if (allExpanded) setExpandedMsIds([])
    else setExpandedMsIds(milestones.map(m => m.id))
  }

  // 意向阶段专项逻辑
  const intentionIds = milestones.filter(m => msPrimaryStatus(m.id) === '意向期').map(m => m.id)
  const allIntentionExpanded = intentionIds.length > 0 && intentionIds.every(id => expandedMsIds.includes(id))
  const toggleIntention = () => {
    if (allIntentionExpanded) {
      setExpandedMsIds(prev => prev.filter(id => !intentionIds.includes(id)))
    } else {
      setExpandedMsIds(prev => Array.from(new Set([...prev, ...intentionIds])))
    }
  }

  const budgetGradientStops = useMemo(() => {
    const incomeRatio = layoutTotalBudget > 0 ? (paidSoFar / layoutTotalBudget) : 0
    const featherRatio = budgetH > 0 ? (FEATHER_PX / budgetH) : 0.01

    // 我们在 incomeRatio 处做羽化过渡：从金黄到背景灰
    return [
      { offset: '0%', color: INCOME_COLOR },
      { offset: `${Math.max(0, incomeRatio - featherRatio) * 100}%`, color: INCOME_COLOR },
      { offset: `${incomeRatio * 100}%`, color: UNPAID_COLOR },
      { offset: '100%', color: UNPAID_COLOR },
    ]
  }, [paidSoFar, layoutTotalBudget, budgetH])

  const chartBg = '#F9FAFB'

  const outerCls = unstyled
    ? 'w-full overflow-hidden'
    : 'w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
  const headCls = unstyled
    ? 'flex flex-wrap items-center justify-between gap-3 pb-3 mb-1'
    : 'flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100'
  const footCls = unstyled
    ? 'px-0 pt-3 mt-2 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2'
    : 'px-5 py-2.5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2'

  return (
    <div className={outerCls}>
      {/* Header */}
      <div className={headCls}>
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-gray-800 leading-tight font-bold">{title ?? "项目预算桑基图"}</h2>
            <p className="text-gray-400 leading-snug mt-0.5" style={{ fontSize: 12 }}>
              {subtitle ?? "Design Voyage"} · 总预算 {layoutTotalBudget}w
            </p>
          </div>
          <div className="flex items-center bg-gray-50 p-1 rounded-lg border border-gray-100 ml-2">
            <button
              onClick={toggleAll}
              className={`px-3 py-1 text-[11px] font-bold rounded transition-all ${allExpanded ? "text-red-500 hover:bg-red-50" : "text-gray-500 hover:text-blue-600 hover:bg-white"
                }`}
            >
              {allExpanded ? "全部收起" : "全部展开"}
            </button>
          </div>
        </div>
        <Legend />
      </div>


      {/* 2. SVG Chart Area */}
      <div className="w-full overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: VB_W }}>
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            width={VB_W}
            style={{ display: 'block' }}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              {/* Main Budget Column Gradient (Dynamic Rainbow + Gray) */}
              <linearGradient id="gradBudget" x1="0" y1="0" x2="0" y2="1">
                {budgetGradientStops.map((stop, idx) => (
                  <stop key={idx} offset={stop.offset} stopColor={stop.color} />
                ))}
              </linearGradient>

              {/* Inflow Glow Gradients: From Gold to Exact Budget Color */}
              {incSegments.map(({ inc }) => {
                return (
                  <linearGradient key={`ifg-${inc.id}`} id={`ifg-${inc.id}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={inc.isUnpaid ? UNPAID_COLOR : INCOME_COLOR} />
                    <stop offset="100%" stopColor={INCOME_COLOR} />
                  </linearGradient>
                )
              })}

              {/* Milestone Glow Gradients: Budget exact color to MS node color */}
              {msBudgetSegments.map((seg) => {
                const midY = (seg.segTop + seg.segBot) / 2
                const ratio = budgetH > 0 ? (midY - budgetTop) / budgetH : 0
                const leftColor = getGradientColorAtRatio(ratio)
                const rightColor = STATUS_COLORS[msPrimaryStatus(seg.id)]
                return (
                  <linearGradient key={`mfg-${seg.id}`} id={`mfg-${seg.id}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={leftColor} />
                    <stop offset="100%" stopColor={rightColor} />
                  </linearGradient>
                )
              })}

              {/* Order Glow Gradients: From MS color to Order Status color */}
              {ordLayout.map((ord) => {
                const c = STATUS_COLORS[getOrderPhaseForColor(ord)]
                const msc = STATUS_COLORS[msPrimaryStatus(ord.milestoneId)]
                return (
                  <linearGradient key={`ofg-${ord.id}`} id={`ofg-${ord.id}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={msc} />
                    <stop offset="100%" stopColor={c} />
                  </linearGradient>
                )
              })}
            </defs>

            {/* Background */}
            <rect x={0} y={0} width={VB_W} height={VB_H} fill={chartBg} />

            {/* Column labels */}
            {[
              { cx: (X.dateDot + X.incomeRight) / 2 - 10, label: '入金' },
              { cx: (X.budgetLeft + X.budgetRight) / 2, label: '总预算' },
              { cx: (X.msLeft + X.msRight) / 2, label: '里程碑' },
              { cx: (X.ordLeft + X.ordRight) / 2, label: '订单追踪' },
            ].map(({ cx, label }) => (
              <text key={label} x={cx} y={50} textAnchor="middle" fill="#6B7280" fontSize={14} fontWeight={600}>{label}</text>
            ))}

            {/* Timeline Line */}
            <line x1={X.dateDot} y1={CHART_TOP_MARGIN} x2={X.dateDot} y2={VB_H - CHART_BOTTOM_MARGIN} stroke="#E2E8F0" strokeWidth={1} />

            {/* ==== 动态流向渲染：入金层 -> 总预算层 ==== */}
            {incSegments.map(({ inc, budgetTop: bt, budgetBot: bb }) => {
              const incEntry = incomeLayout.find(i => i.id === inc.id)!
              const iy = incEntry.actualY
              // 【核心Bug修复】：弃用外部固定的 msScale，改用刚由水桶算法精密算出的入金节点自身真实高度 (h / 2)
              // 这保证了由左至右连线边缘的完美衔接和流出的物理体积等价
              const halfH = incEntry.h / 2
              return (
                <path
                  key={`iflow-${inc.id}`}
                  d={bandPath(X.incomeRight, iy - halfH, iy + halfH, X.budgetLeft, bt, bb)}
                  fill={`url(#ifg-${inc.id})`}
                  opacity={incBandOpacity}
                />
              )
            })}

            {/* Milestone Paths */}
            {msBudgetSegments.map((seg) => (
              <path
                key={`mflow-${seg.id}`}
                d={bandPath(X.budgetRight, seg.segTop, seg.segBot, X.msLeft, seg.y, seg.y + seg.h, UI_CONFIG.FLOW_CURVE_RATIO)}
                fill={`url(#mfg-${seg.id})`}
                opacity={bandOpacity(seg.id)}
                onMouseEnter={() => setHovered(seg.id)}
              />
            ))}

            {/* Order Paths */}
            {msLayout.map((ms) => {
              const isExpanded = expandedMsIds.includes(ms.id)
              const msOrders = orders.filter((o) => o.milestoneId === ms.id)
              if (msOrders.length === 0) return null

              const lit = isLit(ms.id)
              const col = layout.collapsedLayout.find((cl) => cl.milestoneId === ms.id)!

              // 展开状态与收起状态通用：按订单底层永远渲染所有 DOM，借此触发 CSS transition 的原生物理尺寸形变
              const siblingTotalBudg = msOrders.reduce((s, o) => s + (o.budgetMin + o.budgetMax) / 2, 0)
              let currentOffsetRatio = 0

              return msOrders.map((ord) => {
                const ratio = siblingTotalBudg > 0 ? ((ord.budgetMin + ord.budgetMax) / 2) / siblingTotalBudg : 0

                // 左侧锚点：展开时按比例分割，收起时第一条覆盖全高、其余保持比例位置(opacity=0不可见)
                const isFirstInGroup = ord.id === msOrders[0].id
                const msTop = isExpanded
                  ? ms.y + currentOffsetRatio * ms.h
                  : (isFirstInGroup ? ms.y : ms.y + currentOffsetRatio * ms.h)
                const msBot = isExpanded
                  ? ms.y + currentOffsetRatio * ms.h + ratio * ms.h
                  : (isFirstInGroup ? ms.y + ms.h : ms.y + currentOffsetRatio * ms.h + ratio * ms.h)
                currentOffsetRatio += ratio

                const ordNode = ordLayout.find((o) => o.id === ord.id)!

                // ！！！动态合并形变！！！
                // 收起时，这些子线条的所有右边缘都会非常生猛但顺滑地“挤”向圆球的坐标范围。
                const destTop = isExpanded ? ordNode.y : col.y + 19
                const destBot = isExpanded ? (ordNode.y + ordNode.h) : col.y + 21

                // ！！！反馈1：收起时颜色统一！！！
                // 展开时用各订单对应的渐变色 url，收起时统一回退为里程碑的主状态单色
                const ps = msPrimaryStatus(ms.id)
                const milestoneColor = STATUS_COLORS[ps]
                const flowFill = isExpanded ? `url(#ofg-${ord.id})` : milestoneColor

                // 光晕连线透明度判定：收敛时，褪去原本光环变成漏斗光晕
                // 当收起时，只有该组第一个订单渲染透明度，其余订单透明度归零，防止 N 条 0.05 路径叠加。
                const flowOpacity = isExpanded
                  ? bandOpacity(ord.id)
                  : (isFirstInGroup ? (lit ? 0.3 : 0.05) : 0)

                return (
                  <path
                    key={`oflow-${ord.id}`}
                    style={{ ...animStyle, cursor: 'pointer' }}
                    d={bandPath(X.msRight, msTop, msBot, X.ordLeft, destTop, destBot, UI_CONFIG.FLOW_CURVE_RATIO)}
                    fill={flowFill}
                    opacity={flowOpacity}
                    onMouseEnter={() => setHovered(ord.id)}
                    onClick={() => handleOrderClick(ord)}
                  />
                )
              })
            })}

            {incomeLayout.map((inc) => {
              const y = inc.actualY
              const barH = inc.h
              const timelineY = y + barH / 2
              const isPast = !inc.isFuture && !inc.isToday
              const dotColor = inc.isToday ? TODAY_COLOR : isPast ? INCOME_COLOR : '#CBD5E1'
              const barColor = inc.isUnpaid ? '#E2E8F0' : isPast ? INCOME_COLOR : '#E2E8F0'
              const textColor = inc.isUnpaid ? '#64748B' : isPast ? '#111827' : '#94A3B8'
              return (
                <g key={inc.id}>
                  {/* 时间轴锚点在节点下沿，已入金与未入金均显示 */}
                  <line
                    x1={X.dateDot + 6}
                    y1={timelineY}
                    x2={X.incomeLeft - 2}
                    y2={timelineY}
                    stroke={isPast ? INCOME_COLOR : inc.isUnpaid ? '#CBD5E1' : '#CBD5E1'}
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    opacity={0.55}
                  />
                  <circle
                    cx={X.dateDot}
                    cy={timelineY}
                    r={4.5}
                    fill={dotColor}
                    stroke="white"
                    strokeWidth={1.5}
                  />

                  {inc.amount > 0 && (
                    <>
                      <rect
                        x={X.incomeLeft}
                        y={y - barH / 2}
                        width={X.incomeRight - X.incomeLeft}
                        height={barH}
                        rx={3}
                        fill={barColor}
                        opacity={0.88}
                      />
                      <text
                        x={(X.incomeLeft + X.incomeRight) / 2}
                        y={y + 5}
                        textAnchor="middle"
                        fill={textColor}
                        fontSize={14}
                        fontWeight={600}
                      >
                        ¥{inc.amount}w
                      </text>
                    </>
                  )}

                  {inc.isToday ? (
                    <g>
                      <rect
                        x={12}
                        y={y - 12}
                        width={78}
                        height={24}
                        rx={12}
                        fill="none"
                        stroke={STATUS_COLORS['订购期']}
                        strokeWidth={1.2}
                      />
                      <text
                        x={51}
                        y={y + 5}
                        textAnchor="middle"
                        fill={STATUS_COLORS['订购期']}
                        fontSize={13}
                        fontWeight={600}
                      >
                        {inc.displayDate}
                      </text>
                      <rect
                        x={94}
                        y={y - 10}
                        width={38}
                        height={20}
                        rx={10}
                        fill={STATUS_COLORS['验收期']}
                      />
                      <text
                        x={113}
                        y={y + 5}
                        textAnchor="middle"
                        fill="white"
                        fontSize={12}
                        fontWeight={700}
                      >
                        今日
                      </text>
                    </g>
                  ) : (
                    <text x={12} y={timelineY + 4} fill={textColor} fontSize={13}>
                      {inc.displayDate}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Main Budget Column: Single layer with gradient for Paid-to-Unpaid transition */}
            <g
              style={{ cursor: 'pointer' }}
              onClick={handleBudgetClick}
              onMouseEnter={() => setHovered('budget')}
              onMouseLeave={() => setHovered(null)}
            >
              <rect
                x={X.budgetLeft}
                y={budgetTop}
                width={X.budgetRight - X.budgetLeft}
                height={budgetH}
                rx={7}
                fill="url(#gradBudget)"
                className="transition-all duration-500"
              />
              <text
                x={(X.budgetLeft + X.budgetRight) / 2}
                y={budgetTop - 8}
                textAnchor="middle"
                fill="#6B7280"
                fontSize={11}
                fontWeight={600}
              >
                ¥{layoutTotalBudget}w
              </text>
            </g>

            {msLayout.map((ms) => {
              const ps = msPrimaryStatus(ms.id)
              const c = STATUS_COLORS[ps]
              const lit = isLit(ms.id)
              const isExpanded = expandedMsIds.includes(ms.id)
              const isGroup = ms.isGroup
              const bw = X.msRight - X.msLeft
              const h = ms.h

              return (
                <g
                  key={ms.id}
                  opacity={lit ? UI_CONFIG.OPACITY_NODE_NORMAL : UI_CONFIG.OPACITY_NODE_MUTED}
                  style={{ ...animStyle, cursor: 'pointer', pointerEvents: 'auto' }}
                  onMouseEnter={() => setHovered(ms.id === 'group_intention' ? 'intention_group' : ms.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isGroup) {
                      toggleIntention()
                    } else {
                      setExpandedMsIds((prev) =>
                        prev.includes(ms.id) ? prev.filter((i) => i !== ms.id) : [...prev, ms.id]
                      )
                    }
                  }}
                >
                  {/* 叠层效果：如果是组，背后多画两个偏移的矩形 */}
                  {isGroup && (
                    <>
                      <rect x={X.msLeft + 4} y={ms.y + 4} width={bw} height={h} rx={5} fill={rgba(c, 0.05)} stroke={rgba(c, 0.1)} />
                      <rect x={X.msLeft + 2} y={ms.y + 2} width={bw} height={h} rx={5} fill={rgba(c, 0.08)} stroke={rgba(c, 0.2)} />
                    </>
                  )}

                  <rect
                    x={X.msLeft}
                    y={ms.y}
                    width={bw}
                    height={h}
                    rx={5}
                    fill={rgba(c, 0.1)}
                  />
                  <rect
                    x={X.msLeft}
                    y={ms.y}
                    width={4}
                    height={h}
                    rx={2}
                    fill={c}
                    opacity={0.75}
                  />
                  <rect
                    x={X.msLeft}
                    y={ms.y}
                    width={bw}
                    height={h}
                    rx={5}
                    fill="none"
                    stroke={rgba(c, 0.35)}
                    strokeWidth={1}
                  />

                  {/* 里程碑文本渲染：反馈2 - 展开时垂直居中并影藏金额 */}
                  <motion.text
                    initial={false}
                    animate={{
                      y: (isExpanded || isGroup) ? ms.y + h / 2 + 5 : ms.y + 19,
                      opacity: 1
                    }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    x={X.msLeft + 10}
                    fill="#1F2937"
                    fontSize={13}
                    fontWeight={600}
                  >
                    {ms.name}
                  </motion.text>
                  {!isGroup && (
                    <motion.text
                      initial={false}
                      animate={{
                        y: isExpanded ? ms.y + h / 2 + 5 : ms.y + 36,
                        opacity: isExpanded ? 0 : 1
                      }}
                      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                      x={X.msLeft + 10}
                      fill="#6B7280"
                      fontSize={11}
                      fontWeight={400}
                      style={{ pointerEvents: 'none' }}
                    >
                      ¥{ms.budgetMin === ms.budgetMax ? ms.budgetMin : ms.budgetMin + '~' + ms.budgetMax}w
                    </motion.text>
                  )}
                </g>
              )
            })}

            {ordLayout.map((ord) => {
              const c = STATUS_COLORS[getOrderPhaseForColor(ord)]
              const lit = isLit(ord.id)
              const bw = X.ordRight - X.ordLeft
              // 直接使用经水桶算法完美兜底后的真实计算高度 ord.h，根除 Math.max 越权导致的渲染踩踏
              const h = ord.h

              return (
                <g
                  key={`ogroup-${ord.id}`}
                  opacity={ord.isExpanded ? (lit ? UI_CONFIG.OPACITY_NODE_NORMAL : UI_CONFIG.OPACITY_NODE_MUTED) : 0}
                  style={{ ...animStyle, cursor: 'pointer', pointerEvents: ord.isExpanded ? 'auto' : 'none' }}
                  onMouseEnter={() => setHovered(ord.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleOrderClick(ord)}
                >
                  <rect
                    style={animStyle}
                    x={X.ordLeft}
                    y={ord.y}
                    width={bw}
                    height={h}
                    rx={4}
                    fill={rgba(c, 0.07)}
                  />
                  <rect
                    style={animStyle}
                    x={X.ordLeft}
                    y={ord.y}
                    width={bw}
                    height={h}
                    rx={4}
                    fill="none"
                    stroke={rgba(c, 0.3)}
                    strokeWidth={1}
                  />
                  <rect
                    style={animStyle}
                    x={X.ordRight - 4}
                    y={ord.y}
                    width={4}
                    height={h}
                    rx={2}
                    fill={c}
                    opacity={0.8}
                  />

                  <circle
                    style={animStyle}
                    cx={X.ordLeft + 11}
                    cy={ord.y + 14}
                    r={3.5}
                    fill={c}
                    opacity={0.7}
                  />

                  <text
                    style={animStyle}
                    x={X.ordLeft + 20}
                    y={ord.y + 19}
                    fill="#1F2937"
                    fontSize={13}
                    fontWeight={600}
                  >
                    {normalizeOrderNumber(ord.number)}
                  </text>
                  <text
                    style={animStyle}
                    x={X.ordLeft + 20}
                    y={ord.y + 36}
                    fill="#6B7280"
                    fontSize={11}
                    fontWeight={400}
                  >
                    ¥{ord.budgetMin === ord.budgetMax ? ord.budgetMin : ord.budgetMin + '~' + ord.budgetMax}w · {formatStatusDisplay(ord)}
                  </text>
                </g>
              )
            })}

            {layout.collapsedLayout.map((col) => {
              const ms = msLayout.find((m) => m.id === col.milestoneId)!
              const c = STATUS_COLORS[msPrimaryStatus(ms.id)]
              return (
                <g
                  key={col.id}
                  style={{ ...animStyle, cursor: 'pointer', pointerEvents: col.isExpanded ? 'none' : 'auto', opacity: col.isExpanded ? 0 : (hovered && !hovered.includes(col.milestoneId) ? 0.3 : 1) }}
                  onClick={() => setExpandedMsIds((prev) => [...prev, col.milestoneId])}
                  onMouseEnter={() => setHovered(`col-${col.milestoneId}`)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <circle style={animStyle} cx={X.ordLeft + 26} cy={col.y + 20} r={20} fill={c} opacity={0.15} />
                  <circle style={animStyle} cx={X.ordLeft + 26} cy={col.y + 20} r={14} fill={c} />
                  <text style={animStyle} x={X.ordLeft + 26} y={col.y + 24} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={600}>
                    {col.count}
                  </text>
                  <text style={animStyle} x={X.ordLeft + 56} y={col.y + 24} fill="#6B7280" fontSize={13} fontWeight={500}>
                    展开 {col.count} 个订单
                  </text>
                </g>
              )
            })}

            {todayY !== null && (
              <line
                x1={X.dateDot}
                y1={todayY}
                x2={X.msLeft}
                y2={todayY}
                stroke={TODAY_COLOR}
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.4}
              />
            )}
          </svg>
        </div>
      </div>

      <div className={footCls}>
        <span className="text-gray-400" style={{ fontSize: 11 }}>
          横向滑动查看完整图表 · 点击节点查看详情
        </span>
        <span className="text-gray-400" style={{ fontSize: 11 }}>
          已入金 ¥{paidSoFar}w / 总预算 ¥{layoutTotalBudget}w
        </span>
      </div>
    </div>
  )
}

export default BudgetSankey
