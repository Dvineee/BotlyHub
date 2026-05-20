
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    console.log("Keys in .env:");
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const parts = trimmed.split('=');
            console.log(`- ${parts[0]}: length = ${parts[1]?.length || 0}`);
        }
    }
} else {
    console.log(".env file does not exist");
}
