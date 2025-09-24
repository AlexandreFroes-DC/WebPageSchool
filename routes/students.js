// routes/students.js
const express = require('express');
const router = express.Router();
const Student = require('../models/student.js');
const mongoose = require('mongoose');

/**
 * POST /api/students
 * Cria uma nova matrícula
 */
router.post('/', async (req, res) => {
  try {
    const { nome, nascimento, cpf, cep, endereco, numero, complemento, bairro, cidade, estado, curso } = req.body;

    if (!nome || !nascimento || !cpf || !cep || !endereco || !numero || !bairro || !cidade || !estado || !curso) {
      return res.status(422).json({ error: 'Nome, CPF e curso são obrigatórios.' });
    }

    const novoAluno = new Student({ nome, nascimento, cpf, cep, endereco, numero, complemento, bairro, cidade, estado, curso });
    await novoAluno.save();
    res.status(201).json({ message: 'Matrícula salva com sucesso!', aluno: novoAluno });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /api/students
 * Lista alunos com filtros, pesquisa por CPF e paginação
 */
router.get('/', async (req, res) => {
  try {
    const { cpf, curso, search } = req.query;
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    page = Math.max(page, 1);
    limit = Math.max(limit, 1);

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

    const skip = (page - 1) * limit;
    const alunos = await Student.find(filtro)
      .skip(skip)
      .limit(limit)
      .sort({ criadoEm: -1 });

    const total = await Student.countDocuments(filtro);

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalAlunos: total,
      alunos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/students/:id
 * Busca um aluno pelo ID
 */
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const aluno = await Student.findById(req.params.id);
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });
    res.json(aluno);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/students/:id
 * Atualiza dados de um aluno
 */
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const aluno = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });
    res.json({ message: 'Dados atualizados com sucesso!', aluno });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/students/:id
 * Remove um aluno
 */
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }

    const aluno = await Student.findByIdAndDelete(req.params.id);
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });
    res.json({ message: 'Aluno removido com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
