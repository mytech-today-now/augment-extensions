# Industry-Specific Architectures

## Overview

This document covers specialized architectural patterns for industry-specific domains including IoT, AI/ML, blockchain, and edge computing systems.

---

## Knowledge

### IoT (Internet of Things) Architecture

**Core Components**
- **Device Layer**: Sensors, actuators, embedded systems
- **Gateway Layer**: Protocol translation, data aggregation, edge processing
- **Platform Layer**: Device management, data ingestion, analytics
- **Application Layer**: User interfaces, business logic, integrations

**Communication Protocols**
- MQTT (Message Queuing Telemetry Transport) - lightweight pub/sub
- CoAP (Constrained Application Protocol) - RESTful for constrained devices
- AMQP (Advanced Message Queuing Protocol) - reliable messaging
- HTTP/HTTPS - web-based communication

**Key Patterns**
- **Device Shadow**: Cloud representation of device state
- **Command and Control**: Remote device management
- **Telemetry Streaming**: Real-time data collection
- **Firmware Over-The-Air (FOTA)**: Remote updates

### AI/ML Architecture

**Training Pipeline**
- Data collection and labeling
- Feature engineering
- Model training and validation
- Hyperparameter tuning
- Model versioning and registry

**Inference Pipeline**
- Model serving (batch vs. real-time)
- A/B testing and canary deployments
- Model monitoring and drift detection
- Feedback loops for continuous learning

**MLOps Components**
- **Data Versioning**: DVC, Delta Lake
- **Experiment Tracking**: MLflow, Weights & Biases
- **Model Registry**: Centralized model storage
- **Feature Store**: Reusable feature definitions
- **Monitoring**: Performance, drift, bias detection

**Deployment Patterns**
- **Embedded Models**: On-device inference (mobile, edge)
- **Model as a Service**: REST API endpoints
- **Batch Prediction**: Scheduled inference jobs
- **Stream Processing**: Real-time predictions on event streams

### Blockchain Architecture

**Core Components**
- **Nodes**: Full nodes, light nodes, validator nodes
- **Consensus Mechanism**: PoW, PoS, PBFT, Raft
- **Smart Contracts**: Self-executing code on blockchain
- **Distributed Ledger**: Immutable transaction history

**Architecture Patterns**
- **Public Blockchain**: Permissionless, fully decentralized (Bitcoin, Ethereum)
- **Private Blockchain**: Permissioned, controlled access (Hyperledger Fabric)
- **Consortium Blockchain**: Semi-decentralized, multiple organizations
- **Hybrid Blockchain**: Combination of public and private

**Design Considerations**
- Immutability vs. data privacy (GDPR compliance)
- Transaction throughput and latency
- Smart contract security and auditing
- Gas optimization (for Ethereum-based systems)
- Off-chain storage for large data

### Edge Computing Architecture

**Edge Hierarchy**
- **Far Edge**: Devices and sensors (IoT endpoints)
- **Near Edge**: Gateways and local servers
- **Regional Edge**: Edge data centers
- **Cloud**: Centralized cloud infrastructure

**Edge Patterns**
- **Data Filtering**: Process and filter at edge, send aggregates to cloud
- **Local Processing**: Real-time analytics at edge
- **Caching**: Store frequently accessed data at edge
- **Offline Operation**: Continue functioning without cloud connectivity

**Use Cases**
- Autonomous vehicles (low-latency decision making)
- Industrial IoT (real-time monitoring and control)
- Retail (in-store analytics and personalization)
- Healthcare (patient monitoring, medical imaging)
- Smart cities (traffic management, surveillance)

---

## Skills

### Designing IoT Systems

