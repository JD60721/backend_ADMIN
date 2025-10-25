const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Modelo Admin
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'admin' },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Conectado a MongoDB Atlas');

    // Credenciales del admin
    const email = 'sofiagilestupinalnueva@gamil.com';
    const password = 'S0f1A.%%';

    // Verificar si ya existe
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log('El administrador ya existe en la base de datos');
      process.exit(0);
    }

    // Crear hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear el admin
    const admin = new Admin({
      email,
      passwordHash,
      role: 'admin'
    });

    await admin.save();
    console.log('Administrador creado exitosamente:');
    console.log(`Email: ${email}`);
    console.log(`ID: ${admin._id}`);
    console.log(`Creado: ${admin.createdAt}`);

  } catch (error) {
    console.error('Error creando administrador:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

createAdmin();