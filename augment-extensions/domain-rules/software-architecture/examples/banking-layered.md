# Banking Application Architecture Example

## Overview

This document provides a comprehensive example of a banking application built with layered architecture, focusing on security, compliance, and data integrity.

---

## System Context

### Business Requirements

**Functional Requirements**
- Account management (checking, savings, credit)
- Fund transfers (internal and external)
- Transaction history and statements
- Bill payments and recurring payments
- Loan applications and management
- Customer authentication and authorization
- Fraud detection and alerts
- Regulatory reporting

**Non-Functional Requirements**
- **Security**: Multi-factor authentication, encryption at rest and in transit
- **Compliance**: SOX, PCI DSS, GDPR, Basel III
- **Availability**: 99.95% uptime (4.38 hours downtime/year)
- **Data Integrity**: ACID transactions, zero data loss
- **Auditability**: Complete audit trail for all transactions
- **Performance**: Transaction processing < 500ms

### Scale Metrics
- 500,000 active customers
- 1 million accounts
- 100,000 transactions per day
- $10 billion in assets under management
- 24/7 operation with global presence

---

## Architecture Overview

### Layered Architecture Pattern

**Four-Tier Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│         Web UI, Mobile Apps, ATM Interface, APIs             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│    Use Cases, Orchestration, Transaction Coordination        │
│    (Account Service, Transfer Service, Loan Service)         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
│    Business Logic, Domain Models, Business Rules             │
│    (Account, Transaction, Customer, Loan)                    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│    Database, External Services, Messaging, Security          │
│    (PostgreSQL, Redis, Kafka, SWIFT, ACH)                    │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**1. Presentation Layer**
- Web application (React)
- Mobile apps (iOS, Android)
- ATM interface
- Admin portal
- RESTful APIs
- Input validation
- Session management

**2. Application Layer**
- Account management use cases
- Transfer orchestration
- Loan processing workflows
- Transaction coordination
- Event publishing
- External service integration

**3. Domain Layer**
- Account entity and business rules
- Transaction processing logic
- Interest calculation
- Overdraft protection
- Fraud detection rules
- Loan approval logic

**4. Infrastructure Layer**
- PostgreSQL database (ACID compliance)
- Redis cache (session, rate limiting)
- Kafka message broker (event streaming)
- SWIFT integration (international transfers)
- ACH integration (domestic transfers)
- HSM (Hardware Security Module) for encryption

---

## Technology Stack

### Presentation Layer
- **Web**: React, TypeScript, Material-UI
- **Mobile**: React Native
- **API**: Node.js, Express, GraphQL

### Application Layer
- **Language**: Java 17
- **Framework**: Spring Boot 3.x
- **Security**: Spring Security, OAuth 2.0

### Domain Layer
- **Language**: Java 17
- **Patterns**: Domain-Driven Design (DDD)
- **Validation**: Bean Validation (JSR 380)

### Infrastructure Layer
- **Database**: PostgreSQL 15 (primary), PostgreSQL replicas (read)
- **Cache**: Redis Cluster
- **Message Broker**: Apache Kafka
- **Search**: Elasticsearch (transaction search)
- **File Storage**: AWS S3 (statements, documents)

### Security & Compliance
- **Authentication**: OAuth 2.0, OpenID Connect
- **MFA**: TOTP, SMS, Biometric
- **Encryption**: AES-256 (at rest), TLS 1.3 (in transit)
- **HSM**: Thales Luna HSM
- **Audit**: Splunk, custom audit tables

### Infrastructure
- **Hosting**: AWS (multi-region)
- **Container**: Docker, Kubernetes (EKS)
- **Load Balancer**: AWS ALB
- **CDN**: CloudFront
- **Monitoring**: Datadog, CloudWatch

---

## Implementation Details

### 1. Domain Layer - Account Entity

**Rich Domain Model**

