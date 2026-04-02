export const DASHBOARD_METRICS = [
  { label: "รายได้ (เดือนนี้)", value: "$47,820", trend: "↑ 18.2% vs เดือนที่แล้ว", trendClass: "stat-card__trend--up" },
  { label: "ยอดสตรีม", value: "4.1M", trend: "↑ 12.4% vs เดือนที่แล้ว", trendClass: "stat-card__trend--up" },
  { label: "โปรเจกต์ที่กำลังทำ", value: "7", sub: "5 เผยแพร่แล้ว · 2 กำลังผลิต" },
  { label: "รายการรอดำเนินการ", value: "3", sub: "1 ติดปัญหา · 2 รอตรวจ", valueStyle: { color: "#d97706" } },
];

export const TOP_PERFORMERS = [
  { title: "Golden Hour", artist: "Sierra Wells", streams: "1.2M", revenue: "$15,300" },
  { title: "Neon Dreams", artist: "Luna Park", streams: "980K", revenue: "$12,450" },
  { title: "Fade to Silence", artist: "Sierra Wells", streams: "640K", revenue: "$8,200" },
  { title: "Starlight", artist: "Luna Park", streams: "520K", revenue: "$6,890" },
  { title: "Echoes", artist: "The Midnight Collective", streams: "310K", revenue: "$4,280" },
];

