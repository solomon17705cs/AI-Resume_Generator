export interface DomainStack {
    languages: string[];
    frameworks: string[];
    databases: string[];
    cloud: string[];
    concepts: string[];
    tools: string[];
    semanticExpansion: Record<string, string[]>;
}

export const KEYWORD_DICTIONARY: Record<string, DomainStack> = {
    "Frontend Engineer": {
        languages: ["JavaScript", "TypeScript", "HTML5", "CSS3"],
        frameworks: ["React", "Next.js", "Vue", "Angular", "Tailwind CSS", "Redux", "Svelte"],
        databases: ["Local Storage", "IndexedDB", "Firebase Realtime Database"],
        cloud: ["Vercel", "Netlify", "AWS Amplify"],
        concepts: ["Responsive Design", "Client-side Rendering", "SEO Optimization", "PWA", "W3C Accessibility/WCAG", "Performance Tuning"],
        tools: ["Webpack", "Vite", "ESLint", "Prettier", "Figma"],
        semanticExpansion: {
            "React": ["React Hooks", "Component-driven development", "Virtual DOM optimization"],
            "TypeScript": ["Strict type checking", "Interfaces and Types", "Scalable codebase"],
            "Next.js": ["Server-side rendering (SSR)", "Static site generation (SSG)", "Fullstack React"]
        }
    },
    "Backend Engineer": {
        languages: ["Python", "Java", "Node.js", "Go", "Ruby", "PHP", "C#"],
        frameworks: ["Express", "Spring Boot", "Django", "Flask", "FastAPI", "NestJS", "Laravel"],
        databases: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "SQL Server"],
        cloud: ["AWS", "Azure", "GCP", "Docker", "Kubernetes"],
        concepts: ["RESTful APIs", "Microservices Architecture", "System Design", "Scalable Systems", "Event-driven Architecture", "Serverless"],
        tools: ["Jenkins", "GitHub Actions", "Terraform", "Postman", "Swagger"],
        semanticExpansion: {
            "Spring Boot": ["Java backend development", "RESTful services", "Microservice architecture"],
            "FastAPI": ["Asynchronous programming", "Python API development", "High-performance services"],
            "Microservices": ["Distributed systems", "Horizontal scaling", "Inter-service communication"]
        }
    },
    "Full Stack Engineer": {
        languages: ["JavaScript", "TypeScript", "Python", "Java"],
        frameworks: ["React", "Node.js", "Next.js", "Fullstack development", "MERN Stack", "T3 Stack"],
        databases: ["PostgreSQL", "MongoDB", "MySQL"],
        cloud: ["AWS", "Docker", "Vercel"],
        concepts: ["End-to-end development", "Responsive web apps", "API integration", "Database modeling"],
        tools: ["Git", "GitHub", "Docker", "Postman"],
        semanticExpansion: {
            "Next.js": ["Serverless functions", "API Routes", "Full-stack optimization"]
        }
    },
    "DevOps Engineer": {
        languages: ["Python", "Bash", "Go", "Ruby"],
        frameworks: ["None"],
        databases: ["InfluxDB", "Prometheus"],
        cloud: ["AWS", "Azure", "GCP", "Kubernetes", "Docker"],
        concepts: ["CI/CD Pipeline", "Infrastructure as Code (IaC)", "Site Reliability Engineering (SRE)", "Automation", "Monitoring", "Security"],
        tools: ["Terraform", "Ansible", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Helms"],
        semanticExpansion: {
            "Kubernetes": ["Container orchestration", "K8s cluster management", "Microservices deployment"],
            "Terraform": ["Provisioning cloud assets", "Infrastructure as Code", "Multi-cloud management"]
        }
    },
    "ML Engineer": {
        languages: ["Python", "R", "Julia", "C++"],
        frameworks: ["PyTorch", "TensorFlow", "Scikit-Learn", "Keras", "HuggingFace"],
        databases: ["Pinecone", "Milvus", "Weaviate", "BigQuery"],
        cloud: ["AWS SageMaker", "Google Vertex AI", "Azure ML"],
        concepts: ["Deep Learning", "NLP", "Computer Vision", "Model Deployment", "Feature Engineering", "MLOps", "Fine-tuning"],
        tools: ["Jupyter", "Weights & Biases", "MLflow", "DVC"],
        semanticExpansion: {
            "TensorFlow": ["Deep learning models", "Neural networks", "Graph computation"],
            "LLM": ["Prompt engineering", "RAG architecture", "Vector databases"]
        }
    },
    "Data Engineer": {
        languages: ["SQL", "Python", "Scala", "Java"],
        frameworks: ["Apache Spark", "Apache Flink", "Hadoop"],
        databases: ["Databricks", "Snowflake", "BigQuery", "Redshift", "PostgreSQL"],
        cloud: ["AWS", "GCP", "Azure"],
        concepts: ["ETL Pipelines", "Data Warehousing", "Data Lakes", "Stream Processing", "Batch Processing"],
        tools: ["Airflow", "dbt", "Kafka", "Tableau"],
        semanticExpansion: {
            "Kafka": ["Real-time data streaming", "Event sourcing", "Message brokers"],
            "ETL": ["Data migration", "Pipeline automation", "Data warehousing"]
        }
    }
};

export const INDUSTRY_CONTEXT: Record<string, string[]> = {
    "FinTech": ["High-availability systems", "Secure transaction processing", "Payment gateway integration", "Regulatory compliance (PCI-DSS)", "Fraud detection"],
    "HealthTech": ["HIPAA compliance", "Electronic Health Records (EHR)", "Telemedicine platforms", "Patient data security"],
    "E-commerce": ["High-traffic systems", "Scalable architecture", "Order management systems", "Cart abandonment recovery", "Product recommendation engines"],
    "SaaS": ["Multi-tenant architecture", "Subscription billing systems", "API-first development", "Customer churn analysis"]
};
