# Serverless Architecture

## Overview

This document covers serverless architecture patterns, Function-as-a-Service (FaaS), stateless functions, and best practices for building event-driven, scalable applications without managing servers.

---

## Knowledge

### What is Serverless Architecture?

**Definition**
- Cloud execution model where provider manages infrastructure
- Code runs in stateless compute containers
- Event-driven execution
- Automatic scaling
- Pay-per-execution pricing

**Core Principles**
- No server management
- Stateless functions
- Event-driven triggers
- Automatic scaling
- Built-in high availability

**Serverless Components**

**FaaS (Function-as-a-Service)**
- AWS Lambda, Azure Functions, Google Cloud Functions
- Execute code in response to events
- Millisecond billing
- Automatic scaling

**BaaS (Backend-as-a-Service)**
- Managed services: databases, authentication, storage
- Examples: AWS DynamoDB, Firebase, Auth0
- No infrastructure management

**Characteristics**
- Ephemeral execution (short-lived)
- Stateless (no persistent state in function)
- Cold start latency
- Execution time limits (e.g., 15 min for Lambda)
- Memory and CPU limits

### When to Use Serverless

**Good Fit**
- Event-driven workloads
- Unpredictable or variable traffic
- Microservices and APIs
- Data processing pipelines
- Scheduled tasks (cron jobs)
- Webhooks and integrations
- Prototypes and MVPs

**Poor Fit**
- Long-running processes (> 15 minutes)
- Stateful applications
- Predictable, constant high load
- Low-latency requirements (< 100ms)
- Complex orchestration
- Legacy applications

---

## Skills

### Function Design

**Stateless Functions**
```javascript
// Good: Stateless function
exports.handler = async (event) => {
    const userId = event.pathParameters.userId;
    
    // Get data from external source
    const user = await dynamodb.get({
        TableName: 'Users',
        Key: { userId }
    }).promise();
    
    return {
        statusCode: 200,
        body: JSON.stringify(user.Item)
    };
};

// Bad: Stateful function (don't do this)
let requestCount = 0; // State persists across invocations!

exports.handler = async (event) => {
    requestCount++; // Unreliable
    // ...
};
```

**Single Responsibility**
- One function, one purpose
- Small, focused functions
- Easy to test and maintain
- Independent deployment

**Function Size Guidelines**
- Keep functions small (< 500 lines)
- Minimize dependencies
- Fast cold start (< 3 seconds)
- Optimize package size

### Event Sources and Triggers

**HTTP Triggers**
- API Gateway → Lambda
- REST APIs
- Webhooks
- GraphQL endpoints

**Storage Triggers**
- S3 object created/deleted
- File processing
- Image resizing
- Data transformation

**Database Triggers**
- DynamoDB Streams
- Change data capture
- Audit logging
- Data replication

**Message Queue Triggers**
- SQS, SNS, EventBridge
- Asynchronous processing
- Event-driven workflows
- Decoupled systems

**Scheduled Triggers**
- CloudWatch Events (cron)
- Periodic tasks
- Batch processing
- Cleanup jobs

### Cold Start Optimization

**What is Cold Start?**
- First invocation after idle period
- Container initialization
- Code loading
- Dependency initialization
- Can add 1-5 seconds latency

**Optimization Techniques**

**Minimize Package Size**
```javascript
// Good: Import only what you need
const { DynamoDB } = require('aws-sdk');

// Bad: Import entire SDK
const AWS = require('aws-sdk');
```

**Lazy Loading**
```javascript
let dynamodb;

exports.handler = async (event) => {
    // Initialize on first use
    if (!dynamodb) {
        const { DynamoDB } = require('aws-sdk');
        dynamodb = new DynamoDB.DocumentClient();
    }
    
    // Use dynamodb...
};
```

**Provisioned Concurrency**
- Keep functions warm
- Pre-initialized containers
- Eliminates cold starts
- Higher cost

**Connection Reuse**
```javascript
// Initialize outside handler (reused across invocations)
const { DynamoDB } = require('aws-sdk');
const dynamodb = new DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // Reuse connection
    const result = await dynamodb.get({...}).promise();
    return result;
};
```

### State Management

**External State Storage**
- DynamoDB for NoSQL data
- RDS for relational data
- S3 for files and objects
- ElastiCache for caching

