# Architecture Evaluation and Testing

## Overview

This document covers architecture evaluation methods including ATAM (Architecture Tradeoff Analysis Method), chaos engineering, architecture reviews, and testing strategies for validating architectural decisions.

---

## Knowledge

### ATAM (Architecture Tradeoff Analysis Method)

**What is ATAM?**
- Systematic method for evaluating software architectures
- Developed by Software Engineering Institute (SEI)
- Focuses on quality attribute tradeoffs
- Identifies architectural risks and sensitivity points
- Stakeholder-centric evaluation

**ATAM Phases**

**Phase 1: Presentation**
1. **Present ATAM Method** - Explain process to stakeholders
2. **Present Business Drivers** - Business goals, context, constraints
3. **Present Architecture** - Architectural approaches and patterns
4. **Identify Architectural Approaches** - Key architectural decisions
5. **Generate Quality Attribute Utility Tree** - Prioritize quality attributes
6. **Analyze Architectural Approaches** - Evaluate against quality attributes

**Phase 2: Investigation and Analysis**
7. **Brainstorm and Prioritize Scenarios** - Stakeholder scenarios
8. **Analyze Architectural Approaches** - Deep dive into scenarios
9. **Present Results** - Findings, risks, sensitivity points

**Quality Attribute Utility Tree**
```
Quality Attributes
├── Performance
│   ├── Latency (H, H)
│   │   └── Scenario: API response < 200ms under 1000 req/s
│   └── Throughput (H, M)
│       └── Scenario: Process 10,000 orders/hour
├── Security
│   ├── Authentication (H, H)
│   │   └── Scenario: Prevent unauthorized access
│   └── Data Protection (H, H)
│       └── Scenario: Encrypt sensitive data at rest
└── Scalability
    ├── Horizontal Scaling (M, H)
    │   └── Scenario: Scale to 10x traffic
    └── Database Scaling (M, M)
        └── Scenario: Handle 1M users

(H, H) = High Importance, High Difficulty
(H, M) = High Importance, Medium Difficulty
(M, H) = Medium Importance, High Difficulty
```

**ATAM Outputs**
- **Architectural Approaches** - Key design decisions
- **Quality Attribute Scenarios** - Concrete quality requirements
- **Sensitivity Points** - Decisions critical to quality attributes
- **Tradeoff Points** - Decisions affecting multiple attributes
- **Risks** - Potential problems
- **Non-Risks** - Decisions that are sound

### Chaos Engineering

**What is Chaos Engineering?**
- Discipline of experimenting on distributed systems
- Proactively inject failures to test resilience
- Validate system behavior under adverse conditions
- Build confidence in system reliability
- Pioneered by Netflix (Chaos Monkey)

**Chaos Engineering Principles**

**1. Build a Hypothesis**
- Define steady state (normal behavior)
- Hypothesize steady state continues during chaos
- Example: "API latency remains < 200ms even if one service instance fails"

**2. Vary Real-World Events**
- Simulate realistic failure scenarios
- Hardware failures, network issues, resource exhaustion
- Dependency failures, traffic spikes

**3. Run Experiments in Production**
- Test in production (with safeguards)
- Staging doesn't replicate production complexity
- Start small, increase blast radius gradually

**4. Automate Experiments**
- Continuous chaos engineering
- Integrate into CI/CD pipeline
- Automated rollback on failure

**5. Minimize Blast Radius**
- Limit impact of experiments
- Start with small percentage of traffic
- Have kill switch ready

**Chaos Experiments**

**Infrastructure Chaos**
- **Instance Termination** - Kill random instances
- **Network Latency** - Inject network delays
- **Network Partition** - Simulate network splits
- **Resource Exhaustion** - CPU/memory/disk stress
- **Clock Skew** - Time synchronization issues

**Application Chaos**
- **Dependency Failures** - Simulate service unavailability
- **Exception Injection** - Trigger error paths
- **Latency Injection** - Slow down operations
- **Data Corruption** - Invalid data scenarios

**Tools**
- **Chaos Monkey** - Random instance termination (Netflix)
- **Chaos Toolkit** - Open-source chaos engineering
- **Gremlin** - Chaos engineering platform
- **Litmus** - Kubernetes chaos engineering
- **Pumba** - Docker chaos testing

### Architecture Reviews

**Types of Architecture Reviews**

**1. Design Review**
- **When**: Before implementation
- **Purpose**: Validate design decisions
- **Participants**: Architects, senior developers, stakeholders
- **Focus**: Alignment with requirements, quality attributes

**2. Code Review (Architecture Focus)**
- **When**: During implementation
- **Purpose**: Ensure code follows architecture
- **Participants**: Developers, architects
- **Focus**: Architectural patterns, dependency rules

**3. Post-Implementation Review**
- **When**: After deployment
- **Purpose**: Validate architecture in production
- **Participants**: Architects, operations, developers
- **Focus**: Performance, scalability, maintainability

