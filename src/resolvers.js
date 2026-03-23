import pool from './db.js';

const ITEMS_PER_PAGE = 10;

function toJob(row) {
  return {
    id: row.id,
    jobTitle: row.job_title,
    department: row.department,
    level: row.level,
    location: row.location,
    marketMedian: row.market_median ? parseFloat(row.market_median) : null,
    internalMedian: row.internal_median ? parseFloat(row.internal_median) : null,
    compaRatio: row.compa_ratio ? parseFloat(row.compa_ratio) : null,
    status: row.status,
    employmentType: row.employment_type,
    remoteEligible: row.remote_eligible,
    headcountBudget: row.headcount_budget,
    createdAt: row.created_at?.toISOString(),
    updatedAt: row.updated_at?.toISOString(),
  };
}

const resolvers = {
  // ── Queries ────────────────────────────────────────────────────────────────

  jobs: async ({ query = '', status, department, page = 1, pageSize = ITEMS_PER_PAGE }) => {
    const offset = (page - 1) * pageSize;
    const search = `%${query}%`;

    const conditions = ['(j.job_title ILIKE $1 OR j.department ILIKE $1 OR j.location ILIKE $1)'];
    const params = [search];
    let idx = 2;

    if (status) {
      conditions.push(`j.status = $${idx}`);
      params.push(status);
      idx++;
    }
    if (department) {
      conditions.push(`j.department = $${idx}`);
      params.push(department);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM jobs_library j ${where}`,
      params,
    );
    const totalCount = parseInt(countRes.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / pageSize);

    const dataRes = await pool.query(
      `SELECT * FROM jobs_library j ${where} ORDER BY j.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, pageSize, offset],
    );

    return {
      jobs: dataRes.rows.map(toJob),
      totalCount,
      totalPages,
    };
  },

  job: async ({ id }) => {
    const res = await pool.query('SELECT * FROM jobs_library WHERE id = $1', [id]);
    return res.rows[0] ? toJob(res.rows[0]) : null;
  },

  departments: async () => {
    const res = await pool.query(
      'SELECT DISTINCT department FROM jobs_library ORDER BY department',
    );
    return res.rows.map((r) => r.department);
  },

  levels: async () => {
    const res = await pool.query(
      "SELECT DISTINCT level FROM jobs_library ORDER BY ARRAY_POSITION(ARRAY['Junior','Mid','Senior','Lead','Principal','Executive'], level)",
    );
    return res.rows.map((r) => r.level);
  },

  statuses: async () => {
    const res = await pool.query('SELECT DISTINCT status FROM jobs_library ORDER BY status');
    return res.rows.map((r) => r.status);
  },

  // ── Mutations ──────────────────────────────────────────────────────────────

  createJob: async ({ input }) => {
    const {
      jobTitle, department, level, location,
      marketMedian, internalMedian, status = 'active',
      employmentType = 'full_time', remoteEligible = false,
      headcountBudget = 1,
    } = input;

    const compaRatio =
      marketMedian && internalMedian ? internalMedian / marketMedian : null;

    const res = await pool.query(
      `INSERT INTO jobs_library
         (job_title, department, level, location, market_median, internal_median,
          compa_ratio, status, employment_type, remote_eligible, headcount_budget)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [jobTitle, department, level, location, marketMedian, internalMedian,
       compaRatio, status, employmentType, remoteEligible, headcountBudget],
    );
    return toJob(res.rows[0]);
  },

  updateJob: async ({ id, input }) => {
    const {
      jobTitle, department, level, location,
      marketMedian, internalMedian, status,
      employmentType, remoteEligible, headcountBudget,
    } = input;

    const compaRatio =
      marketMedian && internalMedian ? internalMedian / marketMedian : null;

    const res = await pool.query(
      `UPDATE jobs_library SET
         job_title=$2, department=$3, level=$4, location=$5,
         market_median=$6, internal_median=$7, compa_ratio=$8,
         status=$9, employment_type=$10, remote_eligible=$11,
         headcount_budget=$12, updated_at=NOW()
       WHERE id=$1
       RETURNING *`,
      [id, jobTitle, department, level, location, marketMedian, internalMedian,
       compaRatio, status, employmentType, remoteEligible, headcountBudget],
    );
    return toJob(res.rows[0]);
  },

  deleteJob: async ({ id }) => {
    const res = await pool.query('DELETE FROM jobs_library WHERE id=$1', [id]);
    return res.rowCount > 0;
  },
};

export default resolvers;
