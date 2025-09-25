// api/students.js
const mongoose = require('mongoose');
const Student = require('models/student.js'); // ajuste o caminho se necessário

const MONGO_URI = process.env.MONGO_URI;

// Função para conectar ao banco (serverless friendly)
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}

// ----------------------
// Handler Serverless
// ----------------------
module.exports = async (req, res) => {
  await connectDB();

  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { nome, nascimento, cpf, cep, endereco, numero, complemento, bairro, cidade, estado, curso } = req.body;

        if (!nome || !nascimento || !cpf || !cep || !endereco || !numero || !bairro || !cidade || !estado || !curso) {
          return res.status(422).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
        }

        const novoAluno = new Student({ nome, nascimento, cpf, cep, endereco, numero, complemento, bairro, cidade, estado, curso });
        await novoAluno.save();

        return res.status(201).json({ message: 'Matrícula salva com sucesso!', aluno: novoAluno });
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }

    case 'GET':
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

        return res.json({
          page,
          totalPages: Math.ceil(total / limit),
          totalAlunos: total,
          alunos
        });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Método ${method} não permitido`);
  }
};