**4. Periodic Review**
- **When**: Quarterly/annually
- **Purpose**: Assess architecture evolution
- **Participants**: Architecture team, stakeholders
- **Focus**: Technical debt, modernization opportunities

**Architecture Review Checklist**

**Functional Requirements**
- ✓ All use cases supported
- ✓ Business logic correctly implemented
- ✓ Integration points defined

**Quality Attributes**
- ✓ Performance targets met
- ✓ Security requirements addressed
- ✓ Scalability approach defined
- ✓ Reliability/availability targets
- ✓ Maintainability considerations

**Architecture Principles**
- ✓ Separation of concerns
- ✓ Loose coupling, high cohesion
- ✓ Appropriate abstraction levels
- ✓ Consistent patterns used

**Technical Debt**
- ✓ Known limitations documented
- ✓ Workarounds identified
- ✓ Refactoring plan exists

### Architecture Testing

**Types of Architecture Tests**

**1. Fitness Functions**
- Automated tests for architectural characteristics
- Enforce architectural constraints
- Run in CI/CD pipeline

**2. Performance Testing**
- Load testing
- Stress testing
- Endurance testing
- Spike testing

**3. Security Testing**
- Penetration testing
- Vulnerability scanning
- Security code review
- Threat modeling validation

**4. Resilience Testing**
- Chaos engineering experiments
- Failover testing
- Disaster recovery drills
- Circuit breaker validation

**5. Integration Testing**
- Service integration tests
- Contract testing
- End-to-end testing

---

## Skills

### Conducting ATAM Evaluations

**Preparation**
1. Identify stakeholders (business, development, operations)
2. Schedule evaluation sessions (typically 2-3 days)
3. Gather architecture documentation
4. Prepare presentation materials

**Execution**
1. Present ATAM method to stakeholders
2. Elicit business drivers and constraints
3. Present architecture and key decisions
4. Build quality attribute utility tree
5. Generate and prioritize scenarios
6. Analyze architectural approaches
7. Identify risks, sensitivity points, tradeoffs
8. Document findings and recommendations

**Follow-up**
1. Present results to stakeholders
2. Prioritize risks for mitigation
3. Create action plan for improvements
4. Schedule follow-up reviews

### Designing Chaos Experiments

**1. Define Steady State**
```typescript
// Example: API latency steady state
interface SteadyState {
  metric: string;
  threshold: number;
  unit: string;
}

const apiLatencySteadyState: SteadyState = {
  metric: 'p95_latency',
  threshold: 200,
  unit: 'ms'
};
```

**2. Formulate Hypothesis**
```typescript
interface ChaosHypothesis {
  steadyState: SteadyState;
  experiment: string;
  expectedOutcome: string;
}

const hypothesis: ChaosHypothesis = {
  steadyState: apiLatencySteadyState,
  experiment: 'Terminate 1 of 3 API instances',
  expectedOutcome: 'p95 latency remains < 200ms'
};
```

**3. Design Experiment**
```typescript
interface ChaosExperiment {
  name: string;
  hypothesis: ChaosHypothesis;
  blastRadius: number; // percentage of traffic
  duration: number; // seconds
  rollbackCondition: string;
  steps: ExperimentStep[];
}

interface ExperimentStep {
  action: string;
  target: string;
  parameters: Record<string, any>;
}

const instanceTerminationExperiment: ChaosExperiment = {
  name: 'API Instance Termination',
  hypothesis,
  blastRadius: 10, // 10% of traffic
  duration: 300, // 5 minutes
  rollbackCondition: 'p95_latency > 500ms OR error_rate > 1%',
  steps: [
    {
      action: 'terminate_instance',
      target: 'api-service',
      parameters: { count: 1, random: true }
    },
    {
      action: 'monitor_metrics',
      target: 'api-service',
      parameters: {
        metrics: ['p95_latency', 'error_rate'],
        interval: 10
      }
    }
  ]
};
```

