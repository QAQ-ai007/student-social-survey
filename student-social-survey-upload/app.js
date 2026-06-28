const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');
const DATABASE_URL = process.env.DATABASE_URL;

const requiredFields = Array.from({ length: 17 }, (_, index) => `q${index + 1}`);

const pool = DATABASE_URL
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false }
    })
  : null;

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
}

function readFileData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeFileData(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
}

async function initStorage() {
  if (!pool) {
    ensureDataFile();
    return;
  }

  await pool.query(`
    create table if not exists survey_responses (
      id bigserial primary key,
      timestamp timestamptz not null default now(),
      data jsonb not null
    )
  `);
}

async function saveRecord(record) {
  if (!pool) {
    const records = readFileData();
    records.push(record);
    writeFileData(records);
    return;
  }

  const { timestamp, ...answers } = record;
  await pool.query(
    'insert into survey_responses (timestamp, data) values ($1, $2)',
    [timestamp, answers]
  );
}

async function getRecords() {
  if (!pool) {
    return readFileData().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  const result = await pool.query(
    'select timestamp, data from survey_responses order by timestamp desc'
  );

  return result.rows.map((row) => ({
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : row.timestamp,
    ...row.data
  }));
}

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

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.post('/submit', async (req, res) => {
  try {
    if (!validateSubmission(req.body)) {
      return res.status(400).json({ success: false, message: '请完整填写问卷，第4题需且只能选择2项。' });
    }

    const record = {
      timestamp: new Date().toISOString()
    };

    for (const field of requiredFields) {
      record[field] = field === 'q4' ? req.body[field] : req.body[field].trim();
    }

    await saveRecord(record);
    return res.json({ success: true, message: '提交成功' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: '提交失败，请稍后再试。' });
  }
});

app.post('/api/login', (req, res) => {
  if (req.body && req.body.password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_PASSWORD });
  }

  return res.status(401).json({ success: false, message: '密码错误' });
});

app.get('/api/results', async (req, res) => {
  try {
    const authHeader = req.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (token !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: '未授权访问' });
    }

    const records = await getRecords();
    return res.json({ success: true, data: records });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: '获取数据失败，请稍后再试。' });
  }
});

initStorage()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`问卷网站已启动：http://localhost:${PORT}`);
      console.log(pool ? '当前使用 PostgreSQL 数据库存储。' : `当前使用本地文件存储：${DATA_FILE}`);
    });
  })
  .catch((error) => {
    console.error('服务启动失败：', error);
    process.exit(1);
  });
