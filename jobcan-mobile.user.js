// ==UserScript==
// @name         Jobcan Mobile UI (ジョブカン スマホ快適化ダッシュボード)
// @namespace    https://ssl.jobcan.jp/
// @version      1.0.0
// @description  ジョブカン（管理者画面・スタッフマイページ）を1画面完結のスマホ用モダンUIに変換します
// @match        https://ssl.jobcan.jp/client*
// @match        https://ssl.jobcan.jp/employee*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';

  // 既に起動している場合はトグルまたは再表示
  const existing = document.getElementById('jbc-mobile-root');
  if (existing) {
    existing.classList.remove('jbc-minimized');
    return;
  }

  // スマホ用 viewport 設定の補完
  let viewport = document.querySelector('meta[name="viewport"]');
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(viewport);
  }

  const isClientPage = location.pathname.startsWith('/client');

  const style = document.createElement('style');
  style.id = 'jbc-mobile-style';
  style.textContent = `
    #jbc-mobile-root {
      position: fixed;
      inset: 0;
      z-index: 2147483640;
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans JP", sans-serif;
      color: #0f172a;
      box-sizing: border-box;
      padding: 12px;
    }
    #jbc-mobile-root * {
      box-sizing: border-box;
    }
    #jbc-mobile-root.jbc-minimized {
      inset: auto 16px 16px auto;
      background: transparent;
      backdrop-filter: none;
      padding: 0;
    }
    .jbc-phone-frame {
      width: 100%;
      max-width: 430px;
      height: min(92vh, 880px);
      background: #f8fafc;
      border-radius: 28px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 8px #1e293b;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    @media (max-width: 600px) {
      #jbc-mobile-root { padding: 0; }
      .jbc-phone-frame {
        max-width: 100%;
        height: 100dvh;
        border-radius: 0;
        box-shadow: none;
      }
    }
    #jbc-mobile-root.jbc-minimized .jbc-phone-frame { display: none; }
    .jbc-fab {
      display: none;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 14px 22px;
      font-size: 15px;
      font-weight: 700;
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.5);
      cursor: pointer;
      align-items: center;
      gap: 8px;
    }
    #jbc-mobile-root.jbc-minimized .jbc-fab { display: inline-flex; }
    .jbc-header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #fff;
      padding: 15px 16px 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .jbc-header-left { display: flex; flex-direction: column; gap: 2px; }
    .jbc-header-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 7px;
    }
    .jbc-badge-live {
      background: #10b981;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 999px;
    }
    .jbc-header-sub { font-size: 11px; color: #94a3b8; max-width: 230px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .jbc-header-actions { display: flex; gap: 6px; }
    .jbc-icon-btn {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      padding: 7px 10px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .jbc-kpi-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      padding: 10px 12px;
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;
    }
    .jbc-kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 7px 4px;
      text-align: center;
      cursor: pointer;
    }
    .jbc-kpi-card.active {
      border-color: #2563eb;
      background: #eff6ff;
    }
    .jbc-kpi-num { font-size: 16px; font-weight: 800; line-height: 1.15; }
    .jbc-kpi-num.danger { color: #dc2626; }
    .jbc-kpi-num.warn { color: #d97706; }
    .jbc-kpi-num.primary { color: #2563eb; }
    .jbc-kpi-num.success { color: #059669; }
    .jbc-kpi-label { font-size: 10px; font-weight: 600; color: #64748b; margin-top: 2px; }
    .jbc-content {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      -webkit-overflow-scrolling: touch;
    }
    .jbc-sec-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 4px 2px 2px;
    }
    .jbc-sec-title {
      font-size: 13px;
      font-weight: 800;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .jbc-sec-count {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      background: #e2e8f0;
      color: #475569;
    }
    .jbc-card {
      background: #fff;
      border-radius: 14px;
      padding: 13px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 9px;
    }
    .jbc-card.urgent { border-left: 4px solid #2563eb; }
    .jbc-card.alert-unmatch { border-left: 4px solid #ef4444; }
    .jbc-card.alert-night { border-left: 4px solid #f59e0b; }
    .jbc-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }
    .jbc-staff-name {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .jbc-staff-group { font-size: 11px; color: #64748b; font-weight: 500; margin-top: 2px; }
    .jbc-tag {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 8px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .jbc-tag.blue { background: #dbeafe; color: #1d4ed8; }
    .jbc-tag.purple { background: #f3e8ff; color: #7e22ce; }
    .jbc-tag.red { background: #fee2e2; color: #b91c1c; }
    .jbc-tag.amber { background: #fef3c7; color: #b45309; }
    .jbc-tag.green { background: #d1fae5; color: #047857; }
    .jbc-tag.gray { background: #f1f5f9; color: #475569; }
    .jbc-info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px 10px;
      background: #f8fafc;
      padding: 9px 11px;
      border-radius: 10px;
      font-size: 12px;
    }
    .jbc-info-item { display: flex; flex-direction: column; gap: 1px; }
    .jbc-info-item.full { grid-column: 1 / -1; }
    .jbc-info-label { font-size: 10px; color: #64748b; font-weight: 600; }
    .jbc-info-val { font-size: 12px; font-weight: 700; color: #1e293b; }
    .jbc-btn-row { display: flex; gap: 8px; margin-top: 2px; }
    .jbc-btn {
      flex: 1;
      border: none;
      border-radius: 10px;
      padding: 9px 10px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      text-decoration: none;
    }
    .jbc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .jbc-btn.primary { background: #2563eb; color: #fff; }
    .jbc-btn.success { background: #10b981; color: #fff; }
    .jbc-btn.danger { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
    .jbc-btn.secondary { background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }
    .jbc-pills { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; flex-shrink: 0; }
    .jbc-pill {
      border: 1px solid #cbd5e1;
      background: #fff;
      color: #475569;
      padding: 6px 11px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }
    .jbc-pill.active { background: #0f172a; color: #fff; border-color: #0f172a; }
    .jbc-bottom-nav {
      background: #fff;
      border-top: 1px solid #e2e8f0;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      padding: 6px 4px 10px;
      flex-shrink: 0;
    }
    .jbc-nav-btn {
      background: none;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 6px 2px;
      color: #64748b;
      font-size: 10px;
      font-weight: 700;
      cursor: pointer;
      position: relative;
      border-radius: 10px;
    }
    .jbc-nav-btn.active { color: #2563eb; background: #eff6ff; }
    .jbc-nav-icon { font-size: 17px; line-height: 1; }
    .jbc-nav-badge {
      position: absolute;
      top: 2px;
      right: 12px;
      background: #ef4444;
      color: #fff;
      font-size: 9px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 999px;
      min-width: 14px;
      text-align: center;
    }
    .jbc-modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      display: none;
      align-items: flex-end;
      justify-content: center;
      z-index: 30;
    }
    .jbc-modal-backdrop.open { display: flex; }
    .jbc-modal-sheet {
      width: 100%;
      max-height: 85%;
      background: #fff;
      border-radius: 22px 22px 0 0;
      padding: 18px 16px 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.2);
    }
    .jbc-toast {
      position: absolute;
      top: 68px;
      left: 50%;
      transform: translateX(-50%);
      background: #0f172a;
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      padding: 10px 16px;
      border-radius: 999px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      z-index: 40;
      display: none;
      white-space: nowrap;
    }
    .jbc-empty {
      text-align: center;
      padding: 28px 14px;
      color: #64748b;
      font-size: 12px;
      background: #fff;
      border-radius: 14px;
      border: 1px dashed #cbd5e1;
    }
    .jbc-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 44px 16px;
      gap: 12px;
      color: #475569;
      font-size: 12px;
      font-weight: 600;
    }
    .jbc-spinner {
      width: 26px;
      height: 26px;
      border: 3px solid #cbd5e1;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: jbc-spin 0.8s linear infinite;
    }
    @keyframes jbc-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'jbc-mobile-root';
  root.innerHTML = `
    <button class="jbc-fab" id="jbc-restore-btn">📱 スマホUIを開く</button>
    <div class="jbc-phone-frame">
      <div class="jbc-toast" id="jbc-toast"></div>
      <div class="jbc-header">
        <div class="jbc-header-left">
          <div class="jbc-header-title">
            <span>📱 Jobcan Mobile</span>
            <span class="jbc-badge-live">v1.0</span>
          </div>
          <div class="jbc-header-sub" id="jbc-user-label">データ読込中...</div>
        </div>
        <div class="jbc-header-actions">
          <button class="jbc-icon-btn" id="jbc-refresh-btn">🔄 更新</button>
          <button class="jbc-icon-btn" id="jbc-min-btn">🖥 元画面</button>
        </div>
      </div>

      <div class="jbc-kpi-bar">
        <div class="jbc-kpi-card active" data-tab="approvals">
          <div class="jbc-kpi-num primary" id="kpi-approvals">-</div>
          <div class="jbc-kpi-label">未承認申請</div>
        </div>
        <div class="jbc-kpi-card" data-tab="errors">
          <div class="jbc-kpi-num danger" id="kpi-errors">-</div>
          <div class="jbc-kpi-label">打刻エラー</div>
        </div>
        <div class="jbc-kpi-card" data-tab="today">
          <div class="jbc-kpi-num success" id="kpi-today">-</div>
          <div class="jbc-kpi-label">本日勤務中</div>
        </div>
        <div class="jbc-kpi-card" data-tab="mypage">
          <div class="jbc-kpi-num warn" id="kpi-mypage">-</div>
          <div class="jbc-kpi-label">マイ実働</div>
        </div>
      </div>

      <div class="jbc-content" id="jbc-main-content"></div>

      <div class="jbc-modal-backdrop" id="jbc-modal">
        <div class="jbc-modal-sheet" id="jbc-modal-body"></div>
      </div>

      <div class="jbc-bottom-nav">
        <button class="jbc-nav-btn active" data-tab="approvals">
          <span class="jbc-nav-icon">✅</span>
          <span>未承認</span>
          <span class="jbc-nav-badge" id="badge-approvals" style="display:none">0</span>
        </button>
        <button class="jbc-nav-btn" data-tab="errors">
          <span class="jbc-nav-icon">⚠️</span>
          <span>エラー一覧</span>
          <span class="jbc-nav-badge" id="badge-errors" style="display:none">0</span>
        </button>
        <button class="jbc-nav-btn" data-tab="today">
          <span class="jbc-nav-icon">👥</span>
          <span>本日の状況</span>
        </button>
        <button class="jbc-nav-btn" data-tab="mypage">
          <span class="jbc-nav-icon">📅</span>
          <span>マイ出勤簿</span>
        </button>
        <button class="jbc-nav-btn" data-tab="menu">
          <span class="jbc-nav-icon">⚡</span>
          <span>全メニュー</span>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const state = {
    activeTab: isClientPage ? 'approvals' : 'mypage',
    errorFilter: 'all',
    todayFilter: 'all',
    userName: '',
    aditApprovals: [],
    holidayApprovals: [],
    unmatchErrors: [],
    nightErrors: [],
    todayStaff: [],
    mySummary: { workDays: '-', workHours: '-', overtime: '-', paidLeave: '-' },
    myAttendance: []
  };

  const showToast = (msg) => {
    const t = document.getElementById('jbc-toast');
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3000);
  };

  const parseDoc = async (url) => {
    const res = await fetch(url, { credentials: 'same-origin' });
    const html = await res.text();
    return new DOMParser().parseFromString(html, 'text/html');
  };

  const clean = (str) => (str || '').replace(/\s+/g, ' ').trim();

  async function loadAllData() {
    const contentEl = document.getElementById('jbc-main-content');
    contentEl.innerHTML = `
      <div class="jbc-loading">
        <div class="jbc-spinner"></div>
        <div>ジョブカンの全ページデータを一括取得中...</div>
      </div>
    `;

    try {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth() + 1;
      const d = now.getDate();

      const [
        clientTopDoc,
        applovedDoc,
        holidayDoc,
        unmatchDoc,
        nightDoc,
        todayDoc,
        myAttDoc
      ] = await Promise.all([
        parseDoc('https://ssl.jobcan.jp/client').catch(() => null),
        parseDoc(`https://ssl.jobcan.jp/client/apploved?search_type=term&fromYear=${y}&fromMonth=${Math.max(1, m - 1)}&fromDay=1&toYear=${y + 1}&toMonth=${m}&toDay=${d}&searching=1&fromtop=1`).catch(() => null),
        parseDoc('https://ssl.jobcan.jp/client/employee-holiday-applied?fromtop=1&search_type=term').catch(() => null),
        parseDoc(`https://ssl.jobcan.jp/client/not-leave?search_type=term&fromYear=${y}&fromMonth=${m}&fromDay=1&toYear=${y}&toMonth=${m}&toDay=${d}&error_type=unmatch&searching=1&fromtop=1`).catch(() => null),
        parseDoc(`https://ssl.jobcan.jp/client/not-leave?search_type=term&fromYear=${y}&fromMonth=${m}&fromDay=1&toYear=${y}&toMonth=${m}&toDay=${d}&error_type=error&searching=1&fromtop=1`).catch(() => null),
        parseDoc('https://ssl.jobcan.jp/client/work-state/show/?submit_type=today&searching=1&list_type=normal&number_par_page=30&group_where_type=main&retirement=work').catch(() => null),
        parseDoc('https://ssl.jobcan.jp/employee/attendance').catch(() => null)
      ]);

      // ユーザー名取得
      const managerLink = clientTopDoc ? clean(clientTopDoc.querySelector('#header')?.innerText) : '';
      const nameMatch = managerLink.match(/([^\s]+)\s*様/);
      state.userName = nameMatch ? `${nameMatch[1]} 様` : 'ログイン中';

      // 1. 未承認打刻
      state.aditApprovals = [];
      if (applovedDoc) {
        const aditTable = applovedDoc.querySelector('table.note');
        const aditToken = applovedDoc.querySelector('input[name="token"]')?.value || '';
        if (aditTable) {
          const rows = Array.from(aditTable.querySelectorAll('tr')).slice(1);
          for (let i = 0; i < rows.length; i++) {
            const tds = rows[i].querySelectorAll('td');
            if (tds.length >= 10) {
              const cb = tds[0].querySelector('input[name="approved-list"]');
              const detailLink = tds[tds.length - 1].querySelector('a')?.getAttribute('href') || '';
              const nextRow = rows[i + 1];
              let note = '';
              let appliedAt = '';
              if (nextRow && nextRow.querySelectorAll('td').length <= 3) {
                const nextTds = nextRow.querySelectorAll('td');
                note = clean(nextTds[0]?.innerText);
                appliedAt = clean(nextTds[1]?.innerText);
                i++;
              }
              state.aditApprovals.push({
                type: '打刻修正申請',
                checkboxVal: cb?.value || '',
                token: aditToken,
                staff: clean(tds[1]?.innerText),
                summary: clean(tds[2]?.innerText),
                date: clean(tds[3]?.innerText),
                clockIn: clean(tds[5]?.innerText),
                clockOut: clean(tds[6]?.innerText),
                workTime: clean(tds[7]?.innerText),
                overtime: clean(tds[10]?.innerText),
                detailUrl: detailLink,
                note,
                appliedAt
              });
            }
          }
        }
      }

      // 2. 未承認休暇申請
      state.holidayApprovals = [];
      if (holidayDoc) {
        const holTable = holidayDoc.querySelector('table.note');
        const holToken = holidayDoc.querySelector('input[name="token"]')?.value || '';
        if (holTable) {
          Array.from(holTable.querySelectorAll('tr')).forEach(tr => {
            const cb = tr.querySelector('input[name="exec[]"]');
            if (!cb) return;
            const tds = tr.querySelectorAll('td');
            state.holidayApprovals.push({
              type: '休暇申請',
              execVal: cb.value,
              token: holToken,
              appliedDate: clean(tds[1]?.innerText),
              staff: clean(tds[2]?.innerText),
              targetDate: clean(tds[3]?.innerText),
              holidayType: clean(tds[4]?.innerText),
              reason: clean(tds[5]?.innerText),
              status: clean(tds[7]?.innerText)
            });
          });
        }
      }

      // 3. 打刻エラー
      const parseErrorTable = (doc, categoryLabel) => {
        const list = [];
        if (!doc) return list;
        const tbl = doc.querySelector('table.note');
        if (!tbl) return list;
        Array.from(tbl.querySelectorAll('tr')).slice(1).forEach(tr => {
          const tds = tr.querySelectorAll('td');
          if (tds.length >= 6) {
            list.push({
              code: clean(tds[0]?.innerText),
              staff: clean(tds[1]?.innerText),
              group: clean(tds[2]?.innerText),
              date: clean(tds[3]?.innerText),
              errorType: clean(tds[4]?.innerText) || categoryLabel,
              detailUrl: tds[5]?.querySelector('a')?.getAttribute('href') || ''
            });
          }
        });
        return list;
      };
      state.unmatchErrors = parseErrorTable(unmatchDoc, '打刻漏れ・打刻間違い');
      state.nightErrors = parseErrorTable(nightDoc, '承認なしの深夜残業・未打刻');

      // 4. 本日の勤務状況
      state.todayStaff = [];
      if (todayDoc) {
        const todayTable = todayDoc.querySelector('table.note');
        if (todayTable) {
          const rows = Array.from(todayTable.querySelectorAll('tr')).slice(1);
          for (let i = 0; i < rows.length; i++) {
            const tds = rows[i].querySelectorAll('td');
            if (tds.length >= 8) {
              const staffRaw = clean(tds[0]?.innerText);
              const nameLink = tds[0]?.querySelector('a');
              const name = nameLink ? clean(nameLink.innerText) : staffRaw.split(' ')[0];
              const aditUrl = tds[1]?.querySelector('a')?.getAttribute('href') || '';
              state.todayStaff.push({
                name,
                status: clean(tds[2]?.innerText),
                shift: clean(tds[3]?.innerText),
                clockIn: clean(tds[4]?.innerText),
                clockOut: clean(tds[5]?.innerText),
                workTime: clean(tds[6]?.innerText),
                hasError: clean(tds[9]?.innerText).includes('エラー'),
                aditUrl
              });
            }
          }
        }
      }

      // 5. マイ出勤簿
      state.myAttendance = [];
      if (myAttDoc) {
        const myTables = myAttDoc.querySelectorAll('table.jbc-table');
        if (myTables.length >= 5) {
          const textAll = clean(myAttDoc.body.innerText);
          const mDays = textAll.match(/実働日数\s*(\d+)/);
          const mHours = textAll.match(/実労働時間\s*([\d:]+)/);
          const mOver = textAll.match(/実残業時間\s*([\d:]+)/);
          const mPaid = textAll.match(/有休\s*([\d.]+)/);
          state.mySummary = {
            workDays: mDays ? mDays[1] + '日' : '-',
            workHours: mHours ? mHours[1] : '-',
            overtime: mOver ? mOver[1] : '-',
            paidLeave: mPaid ? mPaid[1] + '日' : '-'
          };
          const calTable = myTables[myTables.length - 1];
          Array.from(calTable.querySelectorAll('tbody tr')).forEach(tr => {
            const tds = tr.querySelectorAll('td');
            if (tds.length >= 10) {
              const dateStr = clean(tds[0]?.childNodes[0]?.textContent || tds[0]?.innerText.split('打刻')[0]);
              state.myAttendance.push({
                date: dateStr,
                holidayType: clean(tds[1]?.innerText),
                shift: clean(tds[2]?.innerText),
                clockIn: clean(tds[3]?.innerText),
                clockOut: clean(tds[4]?.innerText),
                workTime: clean(tds[5]?.innerText),
                overtime: clean(tds[7]?.innerText),
                status: clean(tds[10]?.innerText)
              });
            }
          });
        }
      }

      updateCounters();
      renderActiveTab();
    } catch (err) {
      contentEl.innerHTML = `<div class="jbc-empty">データの取得中にエラーが発生しました。<br>${err.message}</div>`;
    }
  }

  function updateCounters() {
    const totalApprovals = state.aditApprovals.length + state.holidayApprovals.length;
    const totalErrors = state.unmatchErrors.length + state.nightErrors.length;
    const workingNow = state.todayStaff.filter(s => s.status.includes('勤務中')).length;

    document.getElementById('kpi-approvals').textContent = totalApprovals + '件';
    document.getElementById('kpi-errors').textContent = totalErrors + '件';
    document.getElementById('kpi-today').textContent = state.todayStaff.length ? `${workingNow}/${state.todayStaff.length}人` : '-';
    document.getElementById('kpi-mypage').textContent = state.mySummary.workHours || '-';
    document.getElementById('jbc-user-label').textContent = `ジョブカン | ${state.userName}`;

    const bApp = document.getElementById('badge-approvals');
    bApp.style.display = totalApprovals > 0 ? 'inline-block' : 'none';
    bApp.textContent = totalApprovals;

    const bErr = document.getElementById('badge-errors');
    bErr.style.display = totalErrors > 0 ? 'inline-block' : 'none';
    bErr.textContent = totalErrors;
  }

  // ワンタップ承認処理（打刻修正一括承認エンドポイント利用）
  window.jbcQuickApproveAdit = async function(checkboxVal, token, staffName) {
    if (!confirm(`${staffName} さんの打刻修正申請を承認しますか？`)) return;
    try {
      const params = new URLSearchParams();
      params.append('token', token);
      params.append('approved-list', checkboxVal);
      params.append('only_acls', '1');
      params.append('fromtop', '1');
      await fetch('/client/apploved/all-apploved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        credentials: 'same-origin'
      });
      showToast(`✅ ${staffName} さんの打刻修正を承認しました`);
      loadAllData();
    } catch (e) {
      alert('承認通信に失敗しました: ' + e.message);
    }
  };

  // ワンタップ休暇承認・却下処理
  window.jbcQuickActionHoliday = async function(actionType, execVal, token, staffName) {
    const label = actionType === 'approve' ? '承認' : '却下';
    if (!confirm(`${staffName} さんの休暇申請を【${label}】しますか？`)) return;
    try {
      const parts = execVal.split(':');
      const params = new URLSearchParams();
      params.append('token', token);
      params.append('rowIds[0]', parts[2]);
      params.append('ids[0][selected_employee_id]', parts[0]);
      params.append('ids[0][applied_id]', parts[1]);
      params.append('ids[0][approval_id]', parts[3]);
      params.append('ids[0][approval_manager_id]', parts[4]);

      const endpoint = actionType === 'approve'
        ? '/client/employee-holiday-applied/approve?fromtop=1&search_type=term'
        : '/client/employee-holiday-applied/reject?fromtop=1&search_type=term';

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: params.toString(),
        credentials: 'same-origin'
      });
      showToast(`✅ ${staffName} さんの休暇申請を${label}しました`);
      loadAllData();
    } catch (e) {
      alert(`${label}通信に失敗しました: ` + e.message);
    }
  };

  // 出入詳細プレビューモーダル
  window.jbcOpenAditModal = async function(detailUrl, staffName, dateStr) {
    const modal = document.getElementById('jbc-modal');
    const body = document.getElementById('jbc-modal-body');
    modal.classList.add('open');
    body.innerHTML = `
      <div class="jbc-loading" style="padding:24px;">
        <div class="jbc-spinner"></div>
        <div>${staffName} (${dateStr}) の打刻詳細を取得中...</div>
      </div>
    `;
    try {
      const doc = await parseDoc(detailUrl);
      const noteTables = doc.querySelectorAll('table.note');
      const recordTable = noteTables[1];
      const rows = recordTable ? Array.from(recordTable.querySelectorAll('tr')).slice(1) : [];
      const recordsHtml = rows.map(tr => {
        const tds = tr.querySelectorAll('td');
        if (tds.length < 5) return '';
        const typeSel = tds[0]?.querySelector('select');
        const typeTxt = typeSel ? typeSel.options[typeSel.selectedIndex]?.text : clean(tds[0]?.innerText);
        const timeTxt = tds[1]?.querySelector('input')?.value || clean(tds[1]?.innerText);
        const methodTxt = clean(tds[2]?.innerText);
        const noteTxt = clean(tds[4]?.innerText);
        const isPending = tr.innerText.includes('承認') && tr.innerText.includes('却下');
        return `
          <div style="padding:10px 12px; border-radius:10px; background:${isPending ? '#eff6ff' : '#f8fafc'}; border:1px solid ${isPending ? '#93c5fd' : '#e2e8f0'}; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:13px; font-weight:800; color:#0f172a;">${typeTxt || '打刻'} <span style="color:#2563eb; margin-left:6px;">${timeTxt}</span></div>
              <div style="font-size:11px; color:#64748b;">${methodTxt} ${noteTxt ? ' / 備考: ' + noteTxt : ''}</div>
            </div>
            ${isPending ? '<span class="jbc-tag blue">承認待ち</span>' : '<span class="jbc-tag gray">承認済</span>'}
          </div>
        `;
      }).join('');

      body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:15px; font-weight:800;">${staffName} の出入詳細</div>
            <div style="font-size:11px; color:#64748b;">対象日: ${dateStr}</div>
          </div>
          <button class="jbc-btn secondary" style="flex:0; padding:6px 12px;" onclick="document.getElementById('jbc-modal').classList.remove('open')">✕ 閉じる</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${recordsHtml || '<div class="jbc-empty">打刻履歴がありません</div>'}
        </div>
        <div class="jbc-btn-row" style="margin-top:6px;">
          <a href="${detailUrl}" class="jbc-btn primary">📝 この日の打刻修正・詳細画面へ</a>
        </div>
      `;
    } catch (e) {
      body.innerHTML = `<div class="jbc-empty">詳細の取得に失敗しました: ${e.message}</div>`;
    }
  };

  function renderActiveTab() {
    const contentEl = document.getElementById('jbc-main-content');
    document.querySelectorAll('.jbc-nav-btn, .jbc-kpi-card').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === state.activeTab);
    });

    if (state.activeTab === 'approvals') renderApprovals(contentEl);
    else if (state.activeTab === 'errors') renderErrors(contentEl);
    else if (state.activeTab === 'today') renderToday(contentEl);
    else if (state.activeTab === 'mypage') renderMyPage(contentEl);
    else if (state.activeTab === 'menu') renderQuickMenu(contentEl);
  }

  function renderApprovals(container) {
    let html = `
      <div class="jbc-sec-head">
        <div class="jbc-sec-title">🕒 未承認の打刻修正申請</div>
        <span class="jbc-sec-count">${state.aditApprovals.length}件</span>
      </div>
    `;

    if (state.aditApprovals.length === 0) {
      html += `<div class="jbc-empty">未承認の打刻修正はありません 🎉</div>`;
    } else {
      state.aditApprovals.forEach((item) => {
        const safeVal = item.checkboxVal.replace(/'/g, "\\'");
        html += `
          <div class="jbc-card urgent">
            <div class="jbc-card-top">
              <div>
                <div class="jbc-staff-name">👤 ${item.staff}</div>
                <div class="jbc-staff-group">${item.appliedAt || item.summary}</div>
              </div>
              <span class="jbc-tag blue">${item.type}</span>
            </div>
            <div class="jbc-info-grid">
              <div class="jbc-info-item">
                <span class="jbc-info-label">対象日</span>
                <span class="jbc-info-val">${item.date}</span>
              </div>
              <div class="jbc-info-item">
                <span class="jbc-info-label">労働時間 / 残業</span>
                <span class="jbc-info-val">${item.workTime.split('⇒').pop()} (残 ${item.overtime.split('⇒').pop()})</span>
              </div>
              <div class="jbc-info-item">
                <span class="jbc-info-label">出勤時刻</span>
                <span class="jbc-info-val">${item.clockIn}</span>
              </div>
              <div class="jbc-info-item">
                <span class="jbc-info-label">退勤時刻</span>
                <span class="jbc-info-val">${item.clockOut}</span>
              </div>
            </div>
            <div class="jbc-btn-row">
              <button class="jbc-btn secondary" onclick="jbcOpenAditModal('${item.detailUrl}', '${item.staff}', '${item.date}')">🔍 内訳を見る</button>
              <button class="jbc-btn success" onclick="jbcQuickApproveAdit('${safeVal}', '${item.token}', '${item.staff}')">✅ この場で承認</button>
            </div>
          </div>
        `;
      });
    }

    html += `
      <div class="jbc-sec-head" style="margin-top:6px;">
        <div class="jbc-sec-title">🌴 未承認の休暇申請</div>
        <span class="jbc-sec-count">${state.holidayApprovals.length}件</span>
      </div>
    `;

    if (state.holidayApprovals.length === 0) {
      html += `<div class="jbc-empty">未承認の休暇申請はありません 🎉</div>`;
    } else {
      state.holidayApprovals.forEach(item => {
        html += `
          <div class="jbc-card urgent">
            <div class="jbc-card-top">
              <div>
                <div class="jbc-staff-name">👤 ${item.staff}</div>
                <div class="jbc-staff-group">申請日: ${item.appliedDate} | ${item.status}</div>
              </div>
              <span class="jbc-tag purple">${item.holidayType}</span>
            </div>
            <div class="jbc-info-grid">
              <div class="jbc-info-item">
                <span class="jbc-info-label">休暇希望日</span>
                <span class="jbc-info-val" style="color:#2563eb;">${item.targetDate}</span>
              </div>
              <div class="jbc-info-item">
                <span class="jbc-info-label">休暇理由</span>
                <span class="jbc-info-val">${item.reason || '-'}</span>
              </div>
            </div>
            <div class="jbc-btn-row">
              <button class="jbc-btn danger" style="flex:0.45;" onclick="jbcQuickActionHoliday('reject', '${item.execVal}', '${item.token}', '${item.staff}')">✕ 却下</button>
              <button class="jbc-btn success" onclick="jbcQuickActionHoliday('approve', '${item.execVal}', '${item.token}', '${item.staff}')">✅ この場で承認</button>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;
  }

  function renderErrors(container) {
    const allErrors = [
      ...state.unmatchErrors.map(e => ({ ...e, kind: 'unmatch' })),
      ...state.nightErrors.map(e => ({ ...e, kind: 'night' }))
    ];
    const filtered = allErrors.filter(e => state.errorFilter === 'all' || e.kind === state.errorFilter);

    let html = `
      <div class="jbc-pills">
        <button class="jbc-pill ${state.errorFilter === 'all' ? 'active' : ''}" onclick="window.jbcSetErrFilter('all')">すべて (${allErrors.length})</button>
        <button class="jbc-pill ${state.errorFilter === 'unmatch' ? 'active' : ''}" onclick="window.jbcSetErrFilter('unmatch')">🔴 打刻漏れ・間違い (${state.unmatchErrors.length})</button>
        <button class="jbc-pill ${state.errorFilter === 'night' ? 'active' : ''}" onclick="window.jbcSetErrFilter('night')">🟡 深夜残業・未打刻 (${state.nightErrors.length})</button>
      </div>
    `;

    if (filtered.length === 0) {
      html += `<div class="jbc-empty">該当する打刻エラーはありません 🎉</div>`;
    } else {
      filtered.forEach(err => {
        const isUnmatch = err.kind === 'unmatch';
        html += `
          <div class="jbc-card ${isUnmatch ? 'alert-unmatch' : 'alert-night'}">
            <div class="jbc-card-top">
              <div>
                <div class="jbc-staff-name">👤 ${err.staff} <span style="font-size:11px; color:#64748b; font-weight:500;">(${err.code})</span></div>
                <div class="jbc-staff-group">${err.group}</div>
              </div>
              <span class="jbc-tag ${isUnmatch ? 'red' : 'amber'}">${err.errorType}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:8px 12px; border-radius:10px;">
              <div>
                <span style="font-size:11px; color:#64748b; font-weight:600;">対象日: </span>
                <span style="font-size:13px; font-weight:800; color:#0f172a;">${err.date}</span>
              </div>
              <button class="jbc-btn secondary" style="flex:0; padding:6px 12px; font-size:11px;" onclick="jbcOpenAditModal('${err.detailUrl}', '${err.staff}', '${err.date}')">🔍 打刻を確認</button>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;
  }

  window.jbcSetErrFilter = function(f) {
    state.errorFilter = f;
    renderActiveTab();
  };

  function renderToday(container) {
    const workingCount = state.todayStaff.filter(s => s.status.includes('勤務中')).length;
    const leftCount = state.todayStaff.filter(s => s.status.includes('退出中')).length;

    const filtered = state.todayStaff.filter(s => {
      if (state.todayFilter === 'working') return s.status.includes('勤務中');
      if (state.todayFilter === 'left') return s.status.includes('退出中');
      return true;
    });

    let html = `
      <div class="jbc-pills">
        <button class="jbc-pill ${state.todayFilter === 'all' ? 'active' : ''}" onclick="window.jbcSetTodayFilter('all')">全員 (${state.todayStaff.length})</button>
        <button class="jbc-pill ${state.todayFilter === 'working' ? 'active' : ''}" onclick="window.jbcSetTodayFilter('working')">🟢 勤務中 (${workingCount})</button>
        <button class="jbc-pill ${state.todayFilter === 'left' ? 'active' : ''}" onclick="window.jbcSetTodayFilter('left')">⚪ 退出済 (${leftCount})</button>
      </div>
    `;

    filtered.forEach(s => {
      const isWorking = s.status.includes('勤務中');
      html += `
        <div class="jbc-card">
          <div class="jbc-card-top">
            <div>
              <div class="jbc-staff-name">
                <span>${isWorking ? '🟢' : '⚪'} ${s.name}</span>
                ${s.hasError ? '<span class="jbc-tag red" style="font-size:10px;">要確認エラー</span>' : ''}
              </div>
              <div class="jbc-staff-group">シフト: ${s.shift}</div>
            </div>
            <span class="jbc-tag ${isWorking ? 'green' : 'gray'}">${s.status}</span>
          </div>
          <div class="jbc-info-grid" style="grid-template-columns: repeat(3, 1fr);">
            <div class="jbc-info-item">
              <span class="jbc-info-label">出勤</span>
              <span class="jbc-info-val">${s.clockIn.split(' ')[0]}</span>
            </div>
            <div class="jbc-info-item">
              <span class="jbc-info-label">退勤</span>
              <span class="jbc-info-val">${s.clockOut.split(' ')[0]}</span>
            </div>
            <div class="jbc-info-item">
              <span class="jbc-info-label">労働時間</span>
              <span class="jbc-info-val">${s.workTime}</span>
            </div>
          </div>
          <div class="jbc-btn-row">
            <button class="jbc-btn secondary" onclick="jbcOpenAditModal('${s.aditUrl}', '${s.name}', '本日')">🔍 出入詳細を見る</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  window.jbcSetTodayFilter = function(f) {
    state.todayFilter = f;
    renderActiveTab();
  };

  function renderMyPage(container) {
    let html = `
      <div class="jbc-card" style="background: linear-gradient(135deg, #1e3a8a, #1d4ed8); color:#fff; border:none;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:11px; opacity:0.85;">マイページ集計（当月）</div>
            <div style="font-size:16px; font-weight:800;">${state.userName}</div>
          </div>
          <a href="https://ssl.jobcan.jp/employee/adit" class="jbc-btn" style="flex:0; background:#fff; color:#1d4ed8; padding:7px 12px; font-size:11px;">✏️ 打刻修正</a>
        </div>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; background:rgba(255,255,255,0.12); padding:10px; border-radius:12px; text-align:center;">
          <div><div style="font-size:10px; opacity:0.8;">実働日数</div><div style="font-size:13px; font-weight:800;">${state.mySummary.workDays}</div></div>
          <div><div style="font-size:10px; opacity:0.8;">実労働時間</div><div style="font-size:13px; font-weight:800;">${state.mySummary.workHours}</div></div>
          <div><div style="font-size:10px; opacity:0.8;">残業時間</div><div style="font-size:13px; font-weight:800;">${state.mySummary.overtime}</div></div>
          <div><div style="font-size:10px; opacity:0.8;">有休残</div><div style="font-size:13px; font-weight:800;">${state.mySummary.paidLeave}</div></div>
        </div>
        <div class="jbc-btn-row">
          <a href="https://ssl.jobcan.jp/employee/holiday" class="jbc-btn" style="background:rgba(255,255,255,0.18); color:#fff; font-size:11px; padding:8px;">🌴 休暇申請</a>
          <a href="https://ssl.jobcan.jp/employee/over-work" class="jbc-btn" style="background:rgba(255,255,255,0.18); color:#fff; font-size:11px; padding:8px;">🌙 残業申請</a>
        </div>
      </div>

      <div class="jbc-sec-head">
        <div class="jbc-sec-title">📅 当月の出勤簿（カード表示）</div>
      </div>
    `;

    if (state.myAttendance.length === 0) {
      html += `<div class="jbc-empty">マイページにログインすると自分の出勤簿が表示されます。<br><a href="https://ssl.jobcan.jp/employee" style="color:#2563eb; font-weight:700;">マイページを開く ›</a></div>`;
    } else {
      state.myAttendance.forEach(day => {
        const isWork = day.clockIn || day.workTime;
        const isHoliday = day.holidayType.includes('公休') || day.holidayType.includes('祝');
        if (!isWork && isHoliday) return;
        html += `
          <div class="jbc-card" style="padding:10px 14px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:13px; font-weight:800; color:#0f172a;">
                ${day.date}
                ${day.status ? `<span class="jbc-tag purple" style="margin-left:6px;">${day.status}</span>` : ''}
              </div>
              <div style="font-size:12px; font-weight:700; color:#2563eb;">
                ${day.clockIn ? `${day.clockIn} 〜 ${day.clockOut || '勤務中'}` : day.holidayType}
              </div>
            </div>
            ${day.workTime ? `
              <div style="display:flex; gap:14px; font-size:11px; color:#64748b;">
                <span>実働: <strong style="color:#1e293b">${day.workTime}</strong></span>
                <span>残業: <strong style="color:#1e293b">${day.overtime || '00:00'}</strong></span>
                <span>シフト: ${day.shift}</span>
              </div>
            ` : ''}
          </div>
        `;
      });
    }

    container.innerHTML = html;
  }

  function renderQuickMenu(container) {
    const links = [
      { section: '管理者：よく使う承認・確認', items: [
        { icon: '🕒', title: '未承認打刻一覧', desc: 'スタッフの打刻修正申請を承認・却下', url: 'https://ssl.jobcan.jp/client/apploved' },
        { icon: '🌴', title: '休暇申請一覧', desc: '有休・振休などの申請を承認・却下', url: 'https://ssl.jobcan.jp/client/employee-holiday-applied' },
        { icon: '🌙', title: '残業申請一覧', desc: '残業申請の確認・承認', url: 'https://ssl.jobcan.jp/client/employee-over-work-applied' },
        { icon: '⚠️', title: '打刻エラー一覧', desc: '打刻漏れ・承認なし深夜残業の確認', url: 'https://ssl.jobcan.jp/client/not-leave' },
        { icon: '👥', title: '本日の勤務状況', desc: 'リアルタイムの出退勤・労働時間一覧', url: 'https://ssl.jobcan.jp/client/work-state/show/?submit_type=today&searching=1&list_type=normal&number_par_page=30&group_where_type=main&retirement=work' },
        { icon: '📊', title: '月間の勤務状況・出勤簿', desc: '日次・月次の出勤簿管理', url: 'https://ssl.jobcan.jp/client/adit-manage/?search_type=day' }
      ]},
      { section: 'スタッフマイページ（個人用）', items: [
        { icon: '🏠', title: 'マイページ トップ', desc: '個人用のダッシュボード', url: 'https://ssl.jobcan.jp/employee' },
        { icon: '📅', title: 'マイ出勤簿', desc: '自分の月次出勤簿・労働時間集計', url: 'https://ssl.jobcan.jp/employee/attendance' },
        { icon: '✏️', title: '打刻修正申請', desc: '自分の打刻時刻の追加・修正', url: 'https://ssl.jobcan.jp/employee/adit' },
        { icon: '🏖️', title: '休暇申請', desc: '有休・特別休暇などの新規申請', url: 'https://ssl.jobcan.jp/employee/holiday' }
      ]}
    ];

    let html = '';
    links.forEach(group => {
      html += `<div class="jbc-sec-head"><div class="jbc-sec-title">${group.section}</div></div>`;
      group.items.forEach(item => {
        html += `
          <a href="${item.url}" class="jbc-card" style="text-decoration:none; flex-direction:row; align-items:center; justify-content:space-between; padding:11px 14px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:20px;">${item.icon}</span>
              <div>
                <div style="font-size:13px; font-weight:800; color:#0f172a;">${item.title}</div>
                <div style="font-size:11px; color:#64748b;">${item.desc}</div>
              </div>
            </div>
            <span style="color:#94a3b8; font-weight:800;">›</span>
          </a>
        `;
      });
    });

    container.innerHTML = html;
  }

  document.querySelectorAll('.jbc-nav-btn, .jbc-kpi-card').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      renderActiveTab();
    });
  });

  document.getElementById('jbc-refresh-btn').addEventListener('click', loadAllData);
  document.getElementById('jbc-min-btn').addEventListener('click', () => {
    root.classList.add('jbc-minimized');
  });
  document.getElementById('jbc-restore-btn').addEventListener('click', () => {
    root.classList.remove('jbc-minimized');
  });
  document.getElementById('jbc-modal').addEventListener('click', (e) => {
    if (e.target.id === 'jbc-modal') e.target.classList.remove('open');
  });

  loadAllData();
})();
