console.log("Environment keys:", Object.keys(process.env).filter(k => !k.includes("KEY") && !k.includes("SECRET") && !k.includes("TOKEN") && !k.includes("PASSWORD")));
console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log("Database URL configured?:", !!process.env.DATABASE_URL);
console.log("PGHOST configured?:", !!process.env.PGHOST);
