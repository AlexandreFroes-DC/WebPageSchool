// api/students.js
const mongoose = require('mongoose');
const Student = require('../models/student.js'); // caminho correto

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
}

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao conectar ao banco: ' + err.message });
  }

  const { method } = req;

  // ---------------- POST ----------------
  if (method === 'POST') {
    try {
      const novoAluno = new Student(req.body);
      await novoAluno.save();
      return res.status(201).json({ message: 'Matrícula salva com sucesso!', aluno: novoAluno });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ---------------- GET ----------------
  if (method === 'GET') {
    try {
      const { cpf, curso, search } = req.query;
      const filtro = {};

      if (cpf) filtro.cpf = cpf;
      if (curso) filtro.curso = curso;
      if (search) {
        filtro.$or = [
          { nome: new RegExp(search, 'i') },
          { cidade: new RegExp(search, 'i') },
          { bairro: new RegExp(search, 'i') }
        ];
      }

      const alunos = await Student.find(filtro).sort({ criadoEm: -1 });
      return res.json(alunos);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ---------------- PUT ----------------
  if (method === 'PUT') {
    try {
      const { id, ...updateData } = req.body;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido para atualização.' });
      }

      const aluno = await Student.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });

      return res.json({ message: 'Dados atualizados com sucesso!', aluno });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ---------------- DELETE ----------------
  if (method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido para exclusão.' });
      }

      const aluno = await Student.findByIdAndDelete(id);
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });

      return res.json({ message: 'Aluno removido com sucesso!' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ---------------- MÉTODO NÃO PERMITIDO ----------------
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Método ${method} não permitido`);
};
// api/students.js
const mongoose = require('mongoose');
const Student = require('../models/student.js'); // caminho correto

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
}

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao conectar ao banco: ' + err.message });
  }

  const { method } = req;

  // ---------------- POST ----------------
  if (method === 'POST') {
    try {
      const novoAluno = new Student(req.body);
      await novoAluno.save();
      return res.status(201).json({ message: 'Matrícula salva com sucesso!', aluno: novoAluno });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ---------------- GET ----------------
  if (method === 'GET') {
    try {
      const { cpf, curso, search } = req.query;
      const filtro = {};

      if (cpf) filtro.cpf = cpf;
      if (curso) filtro.curso = curso;
      if (search) {
        filtro.$or = [
          { nome: new RegExp(search, 'i') },
          { cidade: new RegExp(search, 'i') },
          { bairro: new RegExp(search, 'i') }
        ];
      }

      const alunos = await Student.find(filtro).sort({ criadoEm: -1 });
      return res.json(alunos);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ---------------- PUT ----------------
  if (method === 'PUT') {
    try {
      const { id, ...updateData } = req.body;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido para atualização.' });
      }

      const aluno = await Student.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });

      return res.json({ message: 'Dados atualizados com sucesso!', aluno });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ---------------- DELETE ----------------
  if (method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'ID inválido para exclusão.' });
      }

      const aluno = await Student.findByIdAndDelete(id);
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });

      return res.json({ message: 'Aluno removido com sucesso!' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ---------------- MÉTODO NÃO PERMITIDO ----------------
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).end(`Método ${method} não permitido`);
};
