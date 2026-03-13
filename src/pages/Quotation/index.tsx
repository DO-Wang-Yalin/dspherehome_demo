import React, { useState } from "react";
import {
  FileText,
  User,
  MapPin,
  DollarSign,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { DesignDetails } from "./components/DesignDetails";
import { ProductDetails } from "./components/ProductDetails";
import { ConstructionDetails } from "./components/ConstructionDetails";
import { SignatureModal } from "./components/SignatureModal";
import { FeedbackModal } from "./components/FeedbackModal";
import { toast } from "sonner";

// 模拟数据
const quotationData = {
  orderNumber: "EPC-2026-0115-001",
  date: "2026年01月15日",
  customer: {
    name: "张先生",
    contact: "138-0000-0000",
    address: "上海市浦东新区世纪大道1000号",
    projectArea: "120㎡",
    projectType: "住宅装修",
  },
  pricing: {
    design: 36000,
    product: 156000,
    construction: 88000,
    total: 280000,
  },
  designItems: [
    {
      id: 1,
      item: "平面布局设计",
      unit: "套",
      quantity: 1,
      unitPrice: 8000,
      amount: 8000,
      explanation:
        "包含全屋平面布局方案设计，根据您的生活习惯和家庭成员需求，优化空间布局，提供3个方案供选择。包括：客厅、餐厅、厨房、卧室、卫生间等所有功能区的规划设计，以及家具摆放建议。设计师会进行2-3次现场测量和沟通，确保方案完全符合您的需求。",
    },
    {
      id: 2,
      item: "效果图设计",
      unit: "张",
      quantity: 4,
      unitPrice: 3000,
      amount: 12000,
      explanation:
        "提供4张高清3D效果图，包括客厅、主卧、餐厅、厨房各1张。采用专业3D建模软件制作，真实还原装修后的效果，包含灯光、材质、家具等细节。每张效果图提供2次免费修改机会，确保达到您的预期效果。",
    },
    {
      id: 3,
      item: "施工图深化设计",
      unit: "套",
      quantity: 1,
      unitPrice: 12000,
      amount: 12000,
      explanation:
        "包含全套施工图纸：平面布置图、墙体拆改图、地面铺装图、天花吊顶图、灯具定位图、开关插座图、水路改造图、电路改造图、立面图等。所有图纸均符合施工规范，标注详细尺寸和材料说明，确保施工队能够准确施工。",
    },
    {
      id: 4,
      item: "软装设计方案",
      unit: "套",
      quantity: 1,
      unitPrice: 4000,
      amount: 4000,
      explanation:
        "提供整体软装搭配方案，包括窗帘、地毯、装饰画、摆件、绿植等软装元素的选择和搭配建议。提供色彩搭配方案和软装采购清单，帮助您打造温馨舒适的家居氛围。",
    },
  ],
  productItems: [
    {
      id: 1,
      item: "客厅瓷砖（800x800mm）",
      brand: "马可波罗",
      unit: "㎡",
      quantity: 40,
      unitPrice: 280,
      amount: 11200,
      explanation:
        "选用马可波罗品牌800x800mm全抛釉瓷砖，硬度高、耐磨性强，表面光洁度好，易于清洁。此规格适合客厅使用，可以减少缝隙，视觉效果更大气。价格包含瓷砖本身、运费及上楼费用。预留5%损耗，实际用量约42㎡。",
    },
    {
      id: 2,
      item: "实木复合地板",
      brand: "圣象",
      unit: "㎡",
      quantity: 60,
      unitPrice: 380,
      amount: 22800,
      explanation:
        "圣象F4星环保标准实木复合地板，甲醛释放量远低于国标，更环保健康。三层实木结构，脚感舒适,表层为3mm实木，耐磨层厚度达标。包含地板、防潮垫、踢脚线及配套辅料。适合卧室、书房等区域铺设。",
    },
    {
      id: 3,
      item: "整体橱柜",
      brand: "欧派",
      unit: "延米",
      quantity: 6,
      unitPrice: 3200,
      amount: 19200,
      explanation:
        "欧派整体橱柜，包含地柜、吊柜及台面。柜体采用E0级环保板材，台面为石英石材质，耐高温、耐磨、易清洁。五金件使用百隆或海蒂诗品牌，开合顺畅耐用。包含设计、测量、生产、安装及售后服务。6延米包含标准配置（地柜4米+吊柜2米）。",
    },
    {
      id: 4,
      item: "卫浴套装",
      brand: "科勒",
      unit: "套",
      quantity: 2,
      unitPrice: 8500,
      amount: 17000,
      explanation:
        "科勒卫浴套装，每套包含：马桶（虹吸式静音）、浴室柜（含镜柜）、花洒套装（顶喷+手持）、龙头（冷热水龙头）。采用优质陶瓷材质，表面光滑易清洁。五金件为铜质镀铬，防锈耐用。2套分别用于主卫和客卫，包含安装调试服务。",
    },
    {
      id: 5,
      item: "室内门",
      brand: "TATA",
      unit: "樘",
      quantity: 5,
      unitPrice: 2800,
      amount: 14000,
      explanation:
        "TATA静音门，实木复合材质，内部为实木龙骨+蜂窝纸填充结构，隔音效果好。表面为高温烤漆工艺，颜色均匀，易于清洁。包含门扇、门套、门锁（静音锁）、合页等全套五金配件。5樘门分别用于3个卧室、1个书房、1个厨房。包含测量、安装及售后服务。",
    },
    {
      id: 6,
      item: "定制衣柜",
      brand: "索菲亚",
      unit: "㎡",
      quantity: 18,
      unitPrice: 1200,
      amount: 21600,
      explanation:
        "索菲亚定制衣柜，采用E0级实木颗粒板材，环保健康。根据卧室空间定制设计，合理规划挂衣区、叠衣区、被褥区等功能分区。包含柜体、柜门（推拉门或平开门）、内部五金配件、抽屉、裤架等。18㎡包含3个卧室的衣柜（投影面积计算）。包含免费上门测量、设计、安装。",
    },
    {
      id: 7,
      item: "灯具套装",
      brand: "雷士照明",
      unit: "套",
      quantity: 1,
      unitPrice: 8800,
      amount: 8800,
      explanation:
        "雷士照明全屋灯具套装，包含：客厅主灯（LED吸顶灯/吊灯）、餐厅吊灯、卧室灯、厨卫灯、过道灯、筒灯、射灯等全屋所需灯具。采用LED光源，节能环保，光效柔和护眼。支持分段调光，满足不同场景需求。包含灯具、光源、安装配件及安装服务。",
    },
    {
      id: 8,
      item: "开关插座",
      brand: "施耐德",
      unit: "套",
      quantity: 1,
      unitPrice: 3200,
      amount: 3200,
      explanation:
        "施耐德开关插座全屋套装，约60-80个点位。采用进口PC材料，阻燃抗冲击。内部为锡磷青铜材质，导电性好，使用寿命长。包含单开、双开、三开开关，五孔、三孔、USB插座等各类型号。表面工艺细腻，手感舒适。包含产品及安装调试。",
    },
    {
      id: 9,
      item: "五金配件",
      brand: "汇泰龙",
      unit: "套",
      quantity: 1,
      unitPrice: 2400,
      amount: 2400,
      explanation:
        "汇泰龙卫浴五金配件套装，包含：毛巾杆、浴巾架、纸巾盒、衣钩、马桶刷架、置物架等。采用304不锈钢或太空铝材质，表面拉丝或镀铬工艺，防水防锈。安装稳固，承重力强。包含2个卫生间所需的全部五金配件及安装。",
    },
    {
      id: 10,
      item: "其他辅材",
      brand: "-",
      unit: "批",
      quantity: 1,
      unitPrice: 35800,
      amount: 35800,
      explanation:
        "包含装修所需的各类辅材：水泥、黄沙、腻子粉、乳胶漆、防水涂料、玻璃胶、美缝剂、石膏板、轻钢龙骨、木工板、水管、电线、网线、开关底盒、角阀、地漏、各类螺丝钉等辅助材料。所有材料均选用环保达标产品，满足整个装修工程需求。",
    },
  ],
  constructionItems: [
    {
      id: 1,
      item: "墙体拆除与新建",
      unit: "㎡",
      quantity: 25,
      unitPrice: 180,
      amount: 4500,
      explanation:
        "根据设计方案拆除部分非承重墙，并新建部分墙体（如厨房、卫生间隔断等）。拆除工作包含墙体拆除、建筑垃圾清理、下楼及外运。新建墙体采用轻质砖砌筑，包含砌筑、抹灰找平等工序。施工过程中会做好成品保护，确保不损坏其他区域。",
    },
    {
      id: 2,
      item: "水电改造工程",
      unit: "㎡",
      quantity: 120,
      unitPrice: 150,
      amount: 18000,
      explanation:
        "包含全屋水电路改造。水路改造：使用PPR热水管，走顶不走地，便于后期维修；包含冷热水管铺设、打压测试等。电路改造：强电弱电分管布线，使用国标铜芯线，按照用电功率配置线径；包含开槽、布线、封槽等。所有改造符合国家电气规范，改造完成后提供详细的水电路图纸。",
    },
    {
      id: 3,
      item: "防水工程",
      unit: "㎡",
      quantity: 30,
      unitPrice: 120,
      amount: 3600,
      explanation:
        "卫生间、厨房、阳台等重点区域的防水施工。使用聚合物水泥基防水涂料，环保无毒。卫生间墙面防水高度1.8米，淋浴区墙面做到顶；地面防水层厚度达到规范要求。施工完成后进行48小时闭水试验，确保无渗漏。防水层完全干透后方可进行后续施工。",
    },
    {
      id: 4,
      item: "瓦工铺贴工程",
      unit: "㎡",
      quantity: 100,
      unitPrice: 85,
      amount: 8500,
      explanation:
        "包含地砖、墙砖的铺贴施工。采用薄贴法或传统水泥砂浆铺贴工艺，根据瓷砖类型选择。施工前进行基层处理，确保平整；铺贴时采用十字卡控制缝隙，保证整体效果。大砖（800x800以上）采用专用瓷砖胶铺贴。包含地面找平、墙面拉毛、铺贴、勾缝等工序。",
    },
    {
      id: 5,
      item: "木工吊顶工程",
      unit: "㎡",
      quantity: 80,
      unitPrice: 160,
      amount: 12800,
      explanation:
        "客厅、餐厅、卧室、过道等区域的吊顶施工。采用轻钢龙骨+石膏板结构，坚固耐用不变形。包含造型设计（如直线吊顶、跌级吊顶、灯带设计等）。龙骨间距符合规范，石膏板接缝处做防开裂处理。包含材料、人工、造型设计等。吊顶内预留灯具、空调等设备的检修口。",
    },
    {
      id: 6,
      item: "油漆涂料工程",
      unit: "㎡",
      quantity: 280,
      unitPrice: 45,
      amount: 12600,
      explanation:
        "包含墙面、吊顶的基层处理和面层涂刷。基层处理：铲除原墙皮（如需）、石膏找平、挂网格布（防开裂）、批刮腻子2-3遍、打磨平整。面层涂刷：使用环保乳胶漆，滚涂2遍面漆，确保颜色均匀、表面平整细腻。包含材料、人工及施工保护。可根据需求调配墙面颜色。",
    },
    {
      id: 7,
      item: "橱柜安装",
      unit: "延米",
      quantity: 6,
      unitPrice: 300,
      amount: 1800,
      explanation:
        "整体橱柜的现场安装服务。包含地柜、吊柜的组装和固定，台面的切割、打磨和安装，水槽、灶台的开孔和安装，柜门调整等。安装时会做好墙地面保护，安装后进行柜门调试，确保开合顺畅、缝隙均匀。安装完成后进行整体清洁，并向您讲解使用和保养注意事项。",
    },
    {
      id: 8,
      item: "衣柜安装",
      unit: "㎡",
      quantity: 18,
      unitPrice: 200,
      amount: 3600,
      explanation:
        "定制衣柜的现场安装服务。包含柜体组装、固定，柜门安装调试，内部五金配件（抽屉、裤架、挂衣杆等）的安装。安装师傅会根据现场实际情况进行微调，确保衣柜与墙体、地面完美贴合。安装过程做好地面保护，安装后清理现场，并进行功能演示。",
    },
    {
      id: 9,
      item: "门窗安装",
      unit: "套",
      quantity: 5,
      unitPrice: 400,
      amount: 2000,
      explanation:
        "室内门的安装服务。包含门洞测量复核、门套安装、门扇安装、五金安装调试、门框与墙体间隙发泡填充、安装收口等。安装时确保门套垂直、门扇开合顺畅、锁具正常使用。安装完成后清理现场，检查门的开关灵活性和密封性。",
    },
    {
      id: 10,
      item: "灯具洁具安装",
      unit: "套",
      quantity: 1,
      unitPrice: 3200,
      amount: 3200,
      explanation:
        "全屋灯具、洁具的安装调试服务。灯具安装：包含各类吊灯、吸顶灯、筒灯、射灯、灯带等的安装固定和电路连接，安装后测试照明效果。洁具安装：包含马桶、浴室柜、花洒、龙头、地漏等的安装，安装后进行水压测试和防漏测试，确保使用正常。",
    },
    {
      id: 11,
      item: "垃圾清运",
      unit: "次",
      quantity: 1,
      unitPrice: 2800,
      amount: 2800,
      explanation:
        "装修全过程的建筑垃圾清理和外运服务。包含拆除垃圾、施工垃圾、包装垃圾等的清扫、装袋、搬运下楼、外运至指定垃圾消纳场。清运工作分阶段进行，保持施工现场整洁有序。费用包含人工、垃圾袋、下楼费、运输费、消纳费等。",
    },
    {
      id: 12,
      item: "成品保护及清洁",
      unit: "套",
      quantity: 1,
      unitPrice: 3600,
      amount: 3600,
      explanation:
        "施工过程中的成品保护和竣工后的开荒保洁。成品保护：对门窗、地面、墙面、成品家具等做好保护措施，防止施工时损坏。开荒保洁：装修完工后进行全面深度清洁，包括地面、墙面、玻璃、门窗、橱柜内外、卫浴洁具等的清洁，清除装修残留的胶、漆、污渍等，确保交付时整洁如新。",
    },
    {
      id: 13,
      item: "项目管理费",
      unit: "项",
      quantity: 1,
      unitPrice: 12000,
      amount: 12000,
      explanation:
        "装修项目的全程管理服务费用。包含：项目经理全程跟进、施工进度管理、质量监督、材料验收、协调各工种施工、处理现场问题、与业主沟通汇报等工作。项目经理会定期向您汇报施工进度和质量情况，及时解决施工中的各类问题，确保工程按时保质完成。",
    },
  ],
};

export default function QuotationPage() {
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  const handleConfirmClick = () => {
    setShowSignatureModal(true);
  };

  const handleSignatureConfirm = (signature: string) => {
    setSignatureData(signature);
    setIsConfirmed(true);
    setShowSignatureModal(false);
    toast.success("报价单已确认！感谢您的信任。", {
      duration: 3000,
    });
  };

  const handleFeedbackClick = () => {
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = (feedback: string) => {
    setFeedbackText(feedback);
    setIsFeedbackSubmitted(true);
    setShowFeedbackModal(false);
    toast.success("感谢您的反馈！我们会尽快与您联系。", {
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-screen-2xl mx-auto p-6">
        {/* 头部 */}
        <div className="bg-white rounded-[24px] shadow-card hover:shadow-xl transition-shadow duration-300 p-8 mb-24 border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#EF6B00] p-3 rounded-xl shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-[48px] font-black text-[#0A0A0A]">
                  EPC报价单
                </h1>
                {isConfirmed && (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-[12px] text-green-600 font-medium">
                      客户已确认
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right bg-gray-50 px-6 py-4 rounded-xl">
              <div className="text-[12px] text-[#6B7280] uppercase tracking-wide font-medium">
                订单编号
              </div>
              <div className="text-[16px] font-bold text-[#0A0A0A] mt-1">
                {quotationData.orderNumber}
              </div>
            </div>
          </div>

          {/* 客户信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 rounded-[24px] p-6 border border-[#E5E7EB]">
            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="bg-white p-2 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <User className="w-5 h-5 text-[#EF6B00]" />
                </div>
                <div>
                  <span className="text-[12px] text-[#6B7280] font-medium">
                    客户姓名
                  </span>
                  <div className="font-semibold text-[#0A0A0A] text-[16px]">
                    {quotationData.customer.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="bg-white p-2 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                  <MapPin className="w-5 h-5 text-[#EF6B00]" />
                </div>
                <div>
                  <span className="text-[12px] text-[#6B7280] font-medium">
                    项目地址
                  </span>
                  <div className="font-normal text-[#0A0A0A] text-[16px]">
                    {quotationData.customer.address}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 总价概览 */}
          <div className="mt-6 bg-[#EF6B00] rounded-[24px] p-8 text-white shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <DollarSign className="w-7 h-7" />
                </div>
                <span className="text-[16px] font-normal">项目总价</span>
              </div>
              <div className="text-right">
                <div className="text-[48px] font-black tracking-tight">
                  ¥{quotationData.pricing.total.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t border-white/30">
              <div className="text-center group cursor-pointer">
                <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-4 group-hover:bg-white/20 transition-all duration-300">
                  <div className="text-[12px] text-white/80 uppercase tracking-wide font-medium">
                    高端设计费用
                  </div>
                  <div className="text-[30px] font-black mt-2">
                    ¥{quotationData.pricing.design.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-4 group-hover:bg-white/20 transition-all duration-300">
                  <div className="text-[12px] text-white/80 uppercase tracking-wide font-medium">
                    严选精品费用
                  </div>
                  <div className="text-[30px] font-black mt-2">
                    ¥{quotationData.pricing.product.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-4 group-hover:bg-white/20 transition-all duration-300">
                  <div className="text-[12px] text-white/80 uppercase tracking-wide font-medium">
                    匠心施工费用
                  </div>
                  <div className="text-[30px] font-black mt-2">
                    ¥{quotationData.pricing.construction.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* E - 设计明细 */}
        <DesignDetails
          items={quotationData.designItems}
          total={quotationData.pricing.design}
        />

        {/* P - 货品明细 */}
        <ProductDetails
          items={quotationData.productItems}
          total={quotationData.pricing.product}
        />

        {/* C - 施工明细 */}
        <ConstructionDetails
          items={quotationData.constructionItems}
          total={quotationData.pricing.construction}
        />

        {/* 页脚说明 */}
        <div className="bg-white rounded-[24px] shadow-card p-8 mt-24 border border-[#E5E7EB]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-[#EF6B00] rounded-full"></div>
            <h3 className="font-black text-[#0A0A0A] text-[30px]">
              您可向居梦科技对公收款账户付款：
            </h3>
          </div>
          <ul className="space-y-3 text-[16px] text-[#0A0A0A] mb-6">
            <li className="flex items-start gap-2">
              <span className="text-[#EF6B00] font-bold">•</span>
              <span>
                <span className="font-semibold">账户名称：</span>
                居梦科技（深圳）有限公司
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#EF6B00] font-bold">•</span>
              <span>
                <span className="font-semibold">账户号码：</span>
                755953465810902
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#EF6B00] font-bold">•</span>
              <span>
                <span className="font-semibold">开户银行：</span>
                招商银行深圳分行滨海支行
              </span>
            </li>
          </ul>

          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-[#EF6B00] rounded-full"></div>
            <h3 className="font-black text-[#0A0A0A] text-[30px]">
              EPC 订单报价备注：
            </h3>
          </div>
          <ul className="space-y-3 text-[16px] text-[#0A0A0A]">
            <li className="flex items-start gap-2">
              <span className="text-[#EF6B00] font-bold">•</span>
              <span>本报价单内报价均为含税报价</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#EF6B00] font-bold">•</span>
              <span>产品与服务报价数量仅供参考</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#EF6B00] font-bold">•</span>
              <span>实际数量以验收后结算单为准</span>
            </li>
          </ul>

          {/* 确认报价单区域 */}
          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            {!isConfirmed && !isFeedbackSubmitted ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleConfirmClick}
                    className="flex items-center gap-3 bg-[#EF6B00] hover:bg-[#CC5B00] text-white px-8 py-4 rounded-[16px] shadow-card hover:shadow-xl transition-all duration-300 font-bold text-[16px]"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    确认报价单
                  </button>
                  <button
                    onClick={handleFeedbackClick}
                    className="flex items-center gap-3 bg-white text-[#0A0A0A] border border-[#E5E7EB] px-8 py-4 rounded-[16px] shadow-sm hover:shadow-md transition-all duration-300 font-bold text-[16px]"
                  >
                    <MessageSquare className="w-6 h-6" />
                    希望调整方案
                  </button>
                </div>
                <p className="text-[12px] text-[#6B7280] font-medium">
                  您可以直接确认，或告诉我们您的想法和建议
                </p>
              </div>
            ) : isConfirmed ? (
              <div className="bg-green-50 rounded-[24px] p-6 border border-green-200">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-green-600 p-2 rounded-xl">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-green-900 text-[30px]">
                          报价单已确认
                        </h4>
                        <p className="text-[12px] text-green-700 mt-1 font-medium">
                          确认时间：{new Date().toLocaleString("zh-CN")}
                        </p>
                      </div>
                    </div>
                    <p className="text-[16px] text-[#6B7280]">
                      感谢您的信任！我们将尽快安排项目启动事宜，并与您保持密切沟通。
                    </p>
                  </div>
                  {signatureData && (
                    <div className="flex-shrink-0">
                      <div className="text-[12px] text-[#6B7280] mb-2 text-center font-medium">
                        客户签名
                      </div>
                      <img
                        src={signatureData}
                        alt="客户签名"
                        className="w-48 h-24 border-2 border-green-300 rounded-xl bg-white object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : isFeedbackSubmitted ? (
              <div className="bg-orange-50 rounded-[24px] p-6 border border-orange-200">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-[#EF6B00] p-2 rounded-xl">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-black text-[#0A0A0A] text-[30px]">
                          调整建议已收到
                        </h4>
                        <p className="text-[12px] text-[#6B7280] mt-1 font-medium">
                          提交时间：{new Date().toLocaleString("zh-CN")}
                        </p>
                      </div>
                    </div>
                    <p className="text-[16px] text-[#6B7280]">
                      感谢您的宝贵意见！我们的客户经理会在1个工作日内联系您，沟通调整方案。
                    </p>
                  </div>
                  {feedbackText && (
                    <div className="flex-shrink-0 max-w-md">
                      <div className="text-[12px] text-[#6B7280] mb-2 font-medium">
                        您的反馈
                      </div>
                      <div className="border-2 border-orange-300 rounded-xl bg-white p-3 text-[16px] text-[#0A0A0A] max-h-24 overflow-y-auto">
                        {feedbackText}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* 签名确认弹窗 */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onConfirm={handleSignatureConfirm}
      />

      {/* 反馈提交弹窗 */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
}