**4. Run Experiment**
```typescript
class ChaosRunner {
  async runExperiment(experiment: ChaosExperiment): Promise<ExperimentResult> {
    // 1. Verify steady state
    const baselineMetrics = await this.measureSteadyState(
      experiment.hypothesis.steadyState
    );

    if (!this.isSteadyState(baselineMetrics, experiment.hypothesis.steadyState)) {
      throw new Error('System not in steady state');
    }

    // 2. Execute chaos
    const chaosHandle = await this.executeChaos(experiment.steps);

    // 3. Monitor metrics
    const results = await this.monitorExperiment(
      experiment.duration,
      experiment.rollbackCondition
    );

    // 4. Rollback
    await this.rollback(chaosHandle);

    // 5. Analyze results
    return this.analyzeResults(baselineMetrics, results, experiment.hypothesis);
  }

  private async measureSteadyState(steadyState: SteadyState): Promise<Metrics> {
    // Measure current metrics
    return await this.metricsCollector.collect([steadyState.metric]);
  }

  private isSteadyState(metrics: Metrics, steadyState: SteadyState): boolean {
    return metrics[steadyState.metric] <= steadyState.threshold;
  }

  private async executeChaos(steps: ExperimentStep[]): Promise<ChaosHandle> {
    // Execute chaos actions
    const handles = [];
    for (const step of steps) {
      const handle = await this.chaosEngine.execute(step);
      handles.push(handle);
    }
    return { handles };
  }

  private async monitorExperiment(
    duration: number,
    rollbackCondition: string
  ): Promise<ExperimentMetrics> {
    const startTime = Date.now();
    const metrics: ExperimentMetrics = { samples: [] };

    while (Date.now() - startTime < duration * 1000) {
      const sample = await this.metricsCollector.collect();
      metrics.samples.push(sample);

      // Check rollback condition
      if (this.evaluateRollbackCondition(sample, rollbackCondition)) {
        throw new Error('Rollback condition triggered');
      }

      await this.sleep(10000); // 10 second intervals
    }

    return metrics;
  }

  private async rollback(chaosHandle: ChaosHandle): Promise<void> {
    // Rollback chaos actions
    for (const handle of chaosHandle.handles) {
      await this.chaosEngine.rollback(handle);
    }
  }

  private analyzeResults(
    baseline: Metrics,
    experiment: ExperimentMetrics,
    hypothesis: ChaosHypothesis
  ): ExperimentResult {
    // Compare experiment metrics to baseline and hypothesis
    const steadyStateMaintained = experiment.samples.every(sample =>
      sample[hypothesis.steadyState.metric] <= hypothesis.steadyState.threshold
    );

    return {
      success: steadyStateMaintained,
      baseline,
      experiment,
      hypothesis,
      findings: this.generateFindings(baseline, experiment, steadyStateMaintained)
    };
  }
}
```

### Performing Architecture Reviews

**Design Review Process**

**1. Pre-Review Preparation**
- Review architecture documentation
- Identify key architectural decisions
- Prepare questions and concerns
- Review quality attribute requirements

**2. Review Meeting**
- Present architecture overview
- Walk through key decisions
- Discuss alternatives considered
- Address reviewer questions
- Document action items

**3. Post-Review**
- Document findings
- Prioritize action items
- Update architecture documentation
- Schedule follow-up if needed

**Architecture Review Template**

```markdown
# Architecture Review: [System Name]

## Review Information
- **Date**: YYYY-MM-DD
- **Reviewers**: [Names]
- **Architect**: [Name]
- **System**: [System Name]

## Architecture Overview
[Brief description of the architecture]

## Key Architectural Decisions
1. **Decision**: [Description]
   - **Rationale**: [Why this decision was made]
   - **Alternatives**: [What else was considered]
   - **Tradeoffs**: [Pros and cons]

## Quality Attributes Assessment

### Performance
- **Target**: [e.g., < 200ms p95 latency]
- **Approach**: [How it's achieved]
- **Risks**: [Potential issues]

### Security
- **Requirements**: [Security requirements]
- **Approach**: [Security measures]
- **Risks**: [Security concerns]

### Scalability
- **Target**: [e.g., 10,000 concurrent users]
- **Approach**: [Scaling strategy]
- **Risks**: [Scalability concerns]

## Findings

### Strengths
1. [Positive aspect]
2. [Positive aspect]

### Risks
1. **Risk**: [Description]
   - **Impact**: High/Medium/Low
   - **Likelihood**: High/Medium/Low
   - **Mitigation**: [Recommended action]

### Recommendations
1. [Recommendation]
2. [Recommendation]

## Action Items
1. [ ] [Action item] - Owner: [Name] - Due: [Date]
2. [ ] [Action item] - Owner: [Name] - Due: [Date]

## Follow-up
- **Next Review**: [Date]
- **Focus Areas**: [What to review next time]
```

### Implementing Fitness Functions

**What are Fitness Functions?**
- Automated tests for architectural characteristics
- Enforce architectural constraints
- Run in CI/CD pipeline
- Provide continuous architecture validation

**Types of Fitness Functions**

**1. Dependency Rules**
```typescript
// ArchUnit-style test (conceptual TypeScript)
import { ArchRule, classes } from 'arch-test';

describe('Architecture Fitness Functions', () => {
  it('should enforce layered architecture', () => {
    const rule = classes()
      .that().resideInPackage('..domain..')
      .should().onlyDependOn(['..domain..', 'std-lib'])
      .because('Domain layer should not depend on infrastructure');

    rule.check();
  });

  it('should prevent circular dependencies', () => {
    const rule = classes()
      .should().beFreeOfCycles()
      .because('Circular dependencies make code hard to maintain');

    rule.check();
  });

  it('should enforce naming conventions', () => {
    const rule = classes()
      .that().resideInPackage('..services..')
      .should().haveSimpleNameEndingWith('Service')
      .because('Services should follow naming convention');

    rule.check();
  });
});
```