**Device Management**
```typescript
// Device shadow pattern
interface DeviceShadow {
  reported: DeviceState;  // Actual device state
  desired: DeviceState;   // Target device state
  metadata: {
    timestamp: number;
    version: number;
  };
}

class IoTDeviceManager {
  async updateDesiredState(deviceId: string, state: Partial<DeviceState>) {
    await this.shadowService.updateDesired(deviceId, state);
    await this.publishCommand(deviceId, 'sync');
  }

  async handleReportedState(deviceId: string, state: DeviceState) {
    const shadow = await this.shadowService.get(deviceId);
    const delta = this.calculateDelta(shadow.desired, state);
    
    if (delta) {
      await this.publishCommand(deviceId, 'update', delta);
    }
  }
}
```

**MQTT Communication**
```typescript
// MQTT pub/sub for IoT
import mqtt from 'mqtt';

class IoTCommunication {
  private client: mqtt.MqttClient;

  connect(brokerUrl: string) {
    this.client = mqtt.connect(brokerUrl, {
      clientId: `device_${Date.now()}`,
      clean: true,
      qos: 1,  // At least once delivery
      retain: false
    });

    this.client.on('connect', () => {
      this.client.subscribe('devices/+/commands', { qos: 1 });
    });
  }

  publishTelemetry(deviceId: string, data: any) {
    const topic = `devices/${deviceId}/telemetry`;
    this.client.publish(topic, JSON.stringify(data), { qos: 1 });
  }
}
```

### Implementing ML Pipelines

**Model Serving**
```python
# FastAPI model serving
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()
model = joblib.load('model.pkl')

class PredictionRequest(BaseModel):
    features: list[float]

class PredictionResponse(BaseModel):
    prediction: float
    confidence: float
    model_version: str

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    features = np.array(request.features).reshape(1, -1)
    prediction = model.predict(features)[0]
    confidence = model.predict_proba(features).max()

    return PredictionResponse(
        prediction=prediction,
        confidence=confidence,
        model_version="v1.2.0"
    )
```

**Feature Store Pattern**
```python
# Feature store for ML
from datetime import datetime
from typing import Dict, List

class FeatureStore:
    def __init__(self, storage):
        self.storage = storage

    def get_features(self, entity_id: str, feature_names: List[str]) -> Dict:
        """Retrieve features for online inference"""
        features = {}
        for name in feature_names:
            key = f"feature:{name}:{entity_id}"
            features[name] = self.storage.get(key)
        return features

    def write_features(self, entity_id: str, features: Dict, timestamp: datetime):
        """Write features for both online and offline use"""
        # Online store (Redis)
        for name, value in features.items():
            key = f"feature:{name}:{entity_id}"
            self.storage.set(key, value)

        # Offline store (Data Lake)
        self.storage.append_to_parquet(
            f"features/{name}/date={timestamp.date()}",
            {"entity_id": entity_id, **features, "timestamp": timestamp}
        )
```

### Building Blockchain Applications

**Smart Contract Pattern**
```solidity
// Solidity smart contract example
pragma solidity ^0.8.0;

contract SupplyChain {
    enum State { Created, InTransit, Delivered, Verified }

    struct Product {
        uint256 id;
        string name;
        address manufacturer;
        address currentOwner;
        State state;
        uint256 timestamp;
    }

    mapping(uint256 => Product) public products;
    mapping(uint256 => address[]) public productHistory;

    event ProductCreated(uint256 indexed productId, address manufacturer);
    event ProductTransferred(uint256 indexed productId, address from, address to);
    event ProductStateChanged(uint256 indexed productId, State newState);

    function createProduct(uint256 _id, string memory _name) public {
        require(products[_id].id == 0, "Product already exists");

        products[_id] = Product({
            id: _id,
            name: _name,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            state: State.Created,
            timestamp: block.timestamp
        });

        productHistory[_id].push(msg.sender);
        emit ProductCreated(_id, msg.sender);
    }

    function transferProduct(uint256 _id, address _to) public {
        Product storage product = products[_id];
        require(product.currentOwner == msg.sender, "Not the owner");
        require(_to != address(0), "Invalid address");

        address previousOwner = product.currentOwner;
        product.currentOwner = _to;
        product.timestamp = block.timestamp;

        productHistory[_id].push(_to);
        emit ProductTransferred(_id, previousOwner, _to);
    }
}
```