```java
// src/main/java/com/bank/domain/account/Account.java
package com.bank.domain.account;

import com.bank.domain.common.Money;
import com.bank.domain.transaction.Transaction;
import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Account {
    @NotNull
    private final AccountId id;

    @NotNull
    private final CustomerId customerId;

    @NotNull
    private final AccountType type;

    @NotNull
    private Money balance;

    @NotNull
    private AccountStatus status;

    private Money overdraftLimit;

    @NotNull
    private final LocalDateTime createdAt;

    private LocalDateTime closedAt;

    private final List<Transaction> transactions = new ArrayList<>();

    // Business logic methods
    public void deposit(Money amount, String description) {
        validateAccountActive();
        validatePositiveAmount(amount);

        this.balance = this.balance.add(amount);

        Transaction transaction = Transaction.createDeposit(
            this.id,
            amount,
            description,
            LocalDateTime.now()
        );

        this.transactions.add(transaction);
    }

    public void withdraw(Money amount, String description) {
        validateAccountActive();
        validatePositiveAmount(amount);
        validateSufficientFunds(amount);

        this.balance = this.balance.subtract(amount);

        Transaction transaction = Transaction.createWithdrawal(
            this.id,
            amount,
            description,
            LocalDateTime.now()
        );

        this.transactions.add(transaction);
    }

    public void transfer(Account targetAccount, Money amount, String description) {
        validateAccountActive();
        targetAccount.validateAccountActive();
        validatePositiveAmount(amount);
        validateSufficientFunds(amount);
        validateDifferentAccounts(targetAccount);

        this.withdraw(amount, "Transfer to " + targetAccount.getId());
        targetAccount.deposit(amount, "Transfer from " + this.getId());
    }

    public Money calculateInterest(BigDecimal annualRate, int days) {
        if (this.type != AccountType.SAVINGS) {
            throw new IllegalStateException("Interest only applies to savings accounts");
        }

        BigDecimal dailyRate = annualRate.divide(BigDecimal.valueOf(365), 10, BigDecimal.ROUND_HALF_UP);
        BigDecimal interest = this.balance.getAmount()
            .multiply(dailyRate)
            .multiply(BigDecimal.valueOf(days));

        return new Money(interest, this.balance.getCurrency());
    }

    // Validation methods
    private void validateAccountActive() {
        if (this.status != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException("Account " + this.id + " is not active");
        }
    }

    private void validatePositiveAmount(Money amount) {
        if (amount.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
    }

    private void validateSufficientFunds(Money amount) {
        Money availableBalance = this.balance.add(this.overdraftLimit != null ? this.overdraftLimit : Money.ZERO);

        if (availableBalance.compareTo(amount) < 0) {
            throw new InsufficientFundsException(
                "Insufficient funds. Available: " + availableBalance + ", Required: " + amount
            );
        }
    }

    private void validateDifferentAccounts(Account other) {
        if (this.id.equals(other.id)) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }
    }

    // Getters
    public AccountId getId() { return id; }
    public Money getBalance() { return balance; }
    public AccountStatus getStatus() { return status; }
}

// Value Objects
public record AccountId(String value) {
    public AccountId {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Account ID cannot be null or blank");
        }
    }
}

public record Money(BigDecimal amount, Currency currency) implements Comparable<Money> {
    public static final Money ZERO = new Money(BigDecimal.ZERO, Currency.USD);

    public Money add(Money other) {
        validateSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money subtract(Money other) {
        validateSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }

    @Override
    public int compareTo(Money other) {
        validateSameCurrency(other);
        return this.amount.compareTo(other.amount);
    }

    private void validateSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Cannot operate on different currencies");
        }
    }
}

public enum AccountType {
    CHECKING, SAVINGS, CREDIT, LOAN
}

public enum AccountStatus {
    ACTIVE, SUSPENDED, CLOSED, FROZEN
}
```

### 2. Application Layer - Transfer Service

**Use Case Orchestration**

