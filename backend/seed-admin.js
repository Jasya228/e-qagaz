const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Создание аккаунта администратора...');
  
  const email = 'admin@aspc.kz';
  const password = 'admin'; // Можете поменять пароль здесь
  const passwordHash = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  
  if (existingAdmin) {
    console.log(`Админ ${email} уже существует. Обновляем пароль...`);
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: 'ADMIN' }
    });
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: 'Главный',
        lastName: 'Администратор',
        role: 'ADMIN',
        isActive: true
      }
    });
    console.log(`Успешно создан админ: ${email}`);
  }
  
  console.log(`Ваш логин: ${email}`);
  console.log(`Ваш пароль: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
