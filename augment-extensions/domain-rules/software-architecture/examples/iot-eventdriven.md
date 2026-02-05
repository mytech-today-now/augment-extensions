# IoT Architecture Example: Tesla-Style OTA Update System

## Overview

This document provides a comprehensive example of an IoT architecture for Over-The-Air (OTA) firmware updates, inspired by Tesla's vehicle update system, focusing on scalability, security, and reliability.

---

## System Context

### Business Requirements

**Functional Requirements**
- Remote firmware updates for millions of devices
- Staged rollout with canary deployments
- Real-time device telemetry and monitoring
- Device health checks and diagnostics
- Rollback capability for failed updates
- Update scheduling and prioritization
- Bandwidth optimization (delta updates)
- Offline update support

**Non-Functional Requirements**
- **Scalability**: Support 10M+ devices
- **Availability**: 99.99% uptime
- **Security**: Encrypted updates, signed firmware
- **Latency**: < 100ms for telemetry
- **Bandwidth**: Minimize data transfer
- **Reliability**: Zero-downtime updates

### Use Cases

- **Automotive**: Vehicle firmware updates (Tesla, Rivian)
- **Smart Home**: IoT device updates (thermostats, cameras)
- **Industrial IoT**: Factory equipment, sensors
- **Medical Devices**: Remote diagnostics and updates

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  IoT OTA Update Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Devices → MQTT Broker → IoT Core → Event Stream             │
│     ↓                                      ↓                  │
│  Telemetry                        Device Shadow Service      │
│     ↓                                      ↓                  │
│  Time-Series DB                   Update Orchestrator        │
│                                            ↓                  │
│                                    Firmware Repository       │
│                                            ↓                  │
│                                    CDN (Edge Distribution)    │
│                                            ↓                  │
│                                    Devices (Download)         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Event Flow

```
1. Telemetry Flow
   Device → MQTT → IoT Core → Kinesis → Lambda → InfluxDB

2. Update Flow
   Admin → Update Service → Device Shadow → MQTT → Device

3. Rollback Flow
   Monitor → Detect Failure → Rollback Service → Device Shadow → Device
```

---

## Service Architecture

### Core Components

**1. Device Layer**
- Embedded firmware (C/C++)
- MQTT client for communication
- Local update manager
- Health monitoring agent

**2. Gateway Layer (IoT Core)**
- MQTT broker (AWS IoT Core, Azure IoT Hub)
- Device authentication (X.509 certificates)
- Message routing
- Device registry

**3. Platform Layer**
- Device Shadow Service (digital twin)
- Update Orchestrator
- Telemetry Processor
- Analytics Engine

**4. Application Layer**
- Admin Dashboard
- Monitoring and Alerts
- Firmware Management
- Reporting

---

## Technology Stack

### Cloud Services (AWS)
- **IoT Core**: MQTT broker, device management
- **IoT Device Shadow**: Device state management
- **S3**: Firmware storage
- **CloudFront**: CDN for firmware distribution
- **Kinesis**: Real-time telemetry streaming
- **Lambda**: Event processing
- **DynamoDB**: Device metadata, update status
- **InfluxDB**: Time-series telemetry data
- **SNS/SQS**: Notifications and queuing

### Device Stack
- **OS**: FreeRTOS, Linux (Yocto)
- **Protocol**: MQTT, CoAP
- **Security**: TLS 1.3, X.509 certificates
- **OTA Library**: AWS IoT Device SDK

### Monitoring
- **Grafana**: Telemetry dashboards
- **Prometheus**: Metrics collection
- **CloudWatch**: AWS service monitoring
- **PagerDuty**: Alerting

---

## Implementation Details

### 1. Device Firmware (Embedded C)

**MQTT Client and Telemetry**