```java
// src/main/java/com/bank/application/transfer/TransferService.java
package com.bank.application.transfer;

import com.bank.domain.account.*;
import com.bank.domain.common.Money;
import com.bank.infrastructure.events.EventPublisher;
import com.bank.infrastructure.fraud.FraudDetectionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class TransferService {
    private final AccountRepository accountRepository;
    private final TransferRepository transferRepository;
    private final FraudDetectionService fraudDetection;
    private final EventPublisher eventPublisher;
    private final AuditLogger auditLogger;

    public TransferService(
        AccountRepository accountRepository,
        TransferRepository transferRepository,
        FraudDetectionService fraudDetection,
        EventPublisher eventPublisher,
        AuditLogger auditLogger
    ) {
        this.accountRepository = accountRepository;
        this.transferRepository = transferRepository;
        this.fraudDetection = fraudDetection;
        this.eventPublisher = eventPublisher;
        this.auditLogger = auditLogger;
    }

    @Transactional
    public TransferResult executeTransfer(TransferRequest request) {
        // 1. Validate request
        validateTransferRequest(request);

        // 2. Load accounts
        Account sourceAccount = accountRepository.findById(request.sourceAccountId())
            .orElseThrow(() -> new AccountNotFoundException(request.sourceAccountId()));

        Account targetAccount = accountRepository.findById(request.targetAccountId())
            .orElseThrow(() -> new AccountNotFoundException(request.targetAccountId()));

        // 3. Fraud detection
        FraudCheckResult fraudCheck = fraudDetection.checkTransfer(
            sourceAccount,
            targetAccount,
            request.amount()
        );

        if (fraudCheck.isSuspicious()) {
            auditLogger.logSuspiciousActivity(request, fraudCheck);
            throw new SuspiciousActivityException("Transfer flagged for review");
        }

        // 4. Execute transfer (domain logic)
        sourceAccount.transfer(targetAccount, request.amount(), request.description());

        // 5. Save accounts
        accountRepository.save(sourceAccount);
        accountRepository.save(targetAccount);

        // 6. Create transfer record
        Transfer transfer = Transfer.create(
            sourceAccount.getId(),
            targetAccount.getId(),
            request.amount(),
            request.description(),
            TransferStatus.COMPLETED,
            LocalDateTime.now()
        );
        transferRepository.save(transfer);

        // 7. Publish event
        eventPublisher.publish(new TransferCompletedEvent(
            transfer.getId(),
            sourceAccount.getId(),
            targetAccount.getId(),
            request.amount(),
            LocalDateTime.now()
        ));

        // 8. Audit log
        auditLogger.logTransfer(request, transfer, "SUCCESS");

        return new TransferResult(transfer.getId(), TransferStatus.COMPLETED);
    }

    private void validateTransferRequest(TransferRequest request) {
        if (request.amount().getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Transfer amount must be positive");
        }

        if (request.sourceAccountId().equals(request.targetAccountId())) {
            throw new IllegalArgumentException("Source and target accounts must be different");
        }
    }
}
```



### 3. Infrastructure Layer - Repository Implementation

**Data Access with JPA**

```java
// src/main/java/com/bank/infrastructure/persistence/JpaAccountRepository.java
package com.bank.infrastructure.persistence;

import com.bank.domain.account.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import javax.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface JpaAccountRepository extends JpaRepository<AccountEntity, String>, AccountRepository {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM AccountEntity a WHERE a.id = :id")
    Optional<AccountEntity> findByIdForUpdate(String id);

    @Query("SELECT a FROM AccountEntity a WHERE a.customerId = :customerId AND a.status = 'ACTIVE'")
    List<AccountEntity> findActiveAccountsByCustomer(String customerId);
}

// Domain Repository Interface
public interface AccountRepository {
    Optional<Account> findById(AccountId id);
    Account save(Account account);
    void delete(Account account);
    List<Account> findByCustomerId(CustomerId customerId);
}

// Repository Adapter
@Component
public class AccountRepositoryAdapter implements AccountRepository {
    private final JpaAccountRepository jpaRepository;
    private final AccountMapper mapper;

    @Override
    public Optional<Account> findById(AccountId id) {
        return jpaRepository.findByIdForUpdate(id.value())
            .map(mapper::toDomain);
    }

    @Override
    public Account save(Account account) {
        AccountEntity entity = mapper.toEntity(account);
        AccountEntity saved = jpaRepository.save(entity);
        return mapper.toDomain(saved);
    }
}

// JPA Entity
@Entity
@Table(name = "accounts")
public class AccountEntity {
    @Id
    private String id;

    @Column(name = "customer_id", nullable = false)
    private String customerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus status;

    @Column(name = "overdraft_limit", precision = 19, scale = 4)
    private BigDecimal overdraftLimit;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Version
    private Long version; // Optimistic locking

    // Getters and setters
}
```