export const PROJECTS = [
  { id: "golden-hour", title: "Golden Hour", artist: "Sierra Wells", genre: "Country / Folk", organization: "Stellar Records", stageLabel: "เผยแพร่แล้ว", stageClass: "released", statusLabel: "เผยแพร่แล้ว", statusClass: "live", streamsLabel: "1.2M", revenue: 15300, createdLabel: "Mar 2025", detailStep: 7, bpm: "92", musicalKey: "D major", releaseType: "Single", projectId: "GW-2025-018", isrc: "US-S1Z-25-00441", targetRelease: "Mar 22, 2025", distributor: "The Orchard" },
  { id: "neon-dreams", title: "Neon Dreams", artist: "Luna Park", genre: "Pop / Electronic", organization: "Stellar Records", stageLabel: "เผยแพร่แล้ว", stageClass: "released", statusLabel: "เผยแพร่แล้ว", statusClass: "live", streamsLabel: "980K", revenue: 12450, createdLabel: "Jan 2026", detailStep: 7, bpm: "126", musicalKey: "F minor", releaseType: "EP Lead", projectId: "ND-2026-004", isrc: "US-LP9-26-00017", targetRelease: "Jan 9, 2026", distributor: "DistroKid" },
  { id: "electric-hearts", title: "Electric Hearts", artist: "Luna Park", genre: "Pop", organization: "Stellar Records", stageLabel: "มาสเตอร์แล้ว", stageClass: "mastered", statusLabel: "รอตรวจ", statusClass: "review", streamsLabel: "—", revenue: null, createdLabel: "Feb 2026", detailStep: 6, bpm: "124", musicalKey: "E minor", releaseType: "Single", projectId: "proj_EH2026_LP_001", isrc: "US-S1Z-26-00012", targetRelease: "April 18, 2026", distributor: "DistroKid" },
  { id: "fade-to-silence", title: "Fade to Silence", artist: "Sierra Wells", genre: "Ambient", organization: "Stellar Records", stageLabel: "เผยแพร่แล้ว", stageClass: "released", statusLabel: "เผยแพร่แล้ว", statusClass: "live", streamsLabel: "640K", revenue: 8200, createdLabel: "Nov 2025", detailStep: 7, bpm: "74", musicalKey: "C major", releaseType: "Single", projectId: "FTS-2025-009", isrc: "US-S1Z-25-00388", targetRelease: "Nov 14, 2025", distributor: "Symphonic" },
  { id: "broken-glass", title: "Broken Glass", artist: "KODA", genre: "R&B / Soul", organization: "Stellar Records", stageLabel: "มิกซ์แล้ว", stageClass: "mixed", statusLabel: "ติดปัญหา", statusClass: "blocked", streamsLabel: "—", revenue: null, createdLabel: "Feb 2026", detailStep: 5, bpm: "88", musicalKey: "A minor", releaseType: "Single", projectId: "BG-2026-003", isrc: "US-KD3-26-00009", targetRelease: "Feb 27, 2026", distributor: "The Orchard" },
  { id: "midnight-frequency", title: "Midnight Frequency", artist: "Neon Pulse", genre: "EDM", organization: "Stellar Records", stageLabel: "ลงนามแล้ว", stageClass: "rights-signed", statusLabel: "รอลงนาม", statusClass: "sign", streamsLabel: "—", revenue: null, createdLabel: "Jan 2026", detailStep: 7, bpm: "128", musicalKey: "G minor", releaseType: "Single", projectId: "MF-2026-006", isrc: "US-NP8-26-00014", targetRelease: "Mar 6, 2026", distributor: "AWAL" },
  { id: "last-summer", title: "Last Summer", artist: "The Midnight Collective", genre: "Indie", organization: "Stellar Records", stageLabel: "บันทึกเสียงแล้ว", stageClass: "recorded", statusLabel: "รอตรวจ", statusClass: "review", streamsLabel: "—", revenue: null, createdLabel: "Mar 2026", detailStep: 4, bpm: "96", musicalKey: "E major", releaseType: "Album Track", projectId: "LS-2026-011", isrc: "US-MC5-26-00021", targetRelease: "May 8, 2026", distributor: "Symphonic" },
  { id: "city-lights", title: "City Lights", artist: "KODA", genre: "Hip-Hop", organization: "Stellar Records", stageLabel: "กำหนดรายละเอียดแล้ว", stageClass: "briefed", statusLabel: "กำลังทำ", statusClass: "progress", streamsLabel: "—", revenue: null, createdLabel: "Mar 2026", detailStep: 0, bpm: "102", musicalKey: "C# minor", releaseType: "Single", projectId: "CL-2026-014", isrc: "US-KD3-26-00022", targetRelease: "Jun 12, 2026", distributor: "DistroKid" },
  { id: "starlight", title: "Starlight", artist: "Luna Park", genre: "Pop", organization: "Stellar Records", stageLabel: "เผยแพร่แล้ว", stageClass: "released", statusLabel: "เผยแพร่แล้ว", statusClass: "live", streamsLabel: "520K", revenue: 6890, createdLabel: "Sep 2025", detailStep: 7, bpm: "118", musicalKey: "B major", releaseType: "Single", projectId: "SL-2025-012", isrc: "US-LP9-25-00031", targetRelease: "Sep 25, 2025", distributor: "DistroKid" },
  { id: "wild-frontier", title: "Wild Frontier", artist: "Sierra Wells", genre: "Country", organization: "Stellar Records", stageLabel: "เรียบเรียงแล้ว", stageClass: "arranged", statusLabel: "กำลังทำ", statusClass: "progress", streamsLabel: "—", revenue: null, createdLabel: "Mar 2026", detailStep: 2, bpm: "110", musicalKey: "G major", releaseType: "Single", projectId: "WF-2026-008", isrc: "US-SW1-26-00025", targetRelease: "Jul 2, 2026", distributor: "The Orchard" },
  { id: "after-dark", title: "After Dark", artist: "Neon Pulse", genre: "Dance", organization: "Stellar Records", stageLabel: "Reference Track เสร็จ", stageClass: "reference-done", statusLabel: "รอตรวจ", statusClass: "review", streamsLabel: "—", revenue: null, createdLabel: "Feb 2026", detailStep: 3, bpm: "130", musicalKey: "D minor", releaseType: "Single", projectId: "AD-2026-007", isrc: "US-NP8-26-00018", targetRelease: "May 15, 2026", distributor: "AWAL" },
  { id: "echoes", title: "Echoes", artist: "The Midnight Collective", genre: "Alternative", organization: "Stellar Records", stageLabel: "เผยแพร่แล้ว", stageClass: "released", statusLabel: "เผยแพร่แล้ว", statusClass: "live", streamsLabel: "310K", revenue: 4280, createdLabel: "Dec 2025", detailStep: 7, bpm: "84", musicalKey: "F major", releaseType: "Single", projectId: "EC-2025-016", isrc: "US-MC5-25-00027", targetRelease: "Dec 11, 2025", distributor: "Symphonic" },
  { id: "breath", title: "ลมหายใจ", artist: "Nova Artists", genre: "Pop / Soul", organization: "Stellar Records", stageLabel: "เนื้อร้องเสร็จ", stageClass: "lyrics-done", statusLabel: "กำลังทำ", statusClass: "progress", streamsLabel: "—", revenue: null, createdLabel: "Mar 2026", detailStep: 2, bpm: "90", musicalKey: "A major", releaseType: "Single", projectId: "BR-2026-015", isrc: "US-SW2-26-00026", targetRelease: "Aug 10, 2026", distributor: "Symphonic" },
  { id: "starlight-thai", title: "แสงดาว", artist: "Luna Park", genre: "Pop", organization: "Stellar Records", stageLabel: "ร่าง", stageClass: "draft", statusLabel: "กำลังทำ", statusClass: "progress", streamsLabel: "—", revenue: null, createdLabel: "Mar 2026", detailStep: 0, bpm: "114", musicalKey: "E major", releaseType: "Single", projectId: "ST-2026-019", isrc: "US-LP9-26-00033", targetRelease: "Sep 5, 2026", distributor: "DistroKid" },
  { id: "dream-city", title: "เมืองในฝัน", artist: "KODA", genre: "Hip-Hop / Pop", organization: "Stellar Records", stageLabel: "เรียบเรียงแล้ว", stageClass: "arranged", statusLabel: "รอตรวจ", statusClass: "review", streamsLabel: "—", revenue: null, createdLabel: "Mar 2026", detailStep: 3, bpm: "96", musicalKey: "G# minor", releaseType: "Single", projectId: "DC-2026-020", isrc: "US-KD3-26-00030", targetRelease: "Jul 30, 2026", distributor: "DistroKid" },
];