```c
// device/mqtt_client.c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "aws_iot_mqtt_client.h"
#include "aws_iot_json_utils.h"

#define MQTT_BROKER "a1b2c3d4e5f6g7.iot.us-east-1.amazonaws.com"


// OTA Update Handler
void ota_update_callback(AWS_IoT_Client *client, char *topic, uint16_t topic_len,
                         IoT_Publish_Message_Params *params, void *data) {
    char *payload = (char *)params->payload;

    // Parse update message
    jsmn_parser parser;
    jsmntok_t tokens[128];
    jsmn_init(&parser);
    int token_count = jsmn_parse(&parser, payload, params->payloadLen, tokens, 128);

    // Extract firmware URL and version
    char firmware_url[256];
    char new_version[16];

    // Download firmware from S3/CloudFront
    download_firmware(firmware_url);

    // Verify signature
    if (verify_firmware_signature()) {
        // Apply update
        apply_firmware_update();

        // Report success
        report_update_status("SUCCESS", new_version);
    } else {
        // Report failure
        report_update_status("FAILED", "Signature verification failed");
    }
}

// Subscribe to shadow updates
void subscribe_to_shadow(AWS_IoT_Client *client) {
    aws_iot_mqtt_subscribe(client, SHADOW_TOPIC, strlen(SHADOW_TOPIC),
                           QOS1, ota_update_callback, NULL);
}
```

### 2. Device Shadow Service (Cloud)

**Manage Device State**

```python
# cloud/device_shadow_service.py
import json
import boto3
from datetime import datetime

iot_data = boto3.client('iot-data')
dynamodb = boto3.resource('dynamodb')
devices_table = dynamodb.Table('Devices')

class DeviceShadow:
    def __init__(self, device_id):
        self.device_id = device_id
        self.thing_name = f"vehicle-{device_id}"

    def get_shadow(self):
        """Get current device shadow"""
        response = iot_data.get_thing_shadow(thingName=self.thing_name)
        shadow = json.loads(response['payload'].read())
        return shadow

    def update_shadow(self, desired_state):
        """Update desired state in device shadow"""
        payload = {
            "state": {
                "desired": desired_state
            }
        }

        iot_data.update_thing_shadow(
            thingName=self.thing_name,
            payload=json.dumps(payload)
        )

    def trigger_ota_update(self, firmware_version, firmware_url):
        """Trigger OTA update for device"""
        desired_state = {
            "firmwareVersion": firmware_version,
            "firmwareUrl": firmware_url,
            "updateStatus": "PENDING",
            "updateTimestamp": datetime.utcnow().isoformat()
        }

        self.update_shadow(desired_state)

        # Log update request
        devices_table.update_item(
            Key={'deviceId': self.device_id},
            UpdateExpression='SET updateStatus = :status, targetVersion = :version',
            ExpressionAttributeValues={
                ':status': 'PENDING',
                ':version': firmware_version
            }
        )

# Example usage
shadow = DeviceShadow("12345")
shadow.trigger_ota_update("v2.6.0", "https://cdn.example.com/firmware/v2.6.0.bin")
```

### 3. Update Orchestrator

**Staged Rollout with Canary Deployment**