### 4. Presentation Layer - REST API

**Account Controller**

```java
// src/main/java/com/bank/presentation/api/AccountController.java
package com.bank.presentation.api;

import com.bank.application.account.*;
import com.bank.domain.common.Money;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {
    private final AccountService accountService;
    private final TransferService transferService;

    @GetMapping("/{accountId}")
    @PreAuthorize("hasPermission(#accountId, 'Account', 'READ')")
    public ResponseEntity<AccountDto> getAccount(@PathVariable String accountId) {
        Account account = accountService.getAccount(new AccountId(accountId));
        return ResponseEntity.ok(AccountDto.from(account));
    }

    @GetMapping("/{accountId}/balance")
    @PreAuthorize("hasPermission(#accountId, 'Account', 'READ')")
    public ResponseEntity<BalanceDto> getBalance(@PathVariable String accountId) {
        Money balance = accountService.getBalance(new AccountId(accountId));
        return ResponseEntity.ok(new BalanceDto(balance.getAmount(), balance.getCurrency()));
    }

    @PostMapping("/{accountId}/deposit")
    @PreAuthorize("hasPermission(#accountId, 'Account', 'WRITE')")
    public ResponseEntity<TransactionDto> deposit(
        @PathVariable String accountId,
        @Valid @RequestBody DepositRequest request
    ) {
        Transaction transaction = accountService.deposit(
            new AccountId(accountId),
            new Money(request.amount(), Currency.valueOf(request.currency())),
            request.description()
        );

        return ResponseEntity.ok(TransactionDto.from(transaction));
    }

    @PostMapping("/{accountId}/withdraw")
    @PreAuthorize("hasPermission(#accountId, 'Account', 'WRITE')")
    public ResponseEntity<TransactionDto> withdraw(
        @PathVariable String accountId,
        @Valid @RequestBody WithdrawRequest request
    ) {
        Transaction transaction = accountService.withdraw(
            new AccountId(accountId),
            new Money(request.amount(), Currency.valueOf(request.currency())),
            request.description()
        );

        return ResponseEntity.ok(TransactionDto.from(transaction));
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasPermission(#request.sourceAccountId, 'Account', 'WRITE')")
    public ResponseEntity<TransferDto> transfer(@Valid @RequestBody TransferRequest request) {
        TransferResult result = transferService.executeTransfer(request);
        return ResponseEntity.ok(TransferDto.from(result));
    }

    @GetMapping("/{accountId}/transactions")
    @PreAuthorize("hasPermission(#accountId, 'Account', 'READ')")
    public ResponseEntity<Page<TransactionDto>> getTransactions(
        @PathVariable String accountId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Page<Transaction> transactions = accountService.getTransactions(
            new AccountId(accountId),
            PageRequest.of(page, size)
        );

        return ResponseEntity.ok(transactions.map(TransactionDto::from));
    }
}

// DTOs
public record AccountDto(
    String id,
    String customerId,
    String type,
    BigDecimal balance,
    String currency,
    String status,
    LocalDateTime createdAt
) {
    public static AccountDto from(Account account) {
        return new AccountDto(
            account.getId().value(),
            account.getCustomerId().value(),
            account.getType().name(),
            account.getBalance().getAmount(),
            account.getBalance().getCurrency().name(),
            account.getStatus().name(),
            account.getCreatedAt()
        );
    }
}

public record DepositRequest(
    @NotNull @Positive BigDecimal amount,
    @NotNull String currency,
    @NotBlank String description
) {}

public record WithdrawRequest(
    @NotNull @Positive BigDecimal amount,
    @NotNull String currency,
    @NotBlank String description
) {}
```

