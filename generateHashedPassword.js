const bcrypt = require('bcryptjs');

const password = 'joao'; // Replace 'your_desired_password' with the desired password
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('Hashed Password:', hashedPassword);
