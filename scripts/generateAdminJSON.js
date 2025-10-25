const bcrypt = require('bcrypt');

async function generateAdminJSON() {
  const email = 'sofiagilestupinalnueva@gamil.com';
  const password = 'S0f1A.%%';
  
  // Generar hash de la contraseña
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Crear el documento JSON para insertar
  const adminDocument = {
    email: email,
    passwordHash: passwordHash,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('JSON para insertar en MongoDB Atlas:');
  console.log('=====================================');
  console.log(JSON.stringify(adminDocument, null, 2));
  console.log('=====================================');
  console.log('\nPasos para insertar en MongoDB Atlas:');
  console.log('1. Ve a tu cluster en MongoDB Atlas');
  console.log('2. Haz clic en "Browse Collections"');
  console.log('3. Selecciona la base de datos "test"');
  console.log('4. Selecciona la colección "admins"');
  console.log('5. Haz clic en "INSERT DOCUMENT"');
  console.log('6. Copia y pega el JSON de arriba');
  console.log('7. Haz clic en "Insert"');
}

generateAdminJSON().catch(console.error);