### Designing Edge Computing Systems

**Edge Processing Pattern**
```typescript
// Edge data processing with fallback to cloud
class EdgeProcessor {
  private cloudEndpoint: string;
  private localCache: Map<string, any>;

  async processData(sensorData: SensorReading): Promise<ProcessedData> {
    try {
      // Try local processing first
      const result = await this.processLocally(sensorData);

      // Cache result
      this.localCache.set(sensorData.id, result);

      // Async sync to cloud (fire and forget)
      this.syncToCloud(result).catch(err =>
        console.error('Cloud sync failed:', err)
      );

      return result;
    } catch (error) {
      // Fallback to cloud if edge processing fails
      return await this.processInCloud(sensorData);
    }
  }

  private async processLocally(data: SensorReading): Promise<ProcessedData> {
    // Local ML inference or rule-based processing
    const prediction = await this.localModel.predict(data.values);

    return {
      id: data.id,
      timestamp: Date.now(),
      prediction,
      processedAt: 'edge',
      confidence: prediction.confidence
    };
  }

  private async processInCloud(data: SensorReading): Promise<ProcessedData> {
    const response = await fetch(`${this.cloudEndpoint}/process`, {
      method: 'POST',
      body: JSON.stringify(data),
      timeout: 5000  // 5 second timeout
    });

    return response.json();
  }
}
```

---

## Examples

### Example 1: Tesla OTA Update Architecture

**System Overview**
- Fleet of vehicles with embedded systems
- Over-the-air firmware updates
- Real-time telemetry collection
- Edge processing for autonomous driving

**Architecture Components**

1. **Vehicle Edge Layer**
   - Autopilot computer (local inference)
   - Sensor fusion (cameras, radar, ultrasonic)
   - Local data logging and filtering
   - Offline operation capability

2. **Gateway Layer**
   - Cellular/WiFi connectivity
   - Data compression and batching
   - Update download and verification
   - Rollback capability

3. **Cloud Platform**
   - Fleet management dashboard
   - Update distribution (CDN)
   - Telemetry analytics
   - ML model training pipeline

4. **Update Process**
   ```
   1. Build firmware → Sign with private key
   2. Upload to CDN → Staged rollout (1% → 10% → 100%)
   3. Vehicle checks for updates → Downloads in background
   4. Verify signature → Install during parked state
   5. Rollback if issues detected → Report telemetry
   ```

**Key Design Decisions**
- **Incremental rollout**: Minimize risk of fleet-wide issues
- **Signature verification**: Prevent unauthorized firmware
- **Delta updates**: Reduce bandwidth (only changed files)
- **Rollback mechanism**: Automatic revert on boot failure
- **Telemetry feedback**: Monitor update success rate

### Example 2: E-commerce Recommendation System (AI/ML)

**Architecture**

1. **Data Collection**
   - User behavior tracking (clicks, views, purchases)
   - Product catalog and metadata
   - Real-time event streaming (Kafka)

2. **Feature Engineering**
   - User features: demographics, purchase history, browsing patterns
   - Product features: category, price, ratings, popularity
   - Context features: time of day, device, location
   - Feature store (Redis for online, S3 for offline)

3. **Model Training**
   - Collaborative filtering (user-item interactions)
   - Content-based filtering (product attributes)
   - Deep learning (neural collaborative filtering)
   - A/B testing framework

4. **Model Serving**
   - Real-time API (< 100ms latency)
   - Batch predictions (daily email campaigns)
   - Personalized ranking
   - Fallback to popularity-based recommendations