---

## Security Implementation

### 1. Authentication & Authorization

**Spring Security Configuration**

```java
// src/main/java/com/bank/infrastructure/security/SecurityConfig.java
package com.bank.infrastructure.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/api/v1/accounts/**").authenticated()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer()
                .jwt()
                .jwtAuthenticationConverter(jwtAuthenticationConverter());

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }
}
```

**Custom Permission Evaluator**

```java
// src/main/java/com/bank/infrastructure/security/AccountPermissionEvaluator.java
@Component
public class AccountPermissionEvaluator implements PermissionEvaluator {
    private final AccountRepository accountRepository;

    @Override
    public boolean hasPermission(
        Authentication authentication,
        Object targetDomainObject,
        Object permission
    ) {
        if (authentication == null || !(targetDomainObject instanceof String)) {
            return false;
        }

        String accountId = (String) targetDomainObject;
        String userId = authentication.getName();

        // Check if user owns the account
        Account account = accountRepository.findById(new AccountId(accountId))
            .orElseThrow(() -> new AccountNotFoundException(accountId));

        return account.getCustomerId().value().equals(userId) ||
               authentication.getAuthorities().stream()
                   .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
```


### 2. Audit Logging

**Comprehensive Audit Trail**

```java
// src/main/java/com/bank/infrastructure/audit/AuditLogger.java
@Component
public class AuditLogger {
    private final AuditRepository auditRepository;
    private final KafkaTemplate<String, AuditEvent> kafkaTemplate;

    public void logTransfer(TransferRequest request, Transfer transfer, String status) {
        AuditEvent event = AuditEvent.builder()
            .eventType("TRANSFER")
            .userId(SecurityContextHolder.getContext().getAuthentication().getName())
            .entityType("Transfer")
            .entityId(transfer.getId().value())
            .action("EXECUTE")
            .status(status)
            .details(Map.of(
                "sourceAccountId", request.sourceAccountId(),
                "targetAccountId", request.targetAccountId(),
                "amount", request.amount().toString(),
                "description", request.description()
            ))
            .ipAddress(getClientIpAddress())
            .timestamp(LocalDateTime.now())
            .build();

        // Store in database
        auditRepository.save(event);

        // Publish to Kafka for real-time monitoring
        kafkaTemplate.send("audit-events", event);
    }

    public void logSuspiciousActivity(TransferRequest request, FraudCheckResult fraudCheck) {
        AuditEvent event = AuditEvent.builder()
            .eventType("FRAUD_ALERT")
            .userId(SecurityContextHolder.getContext().getAuthentication().getName())
            .action("TRANSFER_BLOCKED")
            .status("SUSPICIOUS")
            .details(Map.of(
                "reason", fraudCheck.getReason(),
                "riskScore", fraudCheck.getRiskScore(),
                "amount", request.amount().toString()
            ))
            .timestamp(LocalDateTime.now())
            .build();

        auditRepository.save(event);
        kafkaTemplate.send("fraud-alerts", event);
    }
}
```

### 3. Data Encryption

**Encryption at Rest and in Transit**

```java
// src/main/java/com/bank/infrastructure/security/EncryptionService.java
@Service
public class EncryptionService {
    private final KeyManagementService kms;

    public String encryptSensitiveData(String plaintext) {
        try {
            // Use AWS KMS or HSM for key management
            byte[] dataKey = kms.generateDataKey();

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(128, generateIV());
            SecretKeySpec keySpec = new SecretKeySpec(dataKey, "AES");

            cipher.init(Cipher.ENCRYPT_MODE, keySpec, spec);
            byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new EncryptionException("Failed to encrypt data", e);
        }
    }

    public String decryptSensitiveData(String ciphertext) {
        // Decryption logic
    }
}
```

