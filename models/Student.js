const mongoose = require('mongoose');

// Definição do esquema do aluno
const studentSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cpf: { type: String, required: true, unique: true },
  cep: { type: String, required: true },
  endereco: { type: String, required: true },
  numero: { type: String },
  complemento: { type: String },
  bairro: { type: String, required: true },
  cidade: { type: String, required: true },
  estado: { type: String, required: true },
  curso: { type: String, required: true },
  dataMatricula: { type: Date, default: Date.now },
});

// Cria o modelo chamado 'Student'
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
