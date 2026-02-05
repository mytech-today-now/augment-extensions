# Serverless Image Processing Pipeline Example

## Overview

This document provides a comprehensive example of a serverless image processing pipeline built with AWS Lambda, S3, and event-driven architecture, focusing on scalability, cost-efficiency, and automatic scaling.

---

## System Context

### Business Requirements

**Functional Requirements**
- Image upload and storage
- Automatic thumbnail generation (multiple sizes)
- Image optimization and compression
- Metadata extraction (EXIF, dimensions, format)
- Image format conversion (JPEG, PNG, WebP)
- Watermark application
- Face detection and tagging
- Content moderation (NSFW detection)
- Image search and retrieval

**Non-Functional Requirements**
- **Scalability**: Handle 1M+ images/day
- **Cost**: Pay-per-use, no idle costs
- **Latency**: < 5 seconds for thumbnail generation
- **Availability**: 99.9% uptime
- **Storage**: Unlimited image storage
- **Security**: Encrypted storage, signed URLs

### Use Cases

- **Social Media Platform**: User profile pictures, photo uploads
- **E-Commerce**: Product images, multiple sizes for responsive design
- **Content Management**: Media library, automatic optimization
- **Real Estate**: Property photos, virtual tours

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Serverless Image Processing Pipeline            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  User Upload → API Gateway → Lambda (Upload) → S3 (Original) │
│                                                    ↓          │
│                                          S3 Event Trigger     │
│                                                    ↓          │
│                                    Lambda (Process Image)     │
│                                                    ↓          │
│                          ┌─────────────────────────┴─────┐   │
│                          ↓                               ↓   │
│                  Lambda (Thumbnail)              Lambda (Metadata) │
│                          ↓                               ↓   │
│                  S3 (Thumbnails)                 DynamoDB  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Event Flow

```
1. Upload Flow
   User → API Gateway → Lambda → S3 → S3 Event → Lambda (Process)

2. Processing Flow
   S3 Event → Lambda → [Thumbnail, Optimize, Metadata, Moderation]

3. Retrieval Flow
   User → API Gateway → Lambda → S3 (Signed URL) → User
```

---

## Service Architecture

### Lambda Functions

**1. Upload Handler**
- Validate image file (type, size)
- Generate unique filename
- Upload to S3 original bucket
- Return upload confirmation

**2. Image Processor (Orchestrator)**
- Triggered by S3 event
- Invoke parallel processing functions
- Coordinate workflow

**3. Thumbnail Generator**
- Generate multiple thumbnail sizes (150x150, 300x300, 600x600)
- Maintain aspect ratio
- Upload to S3 thumbnails bucket

**4. Image Optimizer**
- Compress images (reduce file size)
- Convert to WebP format
- Optimize for web delivery

**5. Metadata Extractor**
- Extract EXIF data (camera, location, timestamp)
- Calculate image dimensions
- Store metadata in DynamoDB

**6. Content Moderator**
- Detect NSFW content (AWS Rekognition)
- Flag inappropriate images
- Send notification if flagged

**7. Face Detector**
- Detect faces in images
- Extract face bounding boxes
- Store face data for search

---

## Technology Stack

### AWS Services
- **Compute**: AWS Lambda (Node.js, Python)
- **Storage**: S3 (original, thumbnails, optimized)
- **Database**: DynamoDB (metadata, image index)
- **API**: API Gateway (REST API)
- **AI/ML**: AWS Rekognition (face detection, content moderation)
- **Messaging**: SNS (notifications), SQS (dead letter queue)
- **CDN**: CloudFront (image delivery)
- **Security**: IAM, KMS (encryption)

### Libraries
- **Image Processing**: Sharp (Node.js), Pillow (Python)
- **Format Conversion**: ImageMagick
- **Metadata**: ExifTool

### Infrastructure as Code
- **IaC**: AWS SAM (Serverless Application Model)
- **CI/CD**: AWS CodePipeline, CodeBuild
- **Monitoring**: CloudWatch, X-Ray

---

## Implementation Details

### 1. Upload Handler Lambda

**API Gateway Integration**
```

### 2. Thumbnail Generator Lambda

**S3 Event-Triggered Processing**

```javascript
// thumbnail-generator/index.js
const AWS = require('aws-sdk');
const sharp = require('sharp');
const s3 = new AWS.S3();