```python
# cloud/update_orchestrator.py
import boto3
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
devices_table = dynamodb.Table('Devices')
updates_table = dynamodb.Table('Updates')

class UpdateOrchestrator:
    def __init__(self):
        self.iot_data = boto3.client('iot-data')

    def create_update_campaign(self, firmware_version, firmware_url, rollout_config):
        """Create a new OTA update campaign"""
        campaign = {
            'campaignId': f"campaign-{datetime.utcnow().timestamp()}",
            'firmwareVersion': firmware_version,
            'firmwareUrl': firmware_url,
            'status': 'CREATED',
            'rolloutConfig': rollout_config,
            'createdAt': datetime.utcnow().isoformat()
        }

        updates_table.put_item(Item=campaign)
        return campaign

    def execute_staged_rollout(self, campaign_id):
        """Execute staged rollout with canary deployment"""
        campaign = updates_table.get_item(Key={'campaignId': campaign_id})['Item']
        rollout_config = campaign['rolloutConfig']

        # Stage 1: Canary (1% of devices)
        canary_devices = self.select_devices(percentage=1)
        self.deploy_to_devices(canary_devices, campaign)

        # Wait for canary results
        if self.monitor_canary_health(canary_devices, duration_minutes=30):
            # Stage 2: 10% rollout
            stage2_devices = self.select_devices(percentage=10, exclude=canary_devices)
            self.deploy_to_devices(stage2_devices, campaign)

            # Stage 3: 50% rollout
            if self.monitor_health(stage2_devices, duration_minutes=60):
                stage3_devices = self.select_devices(percentage=50, exclude=canary_devices + stage2_devices)
                self.deploy_to_devices(stage3_devices, campaign)

                # Stage 4: 100% rollout
                if self.monitor_health(stage3_devices, duration_minutes=120):
                    remaining_devices = self.select_remaining_devices()
                    self.deploy_to_devices(remaining_devices, campaign)
        else:
            # Canary failed, rollback
            self.rollback_campaign(campaign_id)

    def deploy_to_devices(self, devices, campaign):
        """Deploy update to selected devices"""
        for device in devices:
            shadow = DeviceShadow(device['deviceId'])
            shadow.trigger_ota_update(
                campaign['firmwareVersion'],
                campaign['firmwareUrl']
            )

    def monitor_canary_health(self, devices, duration_minutes):
        """Monitor canary deployment health"""
        # Check success rate, error rate, telemetry anomalies
        success_count = 0
        failure_count = 0

        for device in devices:
            status = self.get_update_status(device['deviceId'])
            if status == 'SUCCESS':
                success_count += 1
            elif status == 'FAILED':
                failure_count += 1

        success_rate = success_count / len(devices)

        # Require 95% success rate to proceed
        return success_rate >= 0.95

    def rollback_campaign(self, campaign_id):
        """Rollback failed update campaign"""
        campaign = updates_table.get_item(Key={'campaignId': campaign_id})['Item']

        # Get all devices with pending/in-progress updates
        affected_devices = self.get_affected_devices(campaign_id)

        # Trigger rollback to previous version
        for device in affected_devices:
            shadow = DeviceShadow(device['deviceId'])
            shadow.trigger_ota_update(
                device['previousVersion'],
                device['previousFirmwareUrl']
            )

        # Update campaign status
        updates_table.update_item(
            Key={'campaignId': campaign_id},
            UpdateExpression='SET #status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': 'ROLLED_BACK'}
        )
```

### 4. Telemetry Processing Pipeline

**Real-Time Telemetry Streaming**

```python
# cloud/telemetry_processor.py
import json
import boto3
from datetime import datetime
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

kinesis = boto3.client('kinesis')
influx_client = InfluxDBClient(url="http://influxdb:8086", token="my-token", org="my-org")
write_api = influx_client.write_api(write_options=SYNCHRONOUS)

def process_telemetry_event(event):
    """Process telemetry from Kinesis stream"""
    for record in event['Records']:
        # Decode Kinesis record
        payload = json.loads(record['kinesis']['data'])

        device_id = payload['deviceId']
        firmware_version = payload['firmwareVersion']
        battery_level = payload['batteryLevel']
        temperature = payload['temperature']
        odometer = payload['odometer']
        timestamp = payload['timestamp']

        # Write to InfluxDB (time-series database)
        point = Point("telemetry") \
            .tag("deviceId", device_id) \
            .tag("firmwareVersion", firmware_version) \
            .field("batteryLevel", battery_level) \
            .field("temperature", temperature) \
            .field("odometer", odometer) \
            .time(timestamp)

        write_api.write(bucket="iot-telemetry", record=point)

        # Check for anomalies
        detect_anomalies(device_id, payload)

def detect_anomalies(device_id, telemetry):
    """Detect telemetry anomalies"""
    # Check battery level
    if telemetry['batteryLevel'] < 20:
        send_alert(device_id, "LOW_BATTERY", f"Battery level: {telemetry['batteryLevel']}%")

    # Check temperature
    if telemetry['temperature'] > 80:
        send_alert(device_id, "HIGH_TEMPERATURE", f"Temperature: {telemetry['temperature']}°C")

def send_alert(device_id, alert_type, message):
    """Send alert via SNS"""
    sns = boto3.client('sns')
    sns.publish(
        TopicArn='arn:aws:sns:us-east-1:123456789012:iot-alerts',
        Subject=f"IoT Alert: {alert_type}",
        Message=json.dumps({
            'deviceId': device_id,
            'alertType': alert_type,
            'message': message,
            'timestamp': datetime.utcnow().isoformat()
        })
    )
```