**Implementation**
```python
# Recommendation service
class RecommendationService:
    def __init__(self, feature_store, model_registry):
        self.feature_store = feature_store
        self.model = model_registry.get_model('recommendation', version='latest')

    async def get_recommendations(
        self,
        user_id: str,
        context: dict,
        num_items: int = 10
    ) -> List[str]:
        # Get user features from feature store
        user_features = await self.feature_store.get_features(
            entity_id=user_id,
            feature_names=['age', 'gender', 'purchase_history', 'browsing_history']
        )

        # Get candidate products
        candidates = await self.get_candidate_products(user_id, context)

        # Score candidates
        scores = await self.model.predict({
            'user_features': user_features,
            'product_features': [c.features for c in candidates],
            'context': context
        })

        # Rank and return top N
        ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
        return [product.id for product, score in ranked[:num_items]]
```

### Example 3: Supply Chain Blockchain

**Use Case**: Track pharmaceutical products from manufacturer to patient

**Architecture**

1. **Blockchain Network**
   - Hyperledger Fabric (permissioned blockchain)
   - Participants: manufacturers, distributors, pharmacies, regulators
   - Channels for privacy (manufacturer ↔ distributor separate from distributor ↔ pharmacy)

2. **Smart Contracts (Chaincode)**
   - Product registration
   - Ownership transfer
   - Temperature monitoring (cold chain)
   - Authenticity verification

3. **Off-Chain Storage**
   - IPFS for product images and documents
   - Traditional database for query optimization
   - Blockchain stores only hashes and critical data

4. **Integration Layer**
   - REST API for legacy systems
   - Event listeners for real-time notifications
   - Mobile app for scanning and verification

**Benefits**
- Immutable audit trail
- Counterfeit prevention
- Regulatory compliance
- Supply chain transparency

---

## Understanding

### When to Use Industry-Specific Architectures

**IoT Architecture**
- ✅ Use when: Massive device fleets, real-time data, edge processing needed
- ❌ Avoid when: Simple client-server sufficient, no device management needed

**AI/ML Architecture**
- ✅ Use when: Data-driven decisions, personalization, prediction needed
- ❌ Avoid when: Rule-based logic sufficient, insufficient training data

**Blockchain Architecture**
- ✅ Use when: Multi-party trust needed, immutability required, decentralization valued
- ❌ Avoid when: Single authority acceptable, high throughput critical (>10k TPS)

**Edge Computing**
- ✅ Use when: Low latency critical, bandwidth limited, offline operation needed
- ❌ Avoid when: Cloud latency acceptable, always-connected, centralized processing preferred

### Trade-offs

| Architecture | Pros | Cons |
|--------------|------|------|
| **IoT** | Scalability, real-time data | Complexity, security challenges |
| **AI/ML** | Automation, personalization | Data requirements, model drift |
| **Blockchain** | Trust, immutability | Low throughput, high cost |
| **Edge** | Low latency, offline capability | Distributed complexity, limited resources |

### Best Practices

**IoT**
- Implement device authentication and encryption
- Use MQTT QoS levels appropriately (0, 1, 2)
- Design for intermittent connectivity
- Implement device shadow for state management
- Plan for firmware updates from day one

**AI/ML**
- Version all data, features, and models
- Monitor for model drift and bias
- Implement A/B testing for model changes
- Use feature stores for consistency
- Plan for model retraining pipeline

**Blockchain**
- Minimize on-chain data (use hashes)
- Optimize gas usage (for public blockchains)
- Implement proper key management
- Audit smart contracts thoroughly
- Consider off-chain scaling solutions (Layer 2)

**Edge Computing**
- Design for graceful degradation
- Implement local caching strategies
- Use delta sync for bandwidth efficiency
- Monitor edge node health
- Plan for remote management and updates

---

## References

- **IoT**: AWS IoT Core, Azure IoT Hub, Google Cloud IoT
- **AI/ML**: MLflow, Kubeflow, SageMaker, Vertex AI
- **Blockchain**: Hyperledger Fabric, Ethereum, Solidity documentation
- **Edge**: AWS Greengrass, Azure IoT Edge, KubeEdge
- **Standards**: ISO/IEC 30141 (IoT Reference Architecture)

