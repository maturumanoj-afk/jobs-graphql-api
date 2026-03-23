import pool from '../api/lib/db.js';

const JOBS = [
  // Engineering
  { jobTitle: 'Software Engineer I', department: 'Engineering', level: 'Junior', location: 'San Francisco, CA', marketMedian: 110000, internalMedian: 115000, status: 'active', employmentType: 'full_time', remoteEligible: true, headcountBudget: 5 },
  { jobTitle: 'Software Engineer II', department: 'Engineering', level: 'Mid', location: 'San Francisco, CA', marketMedian: 145000, internalMedian: 148000, status: 'active', employmentType: 'full_time', remoteEligible: true, headcountBudget: 8 },
  { jobTitle: 'Senior Software Engineer', department: 'Engineering', level: 'Senior', location: 'New York, NY', marketMedian: 185000, internalMedian: 180000, status: 'active', employmentType: 'full_time', remoteEligible: true, headcountBudget: 6 },
  { jobTitle: 'Staff Engineer', department: 'Engineering', level: 'Lead', location: 'Austin, TX', marketMedian: 215000, internalMedian: 220000, status: 'active', employmentType: 'full_time', remoteEligible: true, headcountBudget: 2 },
  { jobTitle: 'Principal Engineer', department: 'Engineering', level: 'Principal', location: 'Remote', marketMedian: 250000, internalMedian: 245000, status: 'draft', employmentType: 'full_time', remoteEligible: true, headcountBudget: 1 },
  // Product
  { jobTitle: 'Associate Product Manager', department: 'Product', level: 'Junior', location: 'Chicago, IL', marketMedian: 95000, internalMedian: 98000, status: 'active', employmentType: 'full_time', remoteEligible: false, headcountBudget: 3 },
  { jobTitle: 'Product Manager', department: 'Product', level: 'Mid', location: 'San Francisco, CA', marketMedian: 140000, internalMedian: 138000, status: 'active', employmentType: 'full_time', remoteEligible: true, headcountBudget: 4 },
  { jobTitle: 'Senior Product Manager', department: 'Product', level: 'Senior', location: 'New York, NY', marketMedian: 175000, internalMedian: 170000, status: 'active', employmentType: 'full_time', remoteEligible: true, headcountBudget: 2 },
  { jobTitle: 'Director of Product', department: 'Product', level: 'Lead', location: 'Austin, TX', marketMedian: 210000, internalMedian: 215000, status: 'archived', employmentType: 'full_time', remoteEligible: false, headcountBudget: 1 },
  // Design
  { jobTitle: 'UI/UX Designer', department: 'Design', level: 'Mid', location: 'Remote', marketMedian: 115000, internalMedian: 118000, status: 'active', employmentType: 'full_time', remoteEligible: true, headcountBudget: 2 },
  { jobTitle: 'Senior Product Designer', department: 'Design', level: 'Senior', location: 'San Francisco, CA', marketMedian: 155000, internalMedian: 150000, status: 'active', employmentType: 'full_time', remoteEligible: true, headcountBudget: 2 },
  { jobTitle: 'Design Lead', department: 'Design', level: 'Lead', location: 'New York, NY', marketMedian: 185000, internalMedian: 190000, status: 'draft', employmentType: 'full_time', remoteEligible: false, headcountBudget: 1 },
  // Finance
  { jobTitle: 'Financial Analyst', department: 'Finance', level: 'Junior', location: 'Chicago, IL', marketMedian: 75000, internalMedian: 78000, status: 'active', employmentType: 'full_time', remoteEligible: false, headcountBudget: 2 },
  { jobTitle: 'Senior Financial Analyst', department: 'Finance', level: 'Senior', location: 'Chicago, IL', marketMedian: 105000, internalMedian: 100000, status: 'active', employmentType: 'full_time', remoteEligible: false, headcountBudget: 1 },
  { jobTitle: 'Finance Manager', department: 'Finance', level: 'Lead', location: 'New York, NY', marketMedian: 145000, internalMedian: 148000, status: 'active', employmentType: 'full_time', remoteEligible: false, headcountBudget: 1 },
  // HR
  { jobTitle: 'HR Business Partner', department: 'HR', level: 'Mid', location: 'Austin, TX', marketMedian: 90000, internalMedian: 92000, status: 'active', employmentType: 'full_time', remoteEligible: true, headcountBudget: 2 },
  { jobTitle: 'Senior HRBP', department: 'HR', level: 'Senior', location: 'San Francisco, CA', marketMedian: 125000, internalMedian: 120000, status: 'active', employmentType: 'full_time', remoteEligible: true, headcountBudget: 1 },
  // Data
  { jobTitle: 'Data Analyst', department: 'Data', level: 'Mid', location: 'Remote', marketMedian: 105000, internalMedian: 108000, status: 'active', employmentType: 'full_time', remoteEligible: true, headcountBudget: 3 },
  { jobTitle: 'Senior Data Scientist', department: 'Data', level: 'Senior', location: 'New York, NY', marketMedian: 165000, internalMedian: 160000, status: 'active', employmentType: 'full_time', remoteEligible: true, headcountBudget: 2 },
  { jobTitle: 'ML Engineer', department: 'Data', level: 'Senior', location: 'San Francisco, CA', marketMedian: 195000, internalMedian: 200000, status: 'draft', employmentType: 'full_time', remoteEligible: true, headcountBudget: 2 },
];

async function seed() {
  console.log('🌱 Seeding jobs_library table...');
  for (const job of JOBS) {
    const compaRatio =
      job.marketMedian && job.internalMedian
        ? job.internalMedian / job.marketMedian
        : null;
    await pool.query(
      `INSERT INTO jobs_library
         (job_title, department, level, location, market_median, internal_median,
          compa_ratio, status, employment_type, remote_eligible, headcount_budget)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT DO NOTHING`,
      [
        job.jobTitle, job.department, job.level, job.location,
        job.marketMedian, job.internalMedian, compaRatio,
        job.status, job.employmentType, job.remoteEligible, job.headcountBudget,
      ],
    );
  }
  console.log(`✅ Seeded ${JOBS.length} jobs`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