**Temporary State**
- /tmp directory (512 MB - 10 GB)
- Ephemeral (cleared between cold starts)
- Use for temporary files

**Distributed State**
- Step Functions for workflow state
- DynamoDB for shared state
- Parameter Store for configuration
- Secrets Manager for credentials

---

## Examples

### REST API with Lambda and API Gateway

**Function: Get User**
```javascript
const { DynamoDB } = require('aws-sdk');
const dynamodb = new DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const userId = event.pathParameters.userId;

        const result = await dynamodb.get({
            TableName: process.env.USERS_TABLE,
            Key: { userId }
        }).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'User not found' })
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(result.Item)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
```

**Function: Create User**
```javascript
const { DynamoDB } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);

        // Validate input
        if (!body.email || !body.name) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'Email and name are required'
                })
            };
        }

        const user = {
            userId: uuidv4(),
            email: body.email,
            name: body.name,
            createdAt: new Date().toISOString()
        };

        await dynamodb.put({
            TableName: process.env.USERS_TABLE,
            Item: user
        }).promise();

        return {
            statusCode: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(user)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
```

**Infrastructure as Code (Serverless Framework)**
```yaml
service: user-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    USERS_TABLE: ${self:service}-users-${self:provider.stage}
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:GetItem
        - dynamodb:PutItem
        - dynamodb:Query
      Resource:
        - arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.USERS_TABLE}

functions:
  getUser:
    handler: handlers/getUser.handler
    events:
      - http:
          path: users/{userId}
          method: get
          cors: true

  createUser:
    handler: handlers/createUser.handler
    events:
      - http:
          path: users
          method: post
          cors: true

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.USERS_TABLE}
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
```

### Image Processing Pipeline

**S3 Trigger Function**
```javascript
const AWS = require('aws-sdk');
const sharp = require('sharp');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    // Get S3 event details
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(
        event.Records[0].s3.object.key.replace(/\+/g, ' ')
    );

    try {
        // Download image from S3
        const image = await s3.getObject({
            Bucket: bucket,
            Key: key
        }).promise();

        // Resize image
        const resized = await sharp(image.Body)
            .resize(800, 600, { fit: 'inside' })
            .jpeg({ quality: 80 })
            .toBuffer();

        // Upload resized image
        const outputKey = key.replace('uploads/', 'thumbnails/');
        await s3.putObject({
            Bucket: bucket,
            Key: outputKey,
            Body: resized,
            ContentType: 'image/jpeg'
        }).promise();

        console.log(`Resized ${key} to ${outputKey}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Image processed successfully',
                thumbnail: outputKey
            })
        };
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
};
```

### Event-Driven Workflow with Step Functions

**Order Processing Workflow**
```json
{
  "Comment": "Order processing workflow",
  "StartAt": "ValidateOrder",
  "States": {
    "ValidateOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:ValidateOrder",
      "Next": "CheckInventory"
    },
    "CheckInventory": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:CheckInventory",
      "Next": "InventoryAvailable?"
    },
    "InventoryAvailable?": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.inventoryAvailable",
          "BooleanEquals": true,
          "Next": "ProcessPayment"
        }
      ],
      "Default": "NotifyOutOfStock"
    },
    "ProcessPayment": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:ProcessPayment",
      "Next": "PaymentSuccessful?"
    },
    "PaymentSuccessful?": {
      "Type": "Choice",
      "Choices": [
        {
          "Variable": "$.paymentStatus",
          "StringEquals": "SUCCESS",
          "Next": "FulfillOrder"
        }
      ],
      "Default": "NotifyPaymentFailed"
    },
    "FulfillOrder": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:FulfillOrder",
      "Next": "SendConfirmation"
    },
    "SendConfirmation": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:SendConfirmation",
      "End": true
    },
    "NotifyOutOfStock": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:NotifyOutOfStock",
      "End": true
    },
    "NotifyPaymentFailed": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:NotifyPaymentFailed",
      "End": true
    }
  }
}
```

**Lambda Function for Step**
```javascript
exports.handler = async (event) => {
    const { orderId, items } = event;

    // Check inventory
    const inventoryAvailable = await checkInventory(items);

    return {
        ...event,
        inventoryAvailable,
        checkedAt: new Date().toISOString()
    };
};
```

### Scheduled Task (Cron Job)

**Daily Report Generator**
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    try {
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toISOString().split('T')[0];

        // Query orders from yesterday
        const orders = await dynamodb.query({
            TableName: process.env.ORDERS_TABLE,
            IndexName: 'DateIndex',
            KeyConditionExpression: 'orderDate = :date',
            ExpressionAttributeValues: {
                ':date': dateStr
            }
        }).promise();

        // Generate report
        const report = {
            date: dateStr,
            totalOrders: orders.Items.length,
            totalRevenue: orders.Items.reduce(
                (sum, order) => sum + order.total,
                0
            ),
            orders: orders.Items
        };

        // Save report to S3
        await s3.putObject({
            Bucket: process.env.REPORTS_BUCKET,
            Key: `daily-reports/${dateStr}.json`,
            Body: JSON.stringify(report, null, 2),
            ContentType: 'application/json'
        }).promise();

        console.log(`Generated report for ${dateStr}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Report generated successfully',
                date: dateStr
            })
        };
    } catch (error) {
        console.error('Error generating report:', error);
        throw error;
    }
};
```

**CloudWatch Event Rule (Serverless Framework)**
```yaml
functions:
  dailyReport:
    handler: handlers/dailyReport.handler
    events:
      - schedule:
          rate: cron(0 2 * * ? *)  # Run at 2 AM UTC daily
          enabled: true