---

## Security Implementation

### 1. Device Authentication

**X.509 Certificate-Based Authentication**

```python
# cloud/device_provisioning.py
import boto3
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa

iot = boto3.client('iot')

def provision_device(device_id):
    """Provision new IoT device with certificate"""

    # Create certificate and keys
    response = iot.create_keys_and_certificate(setAsActive=True)

    certificate_arn = response['certificateArn']
    certificate_pem = response['certificatePem']
    private_key = response['keyPair']['PrivateKey']
    public_key = response['keyPair']['PublicKey']

    # Create IoT Thing
    iot.create_thing(thingName=f"vehicle-{device_id}")

    # Attach certificate to thing
    iot.attach_thing_principal(
        thingName=f"vehicle-{device_id}",
        principal=certificate_arn
    )

    # Attach policy to certificate
    iot.attach_policy(
        policyName='IoTDevicePolicy',
        target=certificate_arn
    )

    return {
        'deviceId': device_id,
        'certificatePem': certificate_pem,
        'privateKey': private_key,
        'publicKey': public_key
    }

# IoT Policy (least privilege)
iot_policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["iot:Connect"],
            "Resource": ["arn:aws:iot:us-east-1:123456789012:client/${iot:Connection.Thing.ThingName}"]
        },
        {
            "Effect": "Allow",
            "Action": ["iot:Publish"],
            "Resource": [
                "arn:aws:iot:us-east-1:123456789012:topic/telemetry/${iot:Connection.Thing.ThingName}",
                "arn:aws:iot:us-east-1:123456789012:topic/$aws/things/${iot:Connection.Thing.ThingName}/shadow/update"
            ]
        },
        {
            "Effect": "Allow",
            "Action": ["iot:Subscribe", "iot:Receive"],
            "Resource": [
                "arn:aws:iot:us-east-1:123456789012:topicfilter/$aws/things/${iot:Connection.Thing.ThingName}/shadow/update/delta"
            ]
        }
    ]
}
```

### 2. Firmware Signing and Verification

**Code Signing for Firmware**

```python
# cloud/firmware_signing.py
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
import boto3

s3 = boto3.client('s3')

def sign_firmware(firmware_path, private_key_path):
    """Sign firmware binary with private key"""

    # Load private key
    with open(private_key_path, 'rb') as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None
        )

    # Read firmware binary
    with open(firmware_path, 'rb') as f:
        firmware_data = f.read()

    # Sign firmware
    signature = private_key.sign(
        firmware_data,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    # Upload firmware and signature to S3
    s3.put_object(
        Bucket='firmware-bucket',
        Key='firmware/v2.6.0.bin',
        Body=firmware_data
    )

    s3.put_object(
        Bucket='firmware-bucket',
        Key='firmware/v2.6.0.bin.sig',
        Body=signature
    )

    return signature
```

**Device-Side Verification (C)**

```c
// device/firmware_verification.c
#include <mbedtls/pk.h>
#include <mbedtls/sha256.h>

int verify_firmware_signature(const uint8_t *firmware, size_t firmware_len,
                               const uint8_t *signature, size_t sig_len) {
    mbedtls_pk_context pk;
    mbedtls_pk_init(&pk);

    // Load public key (embedded in device)
    int ret = mbedtls_pk_parse_public_key(&pk, public_key_pem, strlen(public_key_pem) + 1);
    if (ret != 0) {
        return -1;
    }

    // Calculate firmware hash
    uint8_t hash[32];
    mbedtls_sha256(firmware, firmware_len, hash, 0);

    // Verify signature
    ret = mbedtls_pk_verify(&pk, MBEDTLS_MD_SHA256,
                            hash, sizeof(hash),
                            signature, sig_len);

    mbedtls_pk_free(&pk);

    return (ret == 0) ? 1 : 0;  // 1 = valid, 0 = invalid
}
```


---

## Bandwidth Optimization

### Delta Updates

**Generate and Apply Delta Patches**