**2. Performance Fitness Functions**
```typescript
import { performance } from 'perf_hooks';

describe('Performance Fitness Functions', () => {
  it('should complete API request within 200ms', async () => {
    const start = performance.now();
    await apiClient.get('/users/123');
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(200);
  });

  it('should handle 1000 concurrent requests', async () => {
    const requests = Array(1000).fill(null).map(() =>
      apiClient.get('/health')
    );

    const start = performance.now();
    await Promise.all(requests);
    const duration = performance.now() - start;

    // Should complete in reasonable time
    expect(duration).toBeLessThan(5000);
  });
});
```

**3. Security Fitness Functions**
```typescript
describe('Security Fitness Functions', () => {
  it('should not expose sensitive data in logs', () => {
    const logContent = fs.readFileSync('app.log', 'utf-8');

    // Check for common sensitive patterns
    expect(logContent).not.toMatch(/password/i);
    expect(logContent).not.toMatch(/api[_-]?key/i);
    expect(logContent).not.toMatch(/secret/i);
    expect(logContent).not.toMatch(/\d{16}/); // Credit card numbers
  });

  it('should use HTTPS for all external APIs', () => {
    const configFiles = glob.sync('**/*.config.ts');

    configFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const httpUrls = content.match(/http:\/\/[^\s"']+/g) || [];

      // Filter out localhost
      const externalHttpUrls = httpUrls.filter(url =>
        !url.includes('localhost') && !url.includes('127.0.0.1')
      );

      expect(externalHttpUrls).toHaveLength(0);
    });
  });
});
```

**4. Scalability Fitness Functions**
```typescript
describe('Scalability Fitness Functions', () => {
  it('should be stateless (no in-memory session storage)', () => {
    const sourceFiles = glob.sync('src/**/*.ts');

    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');

      // Check for in-memory session patterns
      expect(content).not.toMatch(/express-session.*MemoryStore/);
      expect(content).not.toMatch(/const\s+sessions\s*=\s*\{/);
    });
  });

  it('should use connection pooling for database', () => {
    const dbConfig = require('../config/database');

    expect(dbConfig.pool).toBeDefined();
    expect(dbConfig.pool.min).toBeGreaterThan(0);
    expect(dbConfig.pool.max).toBeGreaterThan(dbConfig.pool.min);
  });
});
```

**5. Maintainability Fitness Functions**
```typescript
describe('Maintainability Fitness Functions', () => {
  it('should have test coverage above 80%', () => {
    const coverage = require('../coverage/coverage-summary.json');
    const totalCoverage = coverage.total.lines.pct;

    expect(totalCoverage).toBeGreaterThan(80);
  });

  it('should have no files exceeding 300 lines', () => {
    const sourceFiles = glob.sync('src/**/*.ts');

    sourceFiles.forEach(file => {
      const lines = fs.readFileSync(file, 'utf-8').split('\n').length;
      expect(lines).toBeLessThan(300);
    });
  });

  it('should have no functions exceeding 50 lines', () => {
    // Use static analysis tool
    const report = eslint.lintFiles(['src/**/*.ts']);
    const complexityIssues = report.results.flatMap(r => r.messages)
      .filter(m => m.ruleId === 'max-lines-per-function');

    expect(complexityIssues).toHaveLength(0);
  });
});
```

---

## Examples

### Example 1: Complete ATAM Evaluation

**System**: E-commerce Platform

**Business Drivers**
- Support 1M concurrent users during Black Friday
- 99.9% uptime SLA
- PCI DSS compliance for payment processing
- Global expansion to 50 countries

**Architecture Overview**
- Microservices architecture
- Event-driven communication
- Multi-region deployment
- CDN for static assets
- Kubernetes orchestration

**Quality Attribute Utility Tree**

```
Quality Attributes
├── Performance (H)
│   ├── API Latency (H, H)
│   │   └── Scenario: Checkout API responds in < 500ms at 10,000 req/s
│   └── Page Load Time (H, M)
│       └── Scenario: Product page loads in < 2s globally
├── Availability (H)
│   ├── Uptime (H, H)
│   │   └── Scenario: 99.9% uptime (< 8.76 hours downtime/year)
│   └── Disaster Recovery (H, H)
│       └── Scenario: Recover from region failure in < 5 minutes
├── Security (H)
│   ├── Payment Security (H, H)
│   │   └── Scenario: PCI DSS Level 1 compliance
│   └── Data Protection (H, M)
│       └── Scenario: GDPR compliance for EU customers
├── Scalability (H)
│   ├── Traffic Spikes (H, H)
│   │   └── Scenario: Handle 10x traffic during Black Friday
│   └── Geographic Expansion (M, M)
│       └── Scenario: Deploy to new region in < 1 week
└── Maintainability (M)
    ├── Deployment Frequency (M, M)
    │   └── Scenario: Deploy 10+ times per day
    └── Mean Time to Recovery (M, H)
        └── Scenario: Recover from incidents in < 30 minutes
```

**Architectural Approaches**

