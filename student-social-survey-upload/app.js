const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = '123456';
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
}

function readData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeData(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
}

const requiredFields = Array.from({ length: 17 }, (_, index) => `q${index + 1}`);

function validateSubmission(body) {
  for (const field of requiredFields) {
    if (field === 'q4') {
      if (!Array.isArray(body.q4) || body.q4.length !== 2 || body.q4.some((item) => !item)) {
        return false;
      }
      continue;
    }

    if (typeof body[field] !== 'string' || !body[field].trim()) {
      return false;
    }
  }

  return true;
}

ensureDataFile();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/submit', (req, res) => {
  if (!validateSubmission(req.body)) {
    return res.status(400).json({ success: false, message: '请完整填写问卷，第4题需且只能选择2项。' });
  }

  const records = readData();
  const record = {
    timestamp: new Date().toISOString()
  };

  for (const field of requiredFields) {
    record[field] = field === 'q4' ? req.body[field] : req.body[field].trim();
  }

  records.push(record);
  writeData(records);

  return res.json({ success: true, message: '提交成功' });
});

app.post('/api/login', (req, res) => {
  if (req.body && req.body.password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_PASSWORD });
  }

  return res.status(401).json({ success: false, message: '密码错误' });
});

app.get('/api/results', (req, res) => {
  const authHeader = req.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }

  const records = readData().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return res.json({ success: true, data: records });
});

app.listen(PORT, () => {
  console.log(`问卷网站已启动：http://localhost:${PORT}`);
});