---

## Compliance & Regulatory

### 1. SOX Compliance

**Segregation of Duties**

```java
// src/main/java/com/bank/infrastructure/compliance/SoxComplianceService.java
@Service
public class SoxComplianceService {

    @PreAuthorize("hasRole('MAKER')")
    public void createTransaction(TransactionRequest request) {
        // Maker creates transaction in PENDING state
        Transaction transaction = Transaction.createPending(request);
        transactionRepository.save(transaction);
    }

    @PreAuthorize("hasRole('CHECKER') and !hasRole('MAKER')")
    public void approveTransaction(String transactionId) {
        // Checker approves (different person than maker)
        Transaction transaction = transactionRepository.findById(transactionId);

        if (transaction.getCreatedBy().equals(getCurrentUser())) {
            throw new SoxViolationException("Cannot approve own transaction");
        }

        transaction.approve(getCurrentUser());
        transactionRepository.save(transaction);
    }
}
```

### 2. GDPR Compliance

**Data Privacy and Right to be Forgotten**

```java
// src/main/java/com/bank/application/gdpr/GdprService.java
@Service
public class GdprService {

    public CustomerDataExport exportCustomerData(CustomerId customerId) {
        // Export all customer data
        Customer customer = customerRepository.findById(customerId);
        List<Account> accounts = accountRepository.findByCustomerId(customerId);
        List<Transaction> transactions = transactionRepository.findByCustomerId(customerId);

        return CustomerDataExport.builder()
            .customer(customer)
            .accounts(accounts)
            .transactions(transactions)
            .exportDate(LocalDateTime.now())
            .build();
    }

    @Transactional
    public void anonymizeCustomerData(CustomerId customerId) {
        // Anonymize customer data (cannot delete due to regulatory requirements)
        Customer customer = customerRepository.findById(customerId);
        customer.anonymize(); // Replace PII with anonymized values

        customerRepository.save(customer);

        auditLogger.log("GDPR_ANONYMIZATION", customerId);
    }
}
```

---

## Key Takeaways

### Architecture Decisions

1. **Layered Architecture**: Clear separation of concerns, easier to understand and maintain
2. **Rich Domain Model**: Business logic in domain layer, not anemic models
3. **Repository Pattern**: Abstracts data access, enables testing
4. **ACID Transactions**: PostgreSQL ensures data integrity
5. **Pessimistic Locking**: Prevents concurrent modification of accounts
6. **Audit Logging**: Complete trail for compliance
7. **Encryption**: AES-256 for sensitive data

### Trade-offs

**Benefits**
- ✅ Clear separation of concerns
- ✅ Easy to understand and maintain
- ✅ Strong data consistency (ACID)
- ✅ Comprehensive security
- ✅ Regulatory compliance
- ✅ Testable layers

**Challenges**
- ❌ Monolithic deployment (all layers together)
- ❌ Vertical scaling only
- ❌ Technology lock-in (Java/Spring)
- ❌ Layer overhead for simple operations
- ❌ Tight coupling within monolith

### Security Measures

- **Authentication**: OAuth 2.0, JWT tokens
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **MFA**: TOTP, SMS, biometric
- **Audit**: Complete audit trail
- **Compliance**: SOX, PCI DSS, GDPR, Basel III

### Performance Metrics

- **Transaction Processing**: < 500ms (P95)
- **API Response Time**: < 200ms (P95)
- **Database Queries**: < 100ms (P95)
- **Availability**: 99.95%
- **Throughput**: 100,000 transactions/day

---

## References

- [Layered Architecture](../rules/layered-architecture.md)
- [Security Architecture](../rules/security.md)
- [Domain-Driven Design](../rules/tools-methodologies.md)
- [Quality Attributes](../rules/quality-attributes.md)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [PCI DSS Compliance](https://www.pcisecuritystandards.org/)

