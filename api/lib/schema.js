import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Job {
    id: ID!
    jobTitle: String!
    department: String!
    level: String!
    location: String!
    marketMedian: Float
    internalMedian: Float
    compaRatio: Float
    status: String!
    employmentType: String!
    remoteEligible: Boolean!
    headcountBudget: Int
    createdAt: String!
    updatedAt: String!
  }

  type JobsPage {
    jobs: [Job!]!
    totalCount: Int!
    totalPages: Int!
  }

  input JobInput {
    jobTitle: String!
    department: String!
    level: String!
    location: String!
    marketMedian: Float
    internalMedian: Float
    status: String
    employmentType: String
    remoteEligible: Boolean
    headcountBudget: Int
  }

  type Query {
    jobs(
      query: String
      status: String
      department: String
      page: Int
      pageSize: Int
    ): JobsPage!
    job(id: ID!): Job
    departments: [String!]!
    levels: [String!]!
    statuses: [String!]!
  }

  type Mutation {
    createJob(input: JobInput!): Job!
    updateJob(id: ID!, input: JobInput!): Job!
    deleteJob(id: ID!): Boolean!
  }
`);

export default schema;