export const ORGANIZATIONS = [
  { id: "luna-park", initials: "LP", name: "Luna Park", summary: "Pop / Electronic", metrics: [{ label: "สตรีม", value: "2.5M" }, { label: "รายได้", value: "$19,340" }, { label: "โปรเจกต์", value: "3" }, { label: "สถานะ", value: "ใช้งานอยู่" }], color: "#4575cd" },
  { id: "sierra-wells", initials: "SW", name: "Sierra Wells", summary: "Country / Folk", metrics: [{ label: "สตรีม", value: "1.8M" }, { label: "รายได้", value: "$23,500" }, { label: "โปรเจกต์", value: "3" }, { label: "สถานะ", value: "ใช้งานอยู่" }], color: "#c2410c" },
  { id: "koda", initials: "KD", name: "KODA", summary: "R&B / Hip-Hop", metrics: [{ label: "สตรีม", value: "450K" }, { label: "รายได้", value: "—" }, { label: "โปรเจกต์", value: "2" }, { label: "สถานะ", value: "ใช้งานอยู่" }], color: "#7e22ce" },
  { id: "midnight-collective", initials: "MC", name: "The Midnight Collective", summary: "Indie / Alternative", metrics: [{ label: "สตรีม", value: "310K" }, { label: "รายได้", value: "$4,280" }, { label: "โปรเจกต์", value: "2" }, { label: "สถานะ", value: "ใช้งานอยู่" }], color: "#0369a1" },
  { id: "neon-pulse", initials: "NP", name: "Neon Pulse", summary: "EDM / Dance", metrics: [{ label: "สตรีม", value: "180K" }, { label: "รายได้", value: "—" }, { label: "โปรเจกต์", value: "2" }, { label: "สถานะ", value: "ใช้งานอยู่" }], color: "#d97706" },
];

export const TEAM_MEMBERS = [
  { initials: "AT", name: "Anawat Tongta", email: "anawattongta@gmail.com", twoFactor: "ไม่เปิดใช้งาน", role: "Admin", roleBadge: ["You", "Owner"], avatarColor: "#d8def2", avatarTextColor: "#5e78b8" },
  { initials: "JK", name: "James Kim", email: "james.k@stellarrecords.com", twoFactor: "เปิดใช้งานแล้ว", role: "Producer", roleBadge: ["Producer"], avatarColor: "#c2410c", avatarTextColor: "#ffffff" },
];

export const PENDING_INVITES = [{ email: "sara.m@gmail.com", role: "A&R", created: "2d ago" }];

export const ROLE_LIBRARY = [
  { name: "Admin", description: "เข้าถึงเต็มในการตั้งค่า Studio ทีมงาน ข้อมูลรายได้ และการดำเนินการโปรเจกต์", users: "1 User" },
  { name: "Producer", description: "สามารถสร้างและจัดการโปรเจกต์ อนุมัติมิกซ์และมาสเตอร์ และดูรายได้สำหรับโปรเจกต์ที่มอบหมาย", users: "1 User" },
  { name: "A&R", description: "สามารถตรวจสอบและอนุมัติการส่งสร้างสรรค์ ไม่สามารถเข้าถึงข้อมูลทางการเงินหรือการตั้งค่า Studio", users: "0 Users" },
  { name: "Engineer", description: "สามารถอัปโหลดและจัดการไฟล์เสียงสำหรับโปรเจกต์ที่มอบหมาย ไม่มีสิทธิ์เข้าถึงสัญญาหรือรายได้", users: "0 Users" },
  { name: "Viewer", description: "เข้าถึงแบบอ่านอย่างเดียวสำหรับสถานะโปรเจกต์และการวิเคราะห์สาธารณะ ไม่สามารถแก้ไขข้อมูลใด ๆ", users: "0 Users" },
];