**1. Microservices for Scalability**
- **Decision**: Decompose into 15 microservices
- **Quality Attributes**: Scalability, Maintainability
- **Rationale**: Independent scaling, team autonomy
- **Tradeoffs**: Increased complexity, distributed system challenges

**2. Event-Driven Architecture for Decoupling**
- **Decision**: Use Kafka for inter-service communication
- **Quality Attributes**: Scalability, Availability
- **Rationale**: Asynchronous processing, loose coupling
- **Tradeoffs**: Eventual consistency, debugging complexity

**3. Multi-Region Deployment for Availability**
- **Decision**: Deploy to 3 AWS regions (US, EU, APAC)
- **Quality Attributes**: Availability, Performance
- **Rationale**: Geographic redundancy, low latency
- **Tradeoffs**: Increased cost, data consistency challenges

**4. CDN for Performance**
- **Decision**: CloudFront for static assets and API caching
- **Quality Attributes**: Performance, Scalability
- **Rationale**: Reduce latency, offload origin servers
- **Tradeoffs**: Cache invalidation complexity

**Sensitivity Points**
1. **Kafka Cluster Size**: Critical for event throughput
2. **Database Sharding Strategy**: Affects query performance
3. **Cache TTL Settings**: Impacts data freshness vs. performance
4. **Circuit Breaker Thresholds**: Affects availability vs. cascading failures

**Tradeoff Points**
1. **Consistency vs. Availability**: Eventual consistency for better availability
2. **Cost vs. Performance**: Multi-region deployment increases cost
3. **Complexity vs. Scalability**: Microservices add complexity for scalability

**Risks**
1. **High Risk**: Kafka single point of failure
   - **Mitigation**: Multi-AZ Kafka cluster, replication factor 3
2. **High Risk**: Database bottleneck during traffic spikes
   - **Mitigation**: Read replicas, caching layer, connection pooling
3. **Medium Risk**: Cross-region data consistency
   - **Mitigation**: Event sourcing, CQRS pattern
4. **Medium Risk**: Microservices debugging complexity
   - **Mitigation**: Distributed tracing (Jaeger), centralized logging

**Non-Risks**
1. CDN configuration is well-understood
2. Kubernetes orchestration is proven at scale
3. Payment gateway integration follows PCI DSS standards

**Recommendations**
1. Implement chaos engineering to validate resilience
2. Add database read replicas in each region
3. Implement distributed tracing before production
4. Create runbooks for common failure scenarios
5. Conduct load testing at 2x expected Black Friday traffic

### Example 2: Chaos Engineering Experiment

**Experiment**: Database Failover

**Hypothesis**
- **Steady State**: API error rate < 0.1%, p95 latency < 300ms
- **Experiment**: Terminate primary database instance
- **Expected Outcome**: Automatic failover to replica, error rate < 1% during failover, recovery < 30 seconds

**Experiment Configuration**
```typescript
const databaseFailoverExperiment: ChaosExperiment = {
  name: 'Database Primary Failover',
  hypothesis: {
    steadyState: {
      metric: 'error_rate',
      threshold: 0.1,
      unit: 'percent'
    },
    experiment: 'Terminate primary database instance',
    expectedOutcome: 'Automatic failover with < 1% error rate, < 30s recovery'
  },
  blastRadius: 100, // Full production traffic
  duration: 600, // 10 minutes
  rollbackCondition: 'error_rate > 5% OR p95_latency > 2000ms',
  steps: [
    {
      action: 'terminate_instance',
      target: 'database-primary',
      parameters: {
        instanceId: 'db-primary-1',
        graceful: false
      }
    },
    {
      action: 'monitor_metrics',
      target: 'api-service',
      parameters: {
        metrics: ['error_rate', 'p95_latency', 'database_connections'],
        interval: 5
      }
    },
    {
      action: 'monitor_failover',
      target: 'database-cluster',
      parameters: {
        checkInterval: 1,
        maxFailoverTime: 30
      }
    }
  ]
};
```

**Execution**
```bash
# Run chaos experiment
chaos-toolkit run database-failover.yaml

# Monitor metrics
watch -n 1 'curl -s http://metrics-api/current | jq .'
```

**Results**
```
Baseline Metrics (5 minutes before experiment):
- Error Rate: 0.05%
- P95 Latency: 245ms
- Database Connections: 150

Experiment Metrics:
T+0s:  Terminate primary database instance
T+2s:  Error rate spikes to 15% (connection errors)
T+8s:  Replica promoted to primary
T+10s: Connection pool reconnects to new primary
T+12s: Error rate drops to 2%
T+30s: Error rate returns to 0.1%
T+35s: P95 latency returns to 250ms

Recovery Time: 30 seconds
Peak Error Rate: 15%
Total Failed Requests: ~450 (out of 30,000)
```

**Findings**
1. ✅ Automatic failover worked as expected
2. ❌ Error rate exceeded 1% target during failover (15% peak)
3. ✅ Recovery time met 30-second target
4. ❌ Connection pool took 10 seconds to reconnect (too slow)