const THUMBNAIL_SIZES = [
    { name: 'small', width: 150, height: 150 },
    { name: 'medium', width: 300, height: 300 },
    { name: 'large', width: 600, height: 600 }
];

exports.handler = async (event) => {
    // Get S3 event details
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    try {
        // Download original image from S3
        const originalImage = await s3.getObject({
            Bucket: bucket,
            Key: key
        }).promise();

        // Generate thumbnails in parallel
        const thumbnailPromises = THUMBNAIL_SIZES.map(async (size) => {
            // Resize image using Sharp
            const thumbnail = await sharp(originalImage.Body)
                .resize(size.width, size.height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            // Upload thumbnail to S3
            const thumbnailKey = key.replace('original/', `thumbnails/${size.name}/`);

            await s3.putObject({
                Bucket: process.env.THUMBNAIL_BUCKET,
                Key: thumbnailKey,
                Body: thumbnail,
                ContentType: 'image/jpeg',
                CacheControl: 'max-age=31536000' // 1 year
            }).promise();

            return {
                size: size.name,
                key: thumbnailKey,
                width: size.width,
                height: size.height
            };
        });

        const thumbnails = await Promise.all(thumbnailPromises);

        console.log('Thumbnails generated:', thumbnails);

        return {
            statusCode: 200,
            body: JSON.stringify({ thumbnails })
        };
    } catch (error) {
        console.error('Thumbnail generation error:', error);
        throw error;
    }
};
```

### 3. Metadata Extractor Lambda

**Extract and Store Image Metadata**

```javascript
// metadata-extractor/index.js
const AWS = require('aws-sdk');
const sharp = require('sharp');
const ExifParser = require('exif-parser');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    try {
        // Download image
        const image = await s3.getObject({
            Bucket: bucket,
            Key: key
        }).promise();

        // Extract image metadata using Sharp
        const metadata = await sharp(image.Body).metadata();

        // Extract EXIF data
        let exifData = {};
        try {
            const parser = ExifParser.create(image.Body);
            const result = parser.parse();
            exifData = result.tags;
        } catch (e) {
            console.log('No EXIF data found');
        }

        // Extract image ID from key
        const imageId = key.split('/').pop().split('.')[0];

        // Prepare metadata document
        const metadataDoc = {
            imageId,
            key,
            bucket,
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            size: image.ContentLength,
            hasAlpha: metadata.hasAlpha,
            orientation: metadata.orientation,
            exif: {
                make: exifData.Make,
                model: exifData.Model,
                dateTime: exifData.DateTime,
                gps: {
                    latitude: exifData.GPSLatitude,
                    longitude: exifData.GPSLongitude
                }
            },
            createdAt: new Date().toISOString()
        };

        // Store metadata in DynamoDB
        await dynamodb.put({
            TableName: process.env.METADATA_TABLE,
            Item: metadataDoc
        }).promise();

        console.log('Metadata stored:', metadataDoc);

        return {
            statusCode: 200,
            body: JSON.stringify({ metadata: metadataDoc })
        };
    } catch (error) {
        console.error('Metadata extraction error:', error);
        throw error;
    }
};
```

### 4. Image Optimizer Lambda

**Optimize and Convert Images**

```javascript
// image-optimizer/index.js
const AWS = require('aws-sdk');
const sharp = require('sharp');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    try {
        // Download original image
        const originalImage = await s3.getObject({
            Bucket: bucket,
            Key: key
        }).promise();

        // Optimize JPEG
        const optimizedJpeg = await sharp(originalImage.Body)
            .jpeg({
                quality: 85,
                progressive: true,
                mozjpeg: true
            })
            .toBuffer();

        // Convert to WebP (modern format, better compression)
        const webpImage = await sharp(originalImage.Body)
            .webp({
                quality: 85,
                effort: 6
            })
            .toBuffer();

        // Upload optimized JPEG
        const jpegKey = key.replace('original/', 'optimized/jpeg/');
        await s3.putObject({
            Bucket: process.env.OPTIMIZED_BUCKET,
            Key: jpegKey,
            Body: optimizedJpeg,
            ContentType: 'image/jpeg',
            CacheControl: 'max-age=31536000'
        }).promise();

        // Upload WebP version
        const webpKey = key.replace('original/', 'optimized/webp/').replace(/\.(jpg|jpeg|png)$/, '.webp');
        await s3.putObject({
            Bucket: process.env.OPTIMIZED_BUCKET,
            Key: webpKey,
            Body: webpImage,
            ContentType: 'image/webp',
            CacheControl: 'max-age=31536000'
        }).promise();

        // Calculate compression ratio
        const originalSize = originalImage.ContentLength;
        const jpegSize = optimizedJpeg.length;
        const webpSize = webpImage.length;

        console.log('Optimization complete:', {
            originalSize,
            jpegSize,
            webpSize,
            jpegSavings: ((originalSize - jpegSize) / originalSize * 100).toFixed(2) + '%',
            webpSavings: ((originalSize - webpSize) / originalSize * 100).toFixed(2) + '%'
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                jpegKey,
                webpKey,
                originalSize,
                jpegSize,
                webpSize
            })
        };
    } catch (error) {
        console.error('Optimization error:', error);
        throw error;
    }
};
```

### 5. Content Moderator Lambda

**AI-Powered Content Moderation**

```javascript
// content-moderator/index.js
const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();
const sns = new AWS.SNS();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    try {
        // Detect inappropriate content using AWS Rekognition
        const moderationResult = await rekognition.detectModerationLabels({
            Image: {
                S3Object: {
                    Bucket: bucket,
                    Name: key
                }
            },
            MinConfidence: 75
        }).promise();

        const imageId = key.split('/').pop().split('.')[0];

        // Check for inappropriate content
        const inappropriateLabels = moderationResult.ModerationLabels.filter(
            label => label.Confidence > 80
        );

        const isFlagged = inappropriateLabels.length > 0;

        // Update DynamoDB with moderation results
        await dynamodb.update({
            TableName: process.env.METADATA_TABLE,
            Key: { imageId },
            UpdateExpression: 'SET moderation = :moderation, isFlagged = :isFlagged',
            ExpressionAttributeValues: {
                ':moderation': {
                    labels: inappropriateLabels,
                    checkedAt: new Date().toISOString()
                },
                ':isFlagged': isFlagged
            }
        }).promise();

        // Send notification if flagged
        if (isFlagged) {
            await sns.publish({
                TopicArn: process.env.ALERT_TOPIC_ARN,
                Subject: 'Inappropriate Content Detected',
                Message: JSON.stringify({
                    imageId,
                    key,
                    labels: inappropriateLabels
                })
            }).promise();
        }

        console.log('Moderation complete:', {
            imageId,
            isFlagged,
            labels: inappropriateLabels
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                imageId,
                isFlagged,
                labels: inappropriateLabels
            })
        };
    } catch (error) {
        console.error('Moderation error:', error);
        throw error;
    }
};
```

---

## Infrastructure as Code (AWS SAM)

### SAM Template

```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Serverless Image Processing Pipeline

