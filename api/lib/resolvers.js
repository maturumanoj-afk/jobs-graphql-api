import pool from './db.js';
import logger from './logger.js';
import { LRUCache } from 'lru-cache';

const cache = new LRUCache({
  max: 500,
  ttl: 1000 * 60, // 1 minute TTL for query results
});

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
    const cacheKey = `jobs:${query}:${status}:${department}:${page}:${pageSize}`;
    if (cache.has(cacheKey)) {
      logger.debug(`Cache hit for jobs query: ${cacheKey}`);
      return cache.get(cacheKey);
    }

    logger.info(`jobs query: query="${query}", status="${status}", dept="${department}", page=${page}`);
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

    // Optimized: Use window function COUNT(*) OVER() to get data and total count in ONE round-trip
    const dataRes = await pool.query(
      `SELECT *, COUNT(*) OVER() AS full_count 
       FROM jobs_library j ${where} 
       ORDER BY j.created_at DESC 
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, pageSize, offset],
    );

    const totalCount = dataRes.rows.length > 0 ? parseInt(dataRes.rows[0].full_count, 10) : 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    logger.debug(`Fetched ${dataRes.rows.length} jobs (Total: ${totalCount}) for page ${page}`);
    const result = {
      jobs: dataRes.rows.map(toJob),
      totalCount,
      totalPages,
    };
    cache.set(cacheKey, result);
    return result;
  },

  job: async ({ id }, context) => {
    logger.info(`job query (DataLoader): id="${id}"`);
    const job = await context.jobLoader.load(id);
    if (!job) logger.warn(`Job not found: ${id}`);
    return job ? toJob(job) : null;
  },

  departments: async () => {
    const cacheKey = 'departments';
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    logger.info('departments query');
    const res = await pool.query('SELECT DISTINCT department FROM jobs_library ORDER BY department');
    const result = res.rows.map((r) => r.department);
    cache.set(cacheKey, result);
    return result;
  },

  levels: async () => {
    const cacheKey = 'levels';
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const res = await pool.query(
      "SELECT DISTINCT level FROM jobs_library ORDER BY ARRAY_POSITION(ARRAY['Junior','Mid','Senior','Lead','Principal','Executive'], level)",
    );
    const result = res.rows.map((r) => r.level);
    cache.set(cacheKey, result);
    return result;
  },

  statuses: async () => {
    const cacheKey = 'statuses';
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const res = await pool.query('SELECT DISTINCT status FROM jobs_library ORDER BY status');
    const result = res.rows.map((r) => r.status);
    cache.set(cacheKey, result);
    return result;
  },

  // ── Mutations ──────────────────────────────────────────────────────────────

  createJob: async ({ input }) => {
    logger.info('createJob mutation', input);
    const {
      jobTitle, department, level, location,
      marketMedian, internalMedian, status = 'active',
      employmentType = 'full_time', remoteEligible = false,
      headcountBudget = 1,
    } = input;

    const compaRatio =
      marketMedian && internalMedian ? internalMedian / marketMedian : null;

    try {
      const res = await pool.query(
        `INSERT INTO jobs_library
           (job_title, department, level, location, market_median, internal_median,
            compa_ratio, status, employment_type, remote_eligible, headcount_budget)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [jobTitle, department, level, location, marketMedian, internalMedian,
         compaRatio, status, employmentType, remoteEligible, headcountBudget],
      );
      logger.success(`Created job: ${jobTitle} (${res.rows[0].id})`);
      cache.clear(); // invalidate cache on mutation
      return toJob(res.rows[0]);
    } catch (err) {
      logger.error(`Failed to create job: ${jobTitle}`, err);
      throw err;
    }
  },

  updateJob: async ({ id, input }) => {
    logger.info(`updateJob mutation: id="${id}"`, input);
    const {
      jobTitle, department, level, location,
      marketMedian, internalMedian, status,
      employmentType, remoteEligible, headcountBudget,
    } = input;

    const compaRatio =
      marketMedian && internalMedian ? internalMedian / marketMedian : null;

    try {
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
      if (res.rowCount === 0) {
        logger.warn(`Update failed: job ${id} not found`);
        throw new Error('Job not found');
      }
      logger.success(`Updated job: ${id}`);
      cache.clear(); // invalidate cache on mutation
      return toJob(res.rows[0]);
    } catch (err) {
      logger.error(`Failed to update job: ${id}`, err);
      throw err;
    }
  },

  deleteJob: async ({ id }) => {
    logger.info(`deleteJob mutation: id="${id}"`);
    try {
      const res = await pool.query('DELETE FROM jobs_library WHERE id=$1', [id]);
      const deleted = res.rowCount > 0;
      if (deleted) {
        logger.success(`Deleted job: ${id}`);
        cache.clear(); // invalidate cache on mutation
      } else {
        logger.warn(`Delete failed: job ${id} not found`);
      }
      return deleted;
    } catch (err) {
      logger.error(`Failed to delete job: ${id}`, err);
      throw err;
    }
  },
};

export default resolvers;