```python
# cloud/delta_generator.py
import bsdiff4

def generate_delta_update(old_firmware_path, new_firmware_path):
    """Generate binary diff between firmware versions"""

    with open(old_firmware_path, 'rb') as f:
        old_firmware = f.read()

    with open(new_firmware_path, 'rb') as f:
        new_firmware = f.read()

    # Generate delta patch
    delta = bsdiff4.diff(old_firmware, new_firmware)

    # Calculate size reduction
    old_size = len(old_firmware)
    new_size = len(new_firmware)
    delta_size = len(delta)

    savings = (1 - delta_size / new_size) * 100

    print(f"Full update: {new_size / 1024:.2f} KB")
    print(f"Delta update: {delta_size / 1024:.2f} KB")
    print(f"Bandwidth savings: {savings:.2f}%")

    return delta

# Example: v2.5.1 → v2.6.0
# Full update: 5.2 MB
# Delta update: 850 KB
# Bandwidth savings: 83.7%
```

**Device-Side Delta Application (C)**

```c
// device/delta_update.c
#include <bspatch.h>

int apply_delta_update(const char *old_firmware_path,
                       const char *delta_path,
                       const char *new_firmware_path) {
    // Apply binary patch
    int ret = bspatch(old_firmware_path, new_firmware_path, delta_path);

    if (ret == 0) {
        // Verify new firmware
        if (verify_firmware_signature()) {
            // Activate new firmware
            activate_firmware(new_firmware_path);
            return 0;
        }
    }

    return -1;
}
```

---

## Monitoring and Observability

### Grafana Dashboard

**Telemetry Visualization**

```python
# cloud/grafana_dashboard.py
import json

dashboard = {
    "dashboard": {
        "title": "IoT Fleet Monitoring",
        "panels": [
            {
                "title": "Active Devices",
                "targets": [{
                    "query": "SELECT count(DISTINCT deviceId) FROM telemetry WHERE time > now() - 5m"
                }]
            },
            {
                "title": "Firmware Version Distribution",
                "targets": [{
                    "query": "SELECT count(*) FROM telemetry GROUP BY firmwareVersion"
                }]
            },
            {
                "title": "Average Battery Level",
                "targets": [{
                    "query": "SELECT mean(batteryLevel) FROM telemetry WHERE time > now() - 1h GROUP BY time(5m)"
                }]
            },
            {
                "title": "Update Success Rate",
                "targets": [{
                    "query": "SELECT count(*) FROM updates WHERE status='SUCCESS' / count(*) * 100"
                }]
            },
            {
                "title": "Device Temperature Heatmap",
                "targets": [{
                    "query": "SELECT mean(temperature) FROM telemetry GROUP BY deviceId, time(10m)"
                }]
            }
        ]
    }
}
```

### CloudWatch Alarms

```yaml
# cloudwatch_alarms.yaml
Alarms:
  HighUpdateFailureRate:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: IoT-HighUpdateFailureRate
      MetricName: UpdateFailureRate
      Namespace: IoT/OTA
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 5  # 5% failure rate
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref AlertTopic

  DeviceOfflineAlert:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: IoT-DeviceOffline
      MetricName: ConnectedDevices
      Namespace: IoT/Fleet
      Statistic: Sum
      Period: 300
      EvaluationPeriods: 1
      Threshold: 9500000  # Alert if < 95% of 10M devices
      ComparisonOperator: LessThanThreshold
      AlarmActions:
        - !Ref AlertTopic
```

---

## Scalability and Performance

### Performance Metrics

**Fleet Scale**
- **Total Devices**: 10 million
- **Concurrent Connections**: 10 million (MQTT persistent connections)
- **Telemetry Rate**: 100 million messages/hour (27,777 msg/sec)
- **Update Throughput**: 100,000 devices/hour

**Latency**
- **Telemetry Ingestion**: < 100ms (device → cloud)
- **Shadow Update**: < 200ms (cloud → device)
- **Firmware Download**: 2-5 minutes (5MB firmware over 4G)

**Bandwidth**
- **Telemetry**: 500 bytes/message × 10M devices × 10 msg/hour = 50 GB/hour
- **Firmware Updates**: 5 MB × 100K devices/hour = 500 TB/hour (full update)
- **Delta Updates**: 850 KB × 100K devices/hour = 85 TB/hour (83% savings)

