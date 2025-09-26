// models/student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true },
  nascimento: { type: String, required: true },
  cpf: { type: String, required: true, unique: true, trim: true },
  cep: { type: String, required: true },
  endereco: { type: String, required: true },
  numero: { type: String, required: true },
  complemento: { type: String },
  bairro: { type: String, required: true },
  cidade: { type: String, required: true },
  estado: { type: String, required: true },
  curso: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now }
});

// evita recriar o model no serverless
module.exports = mongoose.models.Student || mongoose.model('Student', StudentSchema);