**Action Items**
1. Reduce connection pool reconnect timeout from 10s to 2s
2. Implement retry logic with exponential backoff
3. Add circuit breaker to fail fast during failover
4. Pre-warm connection pool to replica instances
5. Re-run experiment after improvements

### Example 3: Architecture Fitness Functions Suite

**Complete Fitness Function Suite**

```typescript
// tests/architecture/fitness-functions.test.ts

import { describe, it, expect } from '@jest/globals';
import { ArchRule, classes, packages } from 'ts-arch';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as glob from 'glob';

describe('Architecture Fitness Functions', () => {

  // ===== STRUCTURAL FITNESS FUNCTIONS =====

  describe('Layered Architecture', () => {
    it('domain layer should not depend on infrastructure', () => {
      const rule = classes()
        .that().resideInPackage('..domain..')
        .should().onlyDependOn(['..domain..', 'std-lib'])
        .because('Domain layer must be independent');

      rule.check();
    });

    it('application layer should not depend on infrastructure', () => {
      const rule = classes()
        .that().resideInPackage('..application..')
        .should().onlyDependOn(['..domain..', '..application..', 'std-lib'])
        .because('Application layer should not know about infrastructure');

      rule.check();
    });

    it('infrastructure layer can depend on all layers', () => {
      const rule = classes()
        .that().resideInPackage('..infrastructure..')
        .should().dependOn(['..domain..', '..application..'])
        .because('Infrastructure implements interfaces from other layers');

      rule.check();
    });
  });

  describe('Dependency Rules', () => {
    it('should have no circular dependencies', () => {
      const rule = packages()
        .should().beFreeOfCycles()
        .because('Circular dependencies create tight coupling');

      rule.check();
    });

    it('controllers should not directly access repositories', () => {
      const rule = classes()
        .that().resideInPackage('..controllers..')
        .should().notDependOn(['..repositories..'])
        .because('Controllers should use services, not repositories directly');

      rule.check();
    });
  });

  describe('Naming Conventions', () => {
    it('services should end with Service', () => {
      const rule = classes()
        .that().resideInPackage('..services..')
        .should().haveSimpleNameEndingWith('Service');

      rule.check();
    });

    it('repositories should end with Repository', () => {
      const rule = classes()
        .that().resideInPackage('..repositories..')
        .should().haveSimpleNameEndingWith('Repository');

      rule.check();
    });
  });

  // ===== PERFORMANCE FITNESS FUNCTIONS =====

  describe('Performance', () => {
    it('API endpoints should respond within 200ms', async () => {
      const endpoints = ['/users', '/products', '/orders'];

      for (const endpoint of endpoints) {
        const start = performance.now();
        await fetch(`http://localhost:3000${endpoint}`);
        const duration = performance.now() - start;

        expect(duration).toBeLessThan(200);
      }
    });

    it('should handle 1000 concurrent requests', async () => {
      const requests = Array(1000).fill(null).map(() =>
        fetch('http://localhost:3000/health')
      );

      const start = performance.now();
      const responses = await Promise.all(requests);
      const duration = performance.now() - start;

      expect(responses.every(r => r.ok)).toBe(true);
      expect(duration).toBeLessThan(5000);
    });

    it('database queries should use indexes', () => {
      const migrations = glob.sync('migrations/**/*.sql');

      migrations.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const createTableStatements = content.match(/CREATE TABLE/gi) || [];
        const createIndexStatements = content.match(/CREATE INDEX/gi) || [];

        // Should have at least one index per table
        expect(createIndexStatements.length).toBeGreaterThanOrEqual(
          createTableStatements.length
        );
      });
    });
  });

  // ===== SECURITY FITNESS FUNCTIONS =====

  describe('Security', () => {
    it('should not expose sensitive data in logs', () => {
      const logFiles = glob.sync('logs/**/*.log');

      logFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');

        expect(content).not.toMatch(/password/i);
        expect(content).not.toMatch(/api[_-]?key/i);
        expect(content).not.toMatch(/secret/i);
        expect(content).not.toMatch(/\d{16}/); // Credit cards
        expect(content).not.toMatch(/\d{3}-\d{2}-\d{4}/); // SSN
      });
    });

    it('should use HTTPS for all external APIs', () => {
      const configFiles = glob.sync('src/**/*.config.ts');

      configFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const httpUrls = content.match(/http:\/\/[^\s"']+/g) || [];
        const externalHttpUrls = httpUrls.filter(url =>
          !url.includes('localhost') && !url.includes('127.0.0.1')
        );

        expect(externalHttpUrls).toHaveLength(0);
      });
    });

    it('should validate all user inputs', () => {
      const controllerFiles = glob.sync('src/controllers/**/*.ts');

      controllerFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');

        // Check for validation decorators or middleware
        if (content.includes('req.body') || content.includes('req.query')) {
          expect(
            content.includes('@Validate') ||
            content.includes('validate(') ||
            content.includes('validateRequest')
          ).toBe(true);
        }
      });
    });

    it('should use parameterized queries', () => {
      const repositoryFiles = glob.sync('src/repositories/**/*.ts');

      repositoryFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');

        // Check for SQL injection vulnerabilities
        const rawQueries = content.match(/query\([`'"].*\$\{/g) || [];
        expect(rawQueries).toHaveLength(0);
      });
    });
  });

  // ===== SCALABILITY FITNESS FUNCTIONS =====

  describe('Scalability', () => {
    it('should be stateless (no in-memory sessions)', () => {
      const sourceFiles = glob.sync('src/**/*.ts');

      sourceFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');

        expect(content).not.toMatch(/express-session.*MemoryStore/);
        expect(content).not.toMatch(/const\s+sessions\s*=\s*\{/);
      });
    });

    it('should use connection pooling', () => {
      const dbConfig = require('../../src/config/database');

      expect(dbConfig.pool).toBeDefined();
      expect(dbConfig.pool.min).toBeGreaterThan(0);
      expect(dbConfig.pool.max).toBeGreaterThan(dbConfig.pool.min);
    });

    it('should implement caching for expensive operations', () => {
      const serviceFiles = glob.sync('src/services/**/*.ts');

      let hasCaching = false;
      serviceFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes('@Cache') || content.includes('cache.get')) {
          hasCaching = true;
        }
      });

      expect(hasCaching).toBe(true);
    });
  });

  // ===== MAINTAINABILITY FITNESS FUNCTIONS =====

  describe('Maintainability', () => {
    it('should have test coverage above 80%', () => {
      const coverage = require('../../coverage/coverage-summary.json');
      expect(coverage.total.lines.pct).toBeGreaterThan(80);
    });

    it('should have no files exceeding 300 lines', () => {
      const sourceFiles = glob.sync('src/**/*.ts');

      sourceFiles.forEach(file => {
        const lines = fs.readFileSync(file, 'utf-8').split('\n').length;
        expect(lines).toBeLessThan(300);
      });
    });

    it('should have no functions exceeding 50 lines', () => {
      const sourceFiles = glob.sync('src/**/*.ts');

      sourceFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const functions = content.match(/function\s+\w+\s*\([^)]*\)\s*\{/g) || [];

        functions.forEach(func => {
          const funcStart = content.indexOf(func);
          const funcBody = content.substring(funcStart);
          const funcEnd = this.findMatchingBrace(funcBody);
          const funcLines = funcBody.substring(0, funcEnd).split('\n').length;

          expect(funcLines).toBeLessThan(50);
        });
      });
    });

    it('should have no TODO comments older than 30 days', () => {
      const sourceFiles = glob.sync('src/**/*.ts');
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

      sourceFiles.forEach(file => {
        const stats = fs.statSync(file);
        const content = fs.readFileSync(file, 'utf-8');
        const todos = content.match(/\/\/\s*TODO/gi) || [];

        if (todos.length > 0 && stats.mtimeMs < thirtyDaysAgo) {
          throw new Error(`File ${file} has TODO comments older than 30 days`);
        }
      });
    });
  });

  // ===== RELIABILITY FITNESS FUNCTIONS =====

  describe('Reliability', () => {
    it('should implement circuit breakers for external services', () => {
      const serviceFiles = glob.sync('src/services/**/*Client.ts');

      serviceFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');

        expect(
          content.includes('CircuitBreaker') ||
          content.includes('@CircuitBreaker') ||
          content.includes('breaker.')
        ).toBe(true);
      });
    });

    it('should implement retry logic for transient failures', () => {
      const serviceFiles = glob.sync('src/services/**/*Client.ts');

      serviceFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');

        expect(
          content.includes('retry(') ||
          content.includes('@Retry') ||
          content.includes('retryPolicy')
        ).toBe(true);
      });
    });

    it('should have health check endpoints', async () => {
      const response = await fetch('http://localhost:3000/health');
      expect(response.ok).toBe(true);

      const health = await response.json();
      expect(health.status).toBe('healthy');
      expect(health.checks).toBeDefined();
    });
  });
});
```

**Running Fitness Functions in CI/CD**

```yaml
# .github/workflows/architecture-tests.yml
name: Architecture Fitness Functions

on: [push, pull_request]

jobs:
  architecture-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run fitness functions
        run: npm run test:architecture

      - name: Upload results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: architecture-test-results
          path: test-results/
```

---

## Understanding

### When to Use Each Evaluation Method

**ATAM**
- **Use When**: Evaluating major architectural decisions
- **Best For**: New systems, major refactoring, architecture reviews
- **Timing**: Before implementation, during design phase
- **Effort**: High (2-3 days with stakeholders)
- **Output**: Comprehensive risk assessment, tradeoff analysis

**Chaos Engineering**
- **Use When**: Validating system resilience
- **Best For**: Distributed systems, microservices, cloud-native apps
- **Timing**: After initial deployment, continuously
- **Effort**: Medium (setup experiments, monitor results)
- **Output**: Confidence in system reliability, failure scenarios

**Architecture Reviews**
- **Use When**: Regular validation of architecture
- **Best For**: Ongoing projects, architecture governance
- **Timing**: Quarterly, before major releases
- **Effort**: Low to Medium (few hours to 1 day)
- **Output**: Findings, recommendations, action items

**Fitness Functions**
- **Use When**: Continuous architecture validation
- **Best For**: All projects with CI/CD
- **Timing**: Every commit, every build
- **Effort**: Low (automated)
- **Output**: Pass/fail on architectural constraints

### Best Practices

**ATAM Best Practices**
1. Involve diverse stakeholders (business, dev, ops)
2. Focus on quality attributes, not just functionality
3. Document all decisions and rationale
4. Prioritize scenarios by business value
5. Follow up on identified risks
6. Update architecture documentation based on findings

**Chaos Engineering Best Practices**
1. Start small, increase blast radius gradually
2. Always have a rollback plan
3. Run experiments during business hours (with monitoring)
4. Automate experiments for continuous validation
5. Document all experiments and results
6. Share learnings across teams
7. Build a culture of resilience

**Architecture Review Best Practices**
1. Prepare documentation in advance
2. Focus on key decisions, not every detail
3. Encourage constructive criticism
4. Document findings and action items
5. Follow up on recommendations
6. Make reviews regular, not one-time events

**Fitness Function Best Practices**
1. Start with critical constraints
2. Make tests fast and reliable
3. Run in CI/CD pipeline
4. Fail the build on violations
5. Keep tests maintainable
6. Document the architectural intent
7. Review and update regularly

### Common Pitfalls

**ATAM Pitfalls**
- ❌ Not involving right stakeholders
- ❌ Focusing only on technical aspects
- ❌ Ignoring business drivers
- ❌ Not following up on risks
- ❌ Making it a one-time event

**Chaos Engineering Pitfalls**
- ❌ Running experiments without monitoring
- ❌ No rollback plan
- ❌ Starting with too large blast radius
- ❌ Not documenting experiments
- ❌ Blaming teams for failures found

**Architecture Review Pitfalls**
- ❌ Rubber-stamp reviews
- ❌ Focusing on code style, not architecture
- ❌ Not documenting findings
- ❌ No follow-up on action items
- ❌ Making it adversarial, not collaborative

**Fitness Function Pitfalls**
- ❌ Tests that are too slow
- ❌ Flaky tests that fail randomly
- ❌ Testing implementation, not architecture
- ❌ Too many tests (maintenance burden)
- ❌ Not updating tests as architecture evolves

### Integration with Development Process

**Architecture Evaluation Lifecycle**

```
Design Phase
├── ATAM Evaluation
│   ├── Identify quality attributes
│   ├── Evaluate architectural approaches
│   └── Document risks and tradeoffs
│
Implementation Phase
├── Fitness Functions
│   ├── Enforce architectural constraints
│   ├── Run on every commit
│   └── Fail build on violations
│
├── Architecture Reviews
│   ├── Weekly/bi-weekly reviews
│   ├── Validate implementation matches design
│   └── Identify deviations early
│
Deployment Phase
├── Performance Testing
│   ├── Load testing
│   ├── Stress testing
│   └── Validate quality attributes
│
Production Phase
├── Chaos Engineering
│   ├── Validate resilience
│   ├── Test failure scenarios
│   └── Build confidence
│
├── Periodic Reviews
│   ├── Quarterly architecture reviews
│   ├── Assess technical debt
│   └── Plan improvements
```

---

## References

### Standards and Frameworks
- **ISO/IEC 42010** - Architecture description standard
- **SEI ATAM** - Architecture Tradeoff Analysis Method
- **Principles of Chaos Engineering** - Netflix chaos engineering principles

### Books
- **"Software Architecture in Practice"** by Bass, Clements, Kazman (ATAM)
- **"Release It!"** by Michael Nygard (Resilience patterns)
- **"Chaos Engineering"** by Casey Rosenthal, Nora Jones
- **"Building Evolutionary Architectures"** by Ford, Parsons, Kua (Fitness functions)

### Tools
- **ATAM**: SEI ATAM method, architecture evaluation templates
- **Chaos Engineering**: Chaos Monkey, Chaos Toolkit, Gremlin, Litmus
- **Fitness Functions**: ArchUnit, NDepend, SonarQube, custom tests
- **Performance Testing**: JMeter, Gatling, k6, Locust
- **Monitoring**: Prometheus, Grafana, Datadog, New Relic

### Online Resources
- **SEI ATAM Resources**: https://www.sei.cmu.edu/our-work/atam/
- **Principles of Chaos Engineering**: https://principlesofchaos.org/
- **Netflix Tech Blog**: https://netflixtechblog.com/ (Chaos engineering)
- **Thoughtworks Technology Radar**: Architecture testing practices

