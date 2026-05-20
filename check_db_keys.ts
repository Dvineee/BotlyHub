import dotenv from 'dotenv';
dotenv.config();

console.log("Checking for database/postgres/password keys in process.env:");
for (const key of Object.keys(process.env)) {
    if (key.includes("DB") || key.includes("POSTGRES") || key.includes("PASS") || key.includes("CONN") || key.includes("URI")) {
        console.log(`- ${key}: ${process.env[key] ? 'exists' : 'empty'}`);
    }
}