Globals:
  Function:
    Timeout: 30
    MemorySize: 1024
    Runtime: nodejs18.x
    Environment:
      Variables:
        ORIGINAL_BUCKET: !Ref OriginalBucket
        THUMBNAIL_BUCKET: !Ref ThumbnailBucket
        OPTIMIZED_BUCKET: !Ref OptimizedBucket
        METADATA_TABLE: !Ref MetadataTable

Resources:
  # S3 Buckets
  OriginalBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${AWS::StackName}-original'
      VersioningConfiguration:
        Status: Enabled
      LifecycleConfiguration:
        Rules:
          - Id: DeleteOldVersions
            Status: Enabled
            NoncurrentVersionExpirationInDays: 30

  ThumbnailBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${AWS::StackName}-thumbnails'

  OptimizedBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${AWS::StackName}-optimized'

  # DynamoDB Table
  MetadataTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub '${AWS::StackName}-metadata'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: imageId
          AttributeType: S
      KeySchema:
        - AttributeName: imageId
          KeyType: HASH

  # Lambda Functions
  UploadFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: upload-handler/
      Handler: index.handler
      Events:
        UploadApi:
          Type: Api
          Properties:
            Path: /upload
            Method: post
      Policies:
        - S3WritePolicy:
            BucketName: !Ref OriginalBucket

  ThumbnailFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: thumbnail-generator/
      Handler: index.handler
      MemorySize: 2048  # More memory for image processing
      Timeout: 60
      Events:
        S3Event:
          Type: S3
          Properties:
            Bucket: !Ref OriginalBucket
            Events: s3:ObjectCreated:*
            Filter:
              S3Key:
                Rules:
                  - Name: prefix
                    Value: original/
      Policies:
        - S3ReadPolicy:
            BucketName: !Ref OriginalBucket
        - S3WritePolicy:
            BucketName: !Ref ThumbnailBucket

  MetadataFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: metadata-extractor/
      Handler: index.handler
      Events:
        S3Event:
          Type: S3
          Properties:
            Bucket: !Ref OriginalBucket
            Events: s3:ObjectCreated:*
      Policies:
        - S3ReadPolicy:
            BucketName: !Ref OriginalBucket
        - DynamoDBWritePolicy:
            TableName: !Ref MetadataTable

  OptimizerFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: image-optimizer/
      Handler: index.handler
      MemorySize: 2048
      Timeout: 60
      Events:
        S3Event:
          Type: S3
          Properties:
            Bucket: !Ref OriginalBucket
            Events: s3:ObjectCreated:*
      Policies:
        - S3ReadPolicy:
            BucketName: !Ref OriginalBucket
        - S3WritePolicy:
            BucketName: !Ref OptimizedBucket

  ModeratorFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: content-moderator/
      Handler: index.handler
      Events:
        S3Event:
          Type: S3
          Properties:
            Bucket: !Ref OriginalBucket
            Events: s3:ObjectCreated:*
      Policies:
        - S3ReadPolicy:
            BucketName: !Ref OriginalBucket
        - DynamoDBWritePolicy:
            TableName: !Ref MetadataTable
        - RekognitionDetectOnlyPolicy: {}
        - SNSPublishMessagePolicy:
            TopicName: !GetAtt AlertTopic.TopicName

  # SNS Topic for Alerts
  AlertTopic:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: !Sub '${AWS::StackName}-alerts'

