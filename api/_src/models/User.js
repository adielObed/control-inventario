const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email:  { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

// Hash password antes de guardar
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  console.log('... Encriptando contraseña');
  this.password = await bcrypt.hash(this.password, 10);
  console.log('... Encriptado OK');
});

module.exports = mongoose.model('User', userSchema);