export const GENERIC_PAGES = {
  "ai-production": {
    title: "AI Production",
    subtitle: "งานที่ขอบเขต Project พร้อมข้อมูลประจำตัว RoEx ระดับองค์กรและการแทนที่ webhook",
    bullets: [
      "เรียงลำดับงานเนื้อร้อง มิกซ์ และมาสเตอร์จากบริบทโปรเจกต์ปัจจุบัน",
      "ตรวจสอบการแทนที่ Admin องค์กรก่อนย้อนกลับไปที่การตั้งค่า AI ส่วนกลาง",
      "ติดตามงานที่ขัดขวางเนื่องจากสถานะความยินยอมหรืออนุมัติที่ขาดหายไป",
    ],
  },
  contracts: {
    title: "Contracts",
    subtitle: "ข้อกำหนด การยินยอม และโครงสร้างค่าตอบแทนยังคงอยู่ในขอบเขต Project และรู้ข้อมูลรุ่น",
    bullets: [
      "ตรวจสอบเวอร์ชันเงื่อนไข Project และข้อกำหนดการยินยอมใหม่",
      "ใช้พรีเซ็ตค่าตอบแทนที่อุดมสมบูรณ์ขึ้นรวมถึงเงินเดือน อัตราเซสชัน ล่วงหน้า และกฎเกณฑ์ที่กำหนดเอง",
      "เตรียมสถานะทางกฎหมายก่อนลงนามสุดท้ายเพื่อปลดล็อกการส่งมอบผู้จัดจำหน่าย",
    ],
  },
  activity: {
    title: "Activity",
    subtitle: "ฟีดเดียวสำหรับการอนุมัติ การรวมอินทิเกรชัน งาน AI และตัวบล็อกการเผยแพร่",
    bullets: [
      "ดูเมื่อการตั้งค่า Admin องค์กรเปลี่ยนแปลงที่ระดับ Studio",
      "ตรวจสอบว่าใครอนุมัติ ขัดขวาง หรือลงนามในไมล์โพลการเผยแพร่แต่ละรายการ",
      "ติดตามการส่งมอบ webhook และพฤติกรรมการย้อนกลับผู้จัดจำหน่าย",
    ],
  },
  help: {
    title: "Help",
    subtitle: "คำแนะนำการดำเนินการสำหรับโฟลว์การเผยแพร่ Nova Music OS ปัจจุบัน",
    bullets: [
      "เก็บงานปัจจุบันให้เน้นไปที่ขั้นตอนโปรเจกต์ใหม่",
      "หลีกเลี่ยงงานความเข้ากันได้ข้อมูลเดิมเว้นแต่จะขัดขวางเส้นทางฟีเจอร์ที่ใช้งานอยู่",
      "ใช้การตั้งค่า Admin Studio สำหรับการควบคุมผู้จัดจำหน่ายและการรวมอินทิเกรชันเริ่มต้นก่อน",
    ],
  },
  docs: {
    title: "Docs",
    subtitle: "อ้างอิงโฟลว์ที่ออกแบบใหม่: ความยินยอม กล่องอนุมัติ AI Production เกต Release และลงนามสุดท้าย",
    bullets: [
      "API เงื่อนไขและความยินยอมใช้งานแล้วสำหรับโปรเจกต์ใหม่",
      "Approval inbox MVP ใช้งานอยู่และ Project-scoped",
      "Release orchestration คือฟีเจอร์หลักถัดไปหลังจากงานการทำให้แข็งแกร่งปัจจุบัน",
    ],
  },
};

export const STAGE_OPTIONS = [
  { value: "", label: "ทุกขั้นตอน" },
  { value: "draft", label: "ร่าง" },
  { value: "briefed", label: "กำหนดรายละเอียดแล้ว" },
  { value: "lyrics-done", label: "เนื้อร้องเสร็จ" },
  { value: "reference-done", label: "Reference Track เสร็จ" },
  { value: "arranged", label: "เรียบเรียงแล้ว" },
  { value: "recorded", label: "บันทึกเสียงแล้ว" },
  { value: "mixed", label: "มิกซ์แล้ว" },
  { value: "mastered", label: "มาสเตอร์แล้ว" },
  { value: "rights-signed", label: "ลงนามแล้ว" },
  { value: "released", label: "เผยแพร่แล้ว" },
];

export const STATUS_OPTIONS = [
  { value: "", label: "ทุกสถานะ" },
  { value: "progress", label: "กำลังทำ" },
  { value: "review", label: "รอตรวจ" },
  { value: "blocked", label: "ติดปัญหา" },
  { value: "sign", label: "รอลงนาม" },
  { value: "live", label: "เผยแพร่แล้ว" },
];
