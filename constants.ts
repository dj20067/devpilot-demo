
import { Session, SessionStatus, User, UserRole, Message, ServiceRecord, Customer, Ticket } from './types';

// Helper to generate data based on language
export const getMockData = (lang: 'zh' | 'en') => {
  
  const isZh = lang === 'zh';

  const CURRENT_USER: User = {
    id: 'eng-001',
    name: isZh ? '陈阿列克斯' : 'Alex Chen',
    avatar: 'https://picsum.photos/id/1005/200/200',
    role: UserRole.ADMIN,
  };

  const OTHER_ENGINEER: User = {
    id: 'eng-002',
    name: isZh ? '莎拉·史密斯' : 'Sarah Smith',
    avatar: 'https://picsum.photos/id/1027/200/200',
    role: UserRole.ENGINEER,
  };

  const MOCK_CUSTOMERS: Customer[] = [
    {
      id: 'cust-001',
      name: isZh ? '莎拉·康纳' : 'Sarah Connor',
      email: 'sarah.c@skynet.com',
      avatar: 'https://picsum.photos/id/237/200/200',
      tenantType: isZh ? '企业版' : 'Enterprise',
      accountType: isZh ? '付费' : 'Paid',
      tier: 'VIP',
      phone: '+1 555-0199',
      company: isZh ? '赛博达因系统' : 'Cyberdyne Systems',
      certificateLevel: isZh ? '大师级' : 'Master',
      customerStatus: isZh ? '活跃' : 'Active',
      partnershipType: isZh ? '金牌合作伙伴' : 'Gold Partner',
      region: isZh ? '北美' : 'NA',
      serviceGroup: isZh ? 'RPA 核心组' : 'RPA Core',
      signedYear: '2021',
    },
    {
      id: 'cust-002',
      name: isZh ? '李约翰' : 'John Doe',
      email: 'john.d@acme.inc',
      avatar: 'https://picsum.photos/id/1025/200/200',
      tenantType: isZh ? '中小企业' : 'SME',
      accountType: isZh ? '试用' : 'Trial',
      tier: 'L1',
      phone: '+1 555-0123',
      company: isZh ? '阿克梅公司' : 'Acme Corp',
      certificateLevel: isZh ? '专业级' : 'Professional',
      customerStatus: isZh ? '新客' : 'New',
      partnershipType: isZh ? '直销' : 'Direct',
      region: isZh ? '欧洲中东非洲' : 'EMEA',
      serviceGroup: isZh ? '云集成' : 'Cloud Integration',
      signedYear: '2023',
    },
  ];

  const MOCK_SESSIONS: Session[] = [
    {
      id: 'sess-001',
      status: SessionStatus.ACTIVE,
      customer: MOCK_CUSTOMERS[0],
      startTime: new Date(Date.now() - 1000 * 60 * 15),
      duration: '00:15:23',
      source: isZh ? 'IDE 插件' : 'IDE Plugin',
      handlerId: 'eng-001',
      lastMessage: isZh ? '选择器在登录页面失效了。' : 'The selector is failing on the login screen.',
      unreadCount: 1,
      consultationForm: {
        productModule: isZh ? 'Web 自动化' : 'Web Automation',
        environment: isZh ? '生产环境' : 'Production',
        severity: isZh ? '严重' : 'Critical',
        description: isZh ? 'v2.4 更新后机器人停止工作，找不到选择器。' : 'Bot stops working after update v2.4. Selectors are not found.',
        version: '2.4.1',
      },
    },
    {
      id: 'sess-002',
      status: SessionStatus.QUEUED,
      customer: MOCK_CUSTOMERS[1],
      startTime: new Date(Date.now() - 1000 * 60 * 2),
      duration: '00:02:00',
      source: isZh ? 'Web 门户' : 'Web Portal',
      handlerId: '',
      lastMessage: isZh ? '我该如何重置 API 密钥？' : 'How do I reset my API key?',
      unreadCount: 0,
      consultationForm: {
        productModule: isZh ? 'API 网关' : 'API Gateway',
        environment: isZh ? '开发环境' : 'Dev',
        severity: isZh ? '轻微' : 'Minor',
        description: isZh ? '需要帮助轮换密钥。' : 'Need help rotating keys.',
        version: 'N/A',
      },
    },
    {
      id: 'sess-003',
      status: SessionStatus.ENDED,
      customer: MOCK_CUSTOMERS[1],
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
      duration: '00:45:00',
      source: isZh ? 'Web 门户' : 'Web Portal',
      handlerId: 'eng-001',
      lastMessage: isZh ? '谢谢你的帮助！' : 'Thank you for your help!',
      unreadCount: 0,
      consultationForm: {
        productModule: isZh ? '计费' : 'Billing',
        environment: isZh ? '生产环境' : 'Production',
        severity: isZh ? '主要' : 'Major',
        description: isZh ? '发票金额差异。' : 'Invoice discrepancy.',
        version: 'N/A',
      },
    },
  ];

  const MOCK_MESSAGES: Message[] = [
    {
      id: 'msg-1',
      sessionId: 'sess-001',
      senderId: 'cust-001',
      content: isZh ? '你好，更新后我的 Chrome 扩展程序出问题了。' : 'Hi, I am having trouble with the Chrome extension after the latest update.',
      timestamp: new Date(Date.now() - 1000 * 60 * 14),
      type: 'text',
    },
    {
      id: 'msg-2',
      sessionId: 'sess-001',
      senderId: 'eng-001',
      content: isZh ? '你好莎拉，我来帮你处理。请问你看到的具体错误代码是什么？' : 'Hello Sarah, I can certainly help with that. Could you please provide the specific error code you are seeing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 12),
      type: 'text',
    },
    {
      id: 'msg-3',
      sessionId: 'sess-001',
      senderId: 'cust-001',
      content: isZh ? '第 45 行显示 "SelectorNotFoundException"。' : 'It says "SelectorNotFoundException" on line 45.',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      type: 'text',
    },
    {
      id: 'msg-4',
      sessionId: 'sess-001',
      senderId: 'eng-001',
      content: isZh ? '我明白了。请尝试使用 UI Spy 模式重新捕获该元素。' : 'I see. Please try re-capturing the element using UI Spy mode.',
      timestamp: new Date(Date.now() - 1000 * 60 * 8),
      type: 'text',
    },
  ];

  const MOCK_HISTORY: ServiceRecord[] = [
    {
      id: 'rec-1',
      type: 'chat',
      date: '2023-10-25',
      summary: isZh ? 'Chrome 扩展程序崩溃' : 'Chrome Extension Crash',
      status: isZh ? '已解决' : 'Resolved',
      agent: isZh ? '陈阿列克斯' : 'Alex Chen',
    },
    {
      id: 'rec-2',
      type: 'ticket',
      date: '2023-10-10',
      summary: isZh ? '许可证续期咨询' : 'License Renewal Inquiry',
      status: isZh ? '已关闭' : 'Closed',
      agent: isZh ? '计费团队' : 'Billing Team',
    },
    {
      id: 'rec-3',
      type: 'call',
      date: '2023-09-15',
      summary: isZh ? '入职培训会议' : 'Onboarding Session',
      status: isZh ? '已解决' : 'Resolved',
      agent: isZh ? '莎拉·史密斯' : 'Sarah Smith',
    },
  ];

  const MOCK_TICKETS: Ticket[] = [
      {
          id: 'TIC-1024',
          subject: isZh ? '生产环境数据库连接超时' : 'Production DB Connection Timeout',
          description: isZh ? '每晚2点备份期间出现间歇性连接超时。' : 'Intermittent connection timeouts occurring during nightly backup at 2 AM.',
          status: 'open',
          priority: 'high',
          customer: MOCK_CUSTOMERS[0],
          assignee: CURRENT_USER,
          cc: [],
          collaborators: [OTHER_ENGINEER],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
          tags: ['Database', 'Production']
      },
      {
          id: 'TIC-1025',
          subject: isZh ? '功能请求：暗黑模式' : 'Feature Request: Dark Mode',
          description: isZh ? '许多用户在社区论坛请求此功能。' : 'Many users are requesting this in the community forum.',
          status: 'in_progress',
          priority: 'low',
          customer: MOCK_CUSTOMERS[1],
          assignee: CURRENT_USER,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
          updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
          tags: ['UI/UX', 'Feature']
      },
      {
        id: 'TIC-1026',
        subject: isZh ? '导出 PDF 中文字符乱码' : 'Chinese characters corrupted in PDF export',
        description: isZh ? '使用旧版字体渲染引擎时出现此问题。' : 'Issue occurs when using legacy font rendering engine.',
        status: 'resolved',
        priority: 'medium',
        customer: MOCK_CUSTOMERS[0],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        tags: ['Bug', 'PDF']
      },
      // Added a ticket that is NOT assigned to current user, but they are CC'd
      {
        id: 'TIC-1027',
        subject: isZh ? '[CC] 支付网关 502 错误' : '[CC] Payment Gateway 502 Error',
        description: isZh ? '客户报告在结账时偶尔出现 502 Bad Gateway 错误。' : 'Customer reporting occasional 502 Bad Gateway errors during checkout.',
        status: 'open',
        priority: 'critical',
        customer: MOCK_CUSTOMERS[1],
        assignee: OTHER_ENGINEER,
        cc: [CURRENT_USER],
        collaborators: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
        tags: ['Payment', 'API']
      },
       // Added a ticket that is unrelated to current user (for All Tickets view)
       {
        id: 'TIC-1028',
        subject: isZh ? '移动端登录界面偏移' : 'Mobile Login UI Misaligned',
        description: isZh ? 'iPhone 13 Mini 上登录按钮超出屏幕边缘。' : 'Login button pushed off screen on iPhone 13 Mini.',
        status: 'open',
        priority: 'medium',
        customer: MOCK_CUSTOMERS[1],
        assignee: OTHER_ENGINEER,
        cc: [],
        collaborators: [],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        tags: ['Mobile', 'UI']
      }
  ];

  return { CURRENT_USER, MOCK_SESSIONS, MOCK_MESSAGES, MOCK_HISTORY, MOCK_TICKETS };
};
