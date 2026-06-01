import { type OnboardingState } from "@/types/onboarding";

export interface PopularOnboardingTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  state: Partial<OnboardingState>;
}

export const popularOnboardingTemplates: PopularOnboardingTemplate[] = [
  {
    id: "genai-knowledge-assistant",
    name: "GenAI Knowledge Assistant Sandbox",
    category: "Generative AI",
    description: "Azure-based development sandbox for internal document search, chat, embeddings, and guarded LLM experimentation.",
    tags: ["Azure", "LLM", "Dev Sandbox", "Private Data"],
    state: {
      accountDetails: {
        projectName: "GenAI Knowledge Assistant Sandbox",
        isu: "BFSI-DIS",
        accountName: "Enterprise AI Enablement",
        owner: "Cloud Solution Owner",
        empId: "TCS000000",
        description: "Development sandbox for a retrieval-augmented GenAI assistant using private enterprise documents, vector search, API gateway controls, and audit logging.",
        businessUnit: "BFSI",
      },
      requirementAssessment: {
        solutionType: "generative-ai",
        deploymentEnvironments: ["development"],
        cloudProviders: ["Azure"],
        region: "central-india",
      },
      cloudResources: [
        {
          provider: "Azure",
          resources: [
            { id: "tpl-az-openai", service: "Azure OpenAI", count: 1, configDetails: "GPT model deployment with private endpoint, content filtering, and token quota controls" },
            { id: "tpl-az-app", service: "App Service", count: 2, configDetails: "Premium v3 app instances for web UI and API orchestration" },
            { id: "tpl-az-blob", service: "Blob Storage", count: 1, configDetails: "Hot tier document staging with encryption and lifecycle policy" },
            { id: "tpl-az-cache", service: "Azure Cache", count: 1, configDetails: "Standard C1 Redis cache for session and prompt cache" },
          ],
        },
      ],
    },
  },
  {
    id: "web-api-microservices",
    name: "Enterprise Web API Microservices",
    category: "Application Modernization",
    description: "AWS landing pattern for containerized APIs, relational data, object storage, CDN, and asynchronous integration.",
    tags: ["AWS", "EKS", "API", "Production"],
    state: {
      accountDetails: {
        projectName: "Enterprise Web API Microservices",
        isu: "RETAIL-DIS",
        accountName: "Digital Channels Platform",
        owner: "Application Platform Owner",
        empId: "TCS000000",
        description: "Production-ready cloud onboarding for containerized APIs with managed database, object storage, CDN, observability, and queue-based integrations.",
        businessUnit: "Retail",
      },
      requirementAssessment: {
        solutionType: "non-generative-ai",
        deploymentEnvironments: ["development", "production"],
        cloudProviders: ["AWS"],
        region: "ap-south-1",
      },
      cloudResources: [
        {
          provider: "AWS",
          resources: [
            { id: "tpl-aws-eks", service: "EKS", count: 1, configDetails: "Three-node managed node group, private subnets, autoscaling enabled" },
            { id: "tpl-aws-rds", service: "RDS", count: 1, configDetails: "PostgreSQL Multi-AZ, encrypted storage, automated backups" },
            { id: "tpl-aws-s3", service: "S3", count: 2, configDetails: "Artifact bucket and application document bucket with KMS encryption" },
            { id: "tpl-aws-cf", service: "CloudFront", count: 1, configDetails: "HTTPS CDN distribution with WAF integration" },
            { id: "tpl-aws-sqs", service: "SQS", count: 2, configDetails: "Standard queues for async processing and dead-letter handling" },
          ],
        },
      ],
    },
  },
  {
    id: "analytics-reporting-platform",
    name: "Analytics & Reporting Platform",
    category: "Data Platform",
    description: "GCP data-processing baseline for ingestion, warehouse analytics, serverless processing, and BI-ready storage.",
    tags: ["GCP", "BigQuery", "Data", "Batch"],
    state: {
      accountDetails: {
        projectName: "Analytics & Reporting Platform",
        isu: "MFG-DIS",
        accountName: "Manufacturing Insights",
        owner: "Data Platform Owner",
        empId: "TCS000000",
        description: "Cloud onboarding pattern for secure batch ingestion, curated warehouse tables, serverless transformations, dashboards, and operational reporting workloads.",
        businessUnit: "Manufacturing",
      },
      requirementAssessment: {
        solutionType: "non-generative-ai",
        deploymentEnvironments: ["development", "production"],
        cloudProviders: ["GCP"],
        region: "asia-south1-a",
      },
      cloudResources: [
        {
          provider: "GCP",
          resources: [
            { id: "tpl-gcp-bq", service: "BigQuery", count: 1, configDetails: "Enterprise warehouse dataset with partitioning, IAM controls, and audit logs" },
            { id: "tpl-gcp-storage", service: "Cloud Storage", count: 2, configDetails: "Raw and curated buckets with lifecycle policy and CMEK" },
            { id: "tpl-gcp-functions", service: "Cloud Functions", count: 3, configDetails: "Serverless ingestion triggers and validation jobs" },
            { id: "tpl-gcp-pubsub", service: "Pub/Sub", count: 2, configDetails: "Data ingestion topic and processing subscription" },
          ],
        },
      ],
    },
  },
];