
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  zh: {
    app_name: "DevPilot 开发者控制台",
    role_admin: "管理员",
    role_engineer: "工程师",
    role_label: "当前角色",
    sessions_title: "会话列表",
    search_placeholder: "搜索客户...",
    no_sessions: "未找到相关会话",
    status_active: "进行中",
    status_queued: "排队中",
    status_ended: "已结束",
    
    // Global Status & Header
    status_online: "在线",
    status_away: "挂起",
    status_offline: "离线",
    lbl_accept_tickets: "接听工单",
    lbl_audio_enabled: "音频已连接",
    lbl_audio_disabled: "音频未连接 (点击重试)",
    btn_outbound_call: "发起外呼",
    call_panel_title: "外呼中心",
    call_placeholder: "输入号码...",
    btn_call: "呼叫",
    btn_hangup: "挂断",
    calling_status: "正在呼叫...",

    // Audio Verification
    toast_audio_verifying: "正在检测音频设备...",
    toast_audio_success: "音频系统已就绪",
    toast_audio_failed: "无法播放音频，请检查权限",
    toast_audio_guide: "请点击麦克风图标以激活音频",
    
    // Call Association
    call_associated_with: "关联至",
    call_post_process: "后补关联",
    call_post_desc: "本次通话未关联客户，请选择：",
    btn_skip: "跳过",
    btn_link: "关联",
    recent_contacts: "最近/上下文",

    // Nav
    nav_chat: "在线会话",
    nav_my_tickets: "我的工单",
    nav_all_tickets: "工单列表",

    // Chat Area
    select_session: "请选择一个会话以开始",
    ticket_prefix: "工单号",
    msg_withdrawn: "消息已撤回",
    replying_to: "回复",
    markdown_support: "支持 Markdown 语法",
    send_btn: "发送",
    type_placeholder: "在此输入消息... (Shift+Enter 换行)",
    download: "下载文件",
    
    // Actions
    action_note: "服务小记",
    action_transfer: "转接会话",
    action_ticket: "创建工单",
    action_end: "结束会话",
    
    // Action Modals
    modal_note_title: "添加服务小记",
    modal_note_placeholder: "记录本次服务的关键点、后续跟进事项等...",
    modal_transfer_title: "转接会话",
    modal_transfer_select: "选择接收人",
    modal_ticket_title: "创建工单",
    modal_ticket_subject: "工单标题",
    modal_ticket_desc: "问题详情",
    btn_submit: "提交",
    btn_cancel: "取消",
    btn_save: "保存",
    btn_edit: "编辑",
    btn_create: "创建",
    btn_open_in_new: "在新页面打开",
    btn_archive: "归档",
    btn_archive_confirm: "确认解决并归档",
    toast_note_saved: "服务小记已保存",
    toast_transferred: "会话已转接",
    toast_ticket_created: "工单已创建",
    toast_ticket_saved: "工单已保存",
    toast_archived: "工单已归档，等待客户确认",

    // Profile Modal
    modal_profile_title: "编辑个人资料",
    tab_profile_general: "基本信息",
    tab_profile_integrations: "账号集成",
    lbl_nickname: "昵称",
    lbl_avatar: "头像链接",
    integration_desc: "绑定第三方账号以同步工单状态和即时消息。",
    btn_connect: "绑定",
    btn_disconnect: "解绑",
    status_connected: "已连接",
    status_disconnected: "未连接",

    // End Session Card
    end_card_title: "工程师请求结束会话",
    end_card_desc: "您的问题是否已得到解决？",
    btn_solved: "确认解决",
    btn_unsolved: "还未解决",
    auto_confirm_hint: "无操作，系统将于 {seconds}s 后自动确认解决",
    end_status_solved: "用户已确认解决，会话结束。",
    end_status_unsolved: "用户反馈问题未解决，请继续服务。",
    end_status_auto: "系统自动确认解决，会话结束。",

    // Sidebar
    tab_session: "会话",
    tab_profile: "客户",
    tab_history: "历史",
    tab_more: "更多",
    
    no_active_session: "无活动会话",
    
    // Session Info
    sect_form: "咨询工单详情",
    lbl_module: "产品模块",
    lbl_env: "环境",
    lbl_version: "版本",
    lbl_desc: "问题描述",
    
    sect_metrics: "会话指标",
    lbl_status: "状态",
    lbl_duration: "时长",
    lbl_source: "来源",
    lbl_handler: "处理人",
    
    // Customer Info
    lbl_tenant: "租户类型",
    lbl_account: "账户类型",
    lbl_tier: "等级",
    lbl_contact: "电话",
    lbl_email: "邮箱",
    
    // History
    hist_chat: "在线咨询",
    hist_ticket: "工单",
    hist_call: "电话",
    
    // Ticket List & Detail
    tickets_title: "工单管理",
    ticket_search_placeholder: "搜索工单ID或主题...",
    ticket_grid_search_placeholder: "搜索 ID / 主题 / 客户...",
    no_tickets: "没有找到工单",
    lbl_priority: "优先级",
    lbl_assignee: "负责人",
    lbl_cc: "抄送 (CC)",
    lbl_collaborators: "协作者",
    lbl_created: "创建时间",
    lbl_updated: "更新时间",
    lbl_tags: "标签",
    lbl_new_ticket: "新建工单",
    lbl_edit_ticket: "编辑工单",
    ticket_status_all: "全部状态",
    ticket_status_open: "待处理",
    ticket_status_in_progress: "处理中",
    ticket_status_resolved: "已解决",
    ticket_status_closed: "已关闭",
    priority_all: "全部优先级",
    priority_low: "低",
    priority_medium: "中",
    priority_high: "高",
    priority_critical: "紧急",
    
    // Ticket Filters
    filter_label_status: "状态",
    filter_label_priority: "优先级",
    filter_label_assignee: "负责人",
    filter_label_date: "日期范围",
    filter_assignee_all: "全部负责人",
    filter_assignee_unassigned: "无负责人",
    filter_date_created: "创建时间",
    filter_date_updated: "更新时间",
    filter_reset: "重置筛选",

    // Ticket Grid Columns
    col_id: "工单号",
    col_subject: "主题",
    col_customer: "客户",
    col_priority: "优先级",
    col_status: "状态",
    col_assignee: "负责人",
    col_updated: "最后更新",
    
    // More
    access_restricted: "访问受限",
    access_restricted_desc: "您没有权限查看高级客户数据。",
    enterprise_insights: "企业洞察",
    lbl_cert: "认证等级",
    lbl_region: "区域",
    lbl_signed: "签约年份",
    lbl_partner: "合作伙伴类型",
    lbl_cust_status: "客户状态",
    lbl_service_grp: "Service Group",
    
    // Modal
    modal_title: "服务详情",
    lbl_id: "编号",
    lbl_subject: "主题",
    lbl_date: "日期",
    lbl_type: "类型",
    lbl_resolution: "解决方案",
    close_btn: "关闭",
    
    // Mock Data Static mappings (if needed)
    resolved: "已解决",
    pending: "待处理",
    closed: "已关闭"
  },
  en: {
    app_name: "DevPilot Console",
    role_admin: "ADMIN",
    role_engineer: "ENGINEER",
    role_label: "Role",
    sessions_title: "Sessions",
    search_placeholder: "Search customer...",
    no_sessions: "No sessions found",
    status_active: "Active",
    status_queued: "Queued",
    status_ended: "Ended",
    
    // Global Status & Header
    status_online: "Online",
    status_away: "Away",
    status_offline: "Offline",
    lbl_accept_tickets: "Accept Tickets",
    lbl_audio_enabled: "Audio Online",
    lbl_audio_disabled: "Audio Offline (Click to Retry)",
    btn_outbound_call: "Outbound Call",
    call_panel_title: "Dialer",
    call_placeholder: "Enter number...",
    btn_call: "Call",
    btn_hangup: "Hangup",
    calling_status: "Calling...",

    // Audio Verification
    toast_audio_verifying: "Verifying audio system...",
    toast_audio_success: "Audio system ready",
    toast_audio_failed: "Playback failed. Check permissions.",
    toast_audio_guide: "Please click the microphone to enable audio.",

    // Call Association
    call_associated_with: "Linked to",
    call_post_process: "Post-Call Association",
    call_post_desc: "Call was unlinked. Select customer:",
    btn_skip: "Skip",
    btn_link: "Link",
    recent_contacts: "Recent/Context",

    // Nav
    nav_chat: "Live Chat",
    nav_my_tickets: "My Tickets",
    nav_all_tickets: "All Tickets",

    // Chat Area
    select_session: "Select a session to start chatting",
    ticket_prefix: "Ticket",
    msg_withdrawn: "Message withdrawn",
    replying_to: "Replying to",
    markdown_support: "Markdown supported",
    send_btn: "Send",
    type_placeholder: "Type your message here... (Shift+Enter for new line)",
    download: "Download File",
    
    // Actions
    action_note: "Service Note",
    action_transfer: "Transfer",
    action_ticket: "Create Ticket",
    action_end: "End Session",

    // Action Modals
    modal_note_title: "Add Service Note",
    modal_note_placeholder: "Key points, follow-up items...",
    modal_transfer_title: "Transfer Session",
    modal_transfer_select: "Select Agent",
    modal_ticket_title: "Create Ticket",
    modal_ticket_subject: "Subject",
    modal_ticket_desc: "Description",
    btn_submit: "Submit",
    btn_cancel: "Cancel",
    btn_save: "Save",
    btn_edit: "Edit",
    btn_create: "Create",
    btn_open_in_new: "Open in New Page",
    btn_archive: "Archive",
    btn_archive_confirm: "Confirm & Archive",
    toast_note_saved: "Note saved",
    toast_transferred: "Session transferred",
    toast_ticket_created: "Ticket created",
    toast_ticket_saved: "Ticket saved",
    toast_archived: "Ticket archived, awaiting customer confirmation",

    // Profile Modal
    modal_profile_title: "Edit Profile",
    tab_profile_general: "General",
    tab_profile_integrations: "Integrations",
    lbl_nickname: "Nickname",
    lbl_avatar: "Avatar URL",
    integration_desc: "Connect third-party accounts to sync ticket status and messages.",
    btn_connect: "Connect",
    btn_disconnect: "Disconnect",
    status_connected: "Connected",
    status_disconnected: "Disconnected",

    // End Session Card
    end_card_title: "Request to End Session",
    end_card_desc: "Has your issue been resolved?",
    btn_solved: "Solved",
    btn_unsolved: "Not Solved",
    auto_confirm_hint: "Auto-confirm in {seconds}s",
    end_status_solved: "User confirmed solved. Session ended.",
    end_status_unsolved: "User marked as not solved. Please continue.",
    end_status_auto: "System auto-confirmed. Session ended.",

    // Sidebar
    tab_session: "Session",
    tab_profile: "Profile",
    tab_history: "History",
    tab_more: "More",
    
    no_active_session: "No active session",
    
    // Session Info
    sect_form: "Consultation Form",
    lbl_module: "Product Module",
    lbl_env: "Environment",
    lbl_version: "Version",
    lbl_desc: "Description",
    
    sect_metrics: "Session Metrics",
    lbl_status: "Status",
    lbl_duration: "Duration",
    lbl_source: "Source",
    lbl_handler: "Handler",
    
    // Customer Info
    lbl_tenant: "Tenant Type",
    lbl_account: "Account Type",
    lbl_tier: "Tier",
    lbl_contact: "Contact",
    lbl_email: "Email",
    
    // History
    hist_chat: "Chat",
    hist_ticket: "Ticket",
    hist_call: "Call",

    // Ticket List & Detail
    tickets_title: "Tickets",
    ticket_search_placeholder: "Search Ticket ID or Subject...",
    ticket_grid_search_placeholder: "Search ID / Subject / Customer...",
    no_tickets: "No tickets found",
    lbl_priority: "Priority",
    lbl_assignee: "Assignee",
    lbl_cc: "CC",
    lbl_collaborators: "Collaborators",
    lbl_created: "Created",
    lbl_updated: "Updated",
    lbl_tags: "Tags",
    lbl_new_ticket: "New Ticket",
    lbl_edit_ticket: "Edit Ticket",
    ticket_status_all: "All Status",
    ticket_status_open: "Open",
    ticket_status_in_progress: "In Progress",
    ticket_status_resolved: "Resolved",
    ticket_status_closed: "Closed",
    priority_all: "All Priorities",
    priority_low: "Low",
    priority_medium: "Medium",
    priority_high: "High",
    priority_critical: "Critical",

    // Ticket Filters
    filter_label_status: "Status",
    filter_label_priority: "Priority",
    filter_label_assignee: "Assignee",
    filter_label_date: "Date Range",
    filter_assignee_all: "All Assignees",
    filter_assignee_unassigned: "Unassigned",
    filter_date_created: "Created Date",
    filter_date_updated: "Updated Date",
    filter_reset: "Reset Filters",

    // Ticket Grid Columns
    col_id: "ID",
    col_subject: "Subject",
    col_customer: "Customer",
    col_priority: "Priority",
    col_status: "Status",
    col_assignee: "Assignee",
    col_updated: "Last Updated",
    
    // More
    access_restricted: "Access Restricted",
    access_restricted_desc: "You do not have permission to view advanced customer data.",
    enterprise_insights: "Enterprise Insights",
    lbl_cert: "Certificate Level",
    lbl_region: "Region",
    lbl_signed: "Signed Year",
    lbl_partner: "Partnership Type",
    lbl_cust_status: "Customer Status",
    lbl_service_grp: "Service Group",
    
    // Modal
    modal_title: "Service Detail",
    lbl_id: "ID",
    lbl_subject: "Subject",
    lbl_date: "Date",
    lbl_type: "Type",
    lbl_resolution: "Resolution",
    close_btn: "Close",
    
    // Mock Data
    resolved: "Resolved",
    pending: "Pending",
    closed: "Closed"
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