Outputs:
  UploadApiUrl:
    Description: API Gateway endpoint URL for upload
    Value: !Sub 'https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/upload/'

  OriginalBucketName:
    Description: S3 bucket for original images
    Value: !Ref OriginalBucket

  MetadataTableName:
    Description: DynamoDB table for metadata
    Value: !Ref MetadataTable
```

---

## Cost Optimization

### Lambda Cost Optimization

**1. Right-Size Memory**
```javascript
// Use AWS Lambda Power Tuning to find optimal memory
// Higher memory = faster execution = lower cost (sometimes)
// Example: 1024MB @ 500ms vs 512MB @ 1000ms (same cost, faster response)
```

**2. Reduce Cold Starts**
```javascript
// Keep functions warm with scheduled pings (if needed)
// Use provisioned concurrency for critical functions
// Minimize dependencies (smaller deployment package)
```

**3. Batch Processing**
```javascript
// Process multiple images in one invocation (if possible)
// Use S3 Batch Operations for bulk processing
```

### S3 Cost Optimization

**1. Lifecycle Policies**
```yaml
# Move old images to cheaper storage classes
LifecycleConfiguration:
  Rules:
    - Id: MoveToIA
      Status: Enabled
      Transitions:
        - Days: 30
          StorageClass: STANDARD_IA  # Infrequent Access
        - Days: 90
          StorageClass: GLACIER  # Archive
```

**2. Intelligent Tiering**
- Automatically moves objects between access tiers
- Optimizes costs based on access patterns

### Cost Metrics

**Monthly Cost Estimate (1M images/month)**

- **Lambda**: $50 (1M invocations × 5 functions × 1s avg × $0.0000166667/GB-second)
- **S3 Storage**: $100 (500GB × $0.023/GB)
- **S3 Requests**: $5 (5M PUT/GET requests)
- **DynamoDB**: $25 (1M writes, 5M reads)
- **Rekognition**: $100 (1M images × $0.001/image)
- **Data Transfer**: $20 (200GB out)

**Total**: ~$300/month for 1M images

**Comparison to EC2**:
- EC2 (t3.large 24/7): $60/month + EBS + ALB = ~$100/month
- But: No auto-scaling, manual management, idle costs

---

## Monitoring and Observability

### CloudWatch Metrics

**Lambda Metrics**
```javascript
// Custom metrics
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

async function publishMetric(metricName, value, unit = 'Count') {
    await cloudwatch.putMetricData({
        Namespace: 'ImageProcessing',
        MetricData: [{
            MetricName: metricName,
            Value: value,
            Unit: unit,
            Timestamp: new Date()
        }]
    }).promise();
}

