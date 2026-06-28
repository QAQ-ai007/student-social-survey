const loginPanel = document.getElementById('loginPanel');
const resultPanel = document.getElementById('resultPanel');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const loginMessage = document.getElementById('loginMessage');
const recordCount = document.getElementById('recordCount');
const emptyState = document.getElementById('emptyState');
const tableWrap = document.getElementById('tableWrap');
const resultsBody = document.getElementById('resultsBody');

const fields = Array.from({ length: 17 }, (_, index) => `q${index + 1}`);

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString('zh-CN', { hour12: false });
}

function getToken() {
  return sessionStorage.getItem('adminToken') || '';
}

function setLoginState(loggedIn) {
  loginPanel.classList.toggle('hidden', loggedIn);
  resultPanel.classList.toggle('hidden', !loggedIn);
}

function renderResults(records) {
  recordCount.textContent = `共 ${records.length} 条记录`;
  resultsBody.innerHTML = '';

  if (records.length === 0) {
    emptyState.classList.remove('hidden');
    tableWrap.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  tableWrap.classList.remove('hidden');

  const rows = records.map((record) => {
    const answerCells = fields.map((field) => {
      const value = Array.isArray(record[field]) ? record[field].join('、') : record[field];
      return `<td>${escapeHtml(value)}</td>`;
    }).join('');

    return `<tr><td>${escapeHtml(formatTime(record.timestamp))}</td>${answerCells}</tr>`;
  }).join('');

  resultsBody.innerHTML = rows;
}

async function loadResults() {
  const response = await fetch('/api/results', {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || '获取数据失败');
  }

  renderResults(result.data);
}

async function login() {
  const password = passwordInput.value.trim();
  if (!password) {
    loginMessage.textContent = '请输入管理员密码';
    loginMessage.classList.add('error');
    return;
  }

  loginButton.disabled = true;
  loginButton.textContent = '验证中...';
  loginMessage.textContent = '';

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || '密码错误');
    }

    sessionStorage.setItem('adminToken', result.token);
    setLoginState(true);
    await loadResults();
  } catch (error) {
    loginMessage.textContent = error.message;
    loginMessage.classList.add('error');
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = '进入';
  }
}

loginButton.addEventListener('click', login);
passwordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    login();
  }
});

logoutButton.addEventListener('click', () => {
  sessionStorage.removeItem('adminToken');
  passwordInput.value = '';
  setLoginState(false);
});

if (getToken()) {
  setLoginState(true);
  loadResults().catch(() => {
    sessionStorage.removeItem('adminToken');
    setLoginState(false);
  });
} else {
  setLoginState(false);
}
