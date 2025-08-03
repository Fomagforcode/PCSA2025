const bcrypt = require("bcryptjs")

const passwords = {
  admin_cotabato: "Cotabato2024!",
  admin_sulu: "Sulu2024!",
  admin_lanao: "Lanao2024!",
  admin_tawi: "Tawi2024!",
  main_admin: "MainAdmin2024!",
}

async function hashPasswords() {
  console.log("Hashed passwords for database:")
  console.log("================================")

  for (const [username, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10)
    console.log(`${username}: ${hash}`)
  }
}

hashPasswords()
