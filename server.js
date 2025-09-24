// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// node-fetch (compatível com CommonJS)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// ───── Middlewares globais ─────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ───── Health check ─────
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date() }));

// ───── Proxy ViaCEP ─────
app.get('/api/cep/:cep', async (req, res) => {
  const cep = (req.params.cep || '').replace(/\D/g, '');
  if (!cep || cep.length !== 8) {
    return res.status(400).json({ error: 'CEP inválido. Use 8 dígitos.' });
  }
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await r.json();
    if (data.erro) return res.status(404).json({ error: 'CEP não encontrado' });
    res.json({
      cep: data.cep,
      endereco: data.logradouro,
      bairro: data.bairro,
      cidade: data.localidade,
      estado: data.uf
    });
  } catch (err) {
    console.error('Erro ViaCEP:', err);
    res.status(500).json({ error: 'Erro ao consultar ViaCEP' });
  }
});

// ───── Rotas da API ─────
try {
  const studentsRouter = require('./routes/students');
  app.use('/api/students', studentsRouter); // rota principal
  app.use('/alunos', studentsRouter);       // alias para funcionar direto no navegador
} catch (err) {
  console.warn('Aviso: routes/students.js não encontrada. Rota /api/students não foi montada.');
  app.post('/api/students', (req, res) => {
    console.log('POST /api/students (simulado):', req.body);
    res.status(201).json({ message: 'Simulação: matrícula recebida.' });
  });
}

// ───── Servir arquivos estáticos do front-end ─────
app.use(express.static(path.join(__dirname, 'public')));

// ───── Fallback SPA ─────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint não encontrado' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ───── Conectar ao MongoDB e iniciar servidor ─────
async function start() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('ERRO: variável MONGO_URI não definida no .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Conectado ao MongoDB');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });

    const shutdown = async () => {
      console.log('Encerrando servidor...');
      server.close(async () => {
        await mongoose.disconnect();
        console.log('Conexão com MongoDB encerrada.');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('❌ Falha ao conectar ao MongoDB:', err);
    process.exit(1);
  }
}

start();
