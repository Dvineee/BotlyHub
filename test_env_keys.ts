import dotenv from 'dotenv';
dotenv.config();

console.log("All Environment Keys:");
for (const key of Object.keys(process.env)) {
    console.log(`- ${key}`);
}