// Usage
await publishMetric('ThumbnailsGenerated', 3);
await publishMetric('ImageSizeReduction', 45, 'Percent');
```

**Key Metrics to Monitor**
- Lambda invocations, duration, errors, throttles
- S3 bucket size, request count
- DynamoDB read/write capacity
- API Gateway latency, 4xx/5xx errors

### X-Ray Tracing

**Enable Distributed Tracing**
```javascript
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

// Trace subsegments
exports.handler = async (event) => {
    const segment = AWSXRay.getSegment();

    const subsegment = segment.addNewSubsegment('ImageProcessing');
    try {
        // Process image
        await processImage(event);
        subsegment.close();
    } catch (error) {
        subsegment.addError(error);
        subsegment.close();
        throw error;
    }
};
```

### Alarms

```yaml
# CloudWatch Alarms
Alarms:
  HighErrorRate:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: ImageProcessing-HighErrorRate
      MetricName: Errors
      Namespace: AWS/Lambda
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 10
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref AlertTopic

  HighLatency:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: ImageProcessing-HighLatency
      MetricName: Duration
      Namespace: AWS/Lambda
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 5000  # 5 seconds
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref AlertTopic
```

---

## Security Best Practices

### 1. Least Privilege IAM Policies

```yaml
# Lambda execution role with minimal permissions
LambdaExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal:
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    Policies:
      - PolicyName: S3Access
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - s3:GetObject
              Resource: !Sub '${OriginalBucket}/*'
            - Effect: Allow
              Action:
                - s3:PutObject
              Resource: !Sub '${ThumbnailBucket}/*'
```

### 2. Encryption

**S3 Encryption**
```yaml
OriginalBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketEncryption:
      ServerSideEncryptionConfiguration:
        - ServerSideEncryptionByDefault:
            SSEAlgorithm: AES256  # or aws:kms for KMS
```

**DynamoDB Encryption**
```yaml
MetadataTable:
  Type: AWS::DynamoDB::Table
  Properties:
    SSESpecification:
      SSEEnabled: true
      SSEType: KMS
      KMSMasterKeyId: !Ref KMSKey
```

### 3. API Security

**API Gateway with API Key**
```yaml
UploadApi:
  Type: AWS::Serverless::Api
  Properties:
    StageName: Prod
    Auth:
      ApiKeyRequired: true
      UsagePlan:
        CreateUsagePlan: PER_API
        Quota:
          Limit: 10000
          Period: DAY
        Throttle:
          BurstLimit: 100
          RateLimit: 50
```

---

## Key Takeaways

### Architecture Decisions

1. **Serverless Architecture**: No server management, automatic scaling, pay-per-use
2. **Event-Driven Processing**: S3 events trigger Lambda functions automatically
3. **Parallel Processing**: Multiple Lambda functions process images concurrently
4. **Managed Services**: S3, DynamoDB, Rekognition reduce operational overhead
5. **Infrastructure as Code**: AWS SAM for reproducible deployments

### Trade-offs

**Benefits**
- ✅ Zero server management
- ✅ Automatic scaling (0 to millions)
- ✅ Pay only for actual usage
- ✅ Built-in high availability
- ✅ Fast time-to-market
- ✅ Reduced operational costs

**Challenges**
- ❌ Cold start latency (100-500ms)
- ❌ Execution time limits (15 min max)
- ❌ Vendor lock-in (AWS-specific)
- ❌ Debugging complexity (distributed system)
- ❌ Limited control over infrastructure

### Performance Metrics

**Before Optimization**
- Processing time: 10 seconds/image
- Cost: $500/month (1M images)
- Cold start: 2 seconds

**After Optimization**
- Processing time: 3 seconds/image
- Cost: $300/month (1M images)
- Cold start: 500ms (optimized package size)

### Lessons Learned

1. **Optimize Lambda memory**: Higher memory = faster execution (sometimes cheaper)
2. **Use S3 lifecycle policies**: Reduce storage costs for old images
3. **Implement dead letter queues**: Catch failed processing
4. **Monitor cold starts**: Use provisioned concurrency if needed
5. **Batch operations**: Process multiple items when possible
6. **Use CloudFront**: Cache images at edge for faster delivery

---

## References

- **AWS Lambda**: Serverless compute service
- **AWS SAM**: Serverless Application Model
- **Sharp**: High-performance Node.js image processing
- **AWS Rekognition**: AI-powered image analysis
- **AWS X-Ray**: Distributed tracing

---

**Total Lines**: 957