### Cost Optimization

**Monthly Cost Estimate (10M devices)**

- **IoT Core**: $8,000 (10M connections × $0.08/month + 100M messages × $1/million)
- **Kinesis**: $2,000 (100M records/hour × 730 hours × $0.014/million)
- **InfluxDB (EC2)**: $500 (r5.2xlarge instance)
- **DynamoDB**: $1,000 (10M device records + updates)
- **S3**: $500 (firmware storage + versioning)
- **CloudFront**: $5,000 (500 TB data transfer for updates)
- **Lambda**: $200 (telemetry processing)

**Total**: ~$17,200/month for 10M devices

**Per-Device Cost**: $0.00172/month

---

## Key Takeaways

### Architecture Decisions

1. **MQTT Protocol**: Lightweight, persistent connections, QoS guarantees
2. **Device Shadow**: Decouples device state from cloud, offline support
3. **Staged Rollout**: Canary deployment reduces risk of bad updates
4. **Delta Updates**: 80%+ bandwidth savings for firmware updates
5. **Event-Driven**: Real-time telemetry processing with Kinesis
6. **Time-Series DB**: InfluxDB for efficient telemetry storage and querying

### Trade-offs

**Benefits**
- ✅ Massive scale (10M+ devices)
- ✅ Real-time telemetry and monitoring
- ✅ Safe OTA updates with rollback
- ✅ Bandwidth optimization (delta updates)
- ✅ Offline device support (shadow)
- ✅ Low per-device cost ($0.00172/month)

**Challenges**
- ❌ Complex orchestration (staged rollout)
- ❌ Network reliability (4G/5G connectivity)
- ❌ Security complexity (certificate management)
- ❌ Debugging distributed system
- ❌ Firmware compatibility testing

### Performance Metrics

**Before Optimization**
- Full firmware updates: 5 MB per device
- Bandwidth cost: $10,000/month (500 TB)
- Update time: 10 minutes per device

**After Optimization**
- Delta updates: 850 KB per device
- Bandwidth cost: $1,700/month (85 TB)
- Update time: 2 minutes per device

### Lessons Learned

1. **Use delta updates**: 80%+ bandwidth savings for firmware
2. **Implement canary deployments**: Catch bad updates early
3. **Monitor telemetry anomalies**: Detect issues before they escalate
4. **Use device shadows**: Enable offline device support
5. **Optimize MQTT QoS**: Balance reliability vs. bandwidth
6. **Implement rollback**: Critical for production safety
7. **Use CloudFront**: Reduce latency and cost for firmware distribution

---

## Real-World Example: Tesla OTA Updates

### Tesla's Approach

**Fleet Size**: 5+ million vehicles worldwide

**Update Frequency**: Monthly feature updates, weekly bug fixes

**Update Types**:
- **Autopilot improvements**: Neural network model updates
- **Battery management**: Optimize range and charging
- **Infotainment**: UI improvements, new features
- **Safety**: Critical security patches

**Rollout Strategy**:
1. **Internal testing**: Tesla employees (1,000 vehicles)
2. **Early access**: Opt-in beta testers (10,000 vehicles)
3. **Staged rollout**: 1% → 10% → 50% → 100%
4. **Monitoring**: Real-time telemetry, crash reports
5. **Rollback**: Automatic if failure rate > 5%

**Key Metrics**:
- **Update success rate**: 99.5%
- **Average download time**: 25 minutes (over WiFi)
- **Bandwidth per update**: 2-4 GB (full update), 200-500 MB (delta)
- **Fleet update time**: 2-4 weeks (100% rollout)

---

## References

- **AWS IoT Core**: Managed MQTT broker and device management
- **MQTT Protocol**: Lightweight messaging protocol for IoT
- **Device Shadow**: AWS IoT device state management
- **InfluxDB**: Time-series database for telemetry
- **bsdiff/bspatch**: Binary diff/patch for delta updates
- **Tesla OTA**: Real-world example of large-scale IoT updates

---

**Total Lines**: 750+