```

---

## Understanding

### Advantages of Serverless Architecture

**No Server Management**
- No provisioning or maintenance
- Automatic OS updates
- Built-in high availability
- Focus on code, not infrastructure

**Automatic Scaling**
- Scales with demand
- Zero to thousands of requests
- No capacity planning
- Handles traffic spikes

**Cost Efficiency**
- Pay per execution
- No idle capacity costs
- Millisecond billing
- Free tier available

**Faster Time to Market**
- Rapid development
- Less operational overhead
- Built-in integrations
- Focus on business logic

**Built-in Fault Tolerance**
- Automatic retries
- Dead letter queues
- Multi-AZ deployment
- High availability

### Challenges and Disadvantages

**Cold Start Latency**
- First invocation delay (1-5 seconds)
- Impacts user experience
- Varies by runtime and package size
- Mitigated with provisioned concurrency (cost)

**Execution Time Limits**
- AWS Lambda: 15 minutes max
- Not suitable for long-running tasks
- Need to break into smaller functions
- Use Step Functions for orchestration

**Vendor Lock-in**
- Platform-specific APIs
- Migration complexity
- Limited portability
- Dependency on provider

**Debugging Challenges**
- Distributed system complexity
- Limited local testing
- CloudWatch logs only
- Difficult to reproduce issues

**Stateless Constraints**
- No persistent state in function
- External storage required
- Connection overhead
- Complexity for stateful apps

**Cost at Scale**
- Can be expensive at high volume
- Unpredictable costs
- Need monitoring and optimization
- Compare with container/VM costs

### Best Practices

**Function Design**
- Keep functions small and focused
- Minimize dependencies
- Optimize cold start time
- Use environment variables for configuration
- Implement proper error handling

**Security**
- Principle of least privilege (IAM)
- Encrypt sensitive data
- Use Secrets Manager for credentials
- Validate all inputs
- Enable VPC for private resources

**Performance**
- Reuse connections outside handler
- Use provisioned concurrency for critical paths
- Optimize package size
- Implement caching
- Monitor and optimize memory allocation

**Monitoring and Logging**
- Structured logging
- CloudWatch metrics
- Distributed tracing (X-Ray)
- Alerting on errors
- Cost monitoring

**Testing**
- Unit tests for business logic
- Integration tests with LocalStack
- Load testing
- Chaos engineering
- Canary deployments

---

## References

- **Books**
  - "Serverless Architectures on AWS" by Peter Sbarski
  - "AWS Lambda in Action" by Danilo Poccia
  - "Serverless Design Patterns" by Brian Zambrano

- **Patterns**
  - API Gateway Pattern
  - Event-Driven Pattern
  - Fan-Out Pattern
  - Choreography Pattern
  - Orchestration Pattern (Step Functions)

- **Platforms**
  - AWS Lambda
  - Azure Functions
  - Google Cloud Functions
  - Cloudflare Workers
  - Vercel Functions

- **Frameworks**
  - Serverless Framework
  - AWS SAM (Serverless Application Model)
  - Terraform
  - Pulumi


