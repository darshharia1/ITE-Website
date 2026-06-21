// src/db/seedStudents.js
const db = require('../config/db');

const emails = [
  "bt25min036@students.vnit.ac.in", "bt25eee085@students.vnit.ac.in", "bt23eee026@students.vnit.ac.in", 
  "bt24eee010@students.vnit.ac.in", "bt23eee041@students.vnit.ac.in", "bt24mme094@students.vnit.ac.in", 
  "bt25mec065@students.vnit.ac.in", "bt23eee066@students.vnit.ac.in", "bt23eee032@students.vnit.ac.in", 
  "bt24mec015@students.vnit.ac.in", "bt23mec077@students.vnit.ac.in", "bt25civ089@students.vnit.ac.in", 
  "bt25mec037@students.vnit.ac.in", "bt23cme105@students.vnit.ac.in", "bt25civ013@students.vnit.ac.in", 
  "bt25eee069@students.vnit.ac.in", "bt25mec112@students.vnit.ac.in", "bt24mme088@students.vnit.ac.in", 
  "bt24eee070@students.vnit.ac.in", "bt24eee033@students.vnit.ac.in", "bt24eee060@students.vnit.ac.in", 
  "bt25civ046@students.vnit.ac.in", "bt24ece109@students.vnit.ac.in", "bt24mme065@students.vnit.ac.in", 
  "bt23mme021@students.vnit.ac.in", "bt24ece059@students.vnit.ac.in", "bt24eee049@students.vnit.ac.in", 
  "bt24eee048@students.vnit.ac.in", "bt25eee087@students.vnit.ac.in", "bt24ece028@students.vnit.ac.in", 
  "bt24min040@students.vnit.ac.in", "bt24mino20@students.vnit.ac.in", "bt24mme106@students.vnit.ac.in", 
  "bt25min018@students.vnit.ac.in", "bt24mme097@students.vnit.ac.in", "bt25cme054@students.vnit.ac.in", 
  "bt24mme101@students.vnit.ac.in", "bt25mec016@students.vnit.ac.in", "bt23mme035@students.vnit.ac.in", 
  "bt24eee024@students.vnit.ac.in", "bt23eee020@students.vnit.ac.in", "bt24min046@students.vnit.ac.in", 
  "bt25cme048@students.vnit.ac.in", "bt25civ053@students.vnit.ac.in", "bt23eee115@students.vnit.ac.in", 
  "bt24mec043@students.vnit.ac.in", "bt24cme047@students.vnit.ac.in", "bt24mme067@students.vnit.ac.in", 
  "bt23mme066@students.vnit.ac.in", "bt25min031@students.vnit.ac.in", "bt25min005@students.vnit.ac.in", 
  "bt25eee057@students.vnit.ac.in", "bt25eee093@students.vnit.ac.in", "bt25mec076@students.vnit.ac.in", 
  "bt24mme006@students.vnit.ac.in", "bt24ece115@students.vnit.ac.in", "bt25min013@students.vnit.ac.in", 
  "bt25civ051@students.vnit.ac.in", "bt24eee004@students.vnit.ac.in", "bt24mec065@students.vnit.ac.in", 
  "bt24civ110@students.vnit.ac.in", "bt24mme074@students.vnit.ac.in", "bt25ece086@students.vnit.ac.in", 
  "bt25mme033@students.vnit.ac.in", "bt24mme028@students.vnit.ac.in", "bt24civ097@students.vnit.ac.in", 
  "bt25mme001@students.vnit.ac.in", "bt24cme071@students.vnit.ac.in", "bt24civ115@students.vnit.ac.in", 
  "bt25mme054@students.vnit.ac.in", "bt24mec018@students.vnit.ac.in", "bt24mme038@students.vnit.ac.in", 
  "bt25min014@students.vnit.ac.in", "bt23ece084@students.vnit.ac.in", "bt24mme091@students.vnit.ac.in", 
  "bt23eee029@students.vnit.ac.in", "bt23cse005@students.vnit.ac.in", "bt23ece085@students.vnit.ac.in", 
  "bt25min026@students.vnit.ac.in", "bt24eee061@students.vnit.ac.in", "bt24mec061@students.vnit.ac.in", 
  "bt24min047@students.vnit.ac.in", "bt23mec070@students.vnit.ac.in", "bt23eee053@students.vnit.ac.in", 
  "bt25mec036@students.vnit.ac.in", "bt24mme089@students.vnit.ac.in", "bt23eee119@students.vnit.ac.in", 
  "bt24mme058@students.vnit.ac.in"
];

async function seed() {
  console.log('Starting approved students seeding...');
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    for (const email of emails) {
      const normalized = email.trim().toLowerCase();
      await client.query(
        'INSERT INTO approved_students (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
        [normalized]
      );
    }
    await client.query('COMMIT');
    console.log(`Successfully seeded ${emails.length} approved students.`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error seeding approved students:', err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();
