# PowerShell Testing Guidelines

Comprehensive testing standards using Pester framework for PowerShell code.

## Pester Framework

### Installation

```powershell
# Install Pester 5.x
Install-Module -Name Pester -Force -SkipPublisherCheck

# Verify installation
Get-Module -Name Pester -ListAvailable
```

### Test File Structure

**ALWAYS** follow these conventions:

```powershell
# Test files: *.Tests.ps1
Get-UserData.ps1       # Source file
Get-UserData.Tests.ps1 # Test file

# Directory structure
MyModule/
├── Public/
│   └── Get-UserData.ps1
├── Private/
│   └── Helper.ps1
└── Tests/
    ├── Public/
    │   └── Get-UserData.Tests.ps1
    └── Private/
        └── Helper.Tests.ps1
```

## Test Structure (Pester 5.x)

### Describe, Context, It Blocks

```powershell
# ✅ GOOD: Proper test structure
Describe 'Get-UserData' {
    BeforeAll {
        # Setup runs once before all tests
        $testUser = @{
            Name = 'TestUser'
            Email = 'test@example.com'
        }
    }
    
    Context 'When user exists' {
        It 'Should return user data' {
            # Arrange
            $userId = 1
            
            # Act
            $result = Get-UserData -UserId $userId
            
            # Assert
            $result.Name | Should -Be 'TestUser'
            $result.Email | Should -Be 'test@example.com'
        }
    }
    
    Context 'When user does not exist' {
        It 'Should throw an error' {
            # Arrange
            $userId = 999
            
            # Act & Assert
            { Get-UserData -UserId $userId } | Should -Throw
        }
    }
    
    AfterAll {
        # Cleanup runs once after all tests
        Remove-Variable -Name testUser -ErrorAction SilentlyContinue
    }
}
```

### BeforeEach and AfterEach

```powershell
Describe 'Set-Configuration' {
    BeforeEach {
        # Runs before each test
        $script:tempFile = New-TemporaryFile
    }
    
    It 'Should save configuration' {
        Set-Configuration -Path $tempFile -Value 'test'
        $tempFile | Should -Exist
    }
    
    AfterEach {
        # Runs after each test
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    }
}
```

## Assertions (Should)

### Common Assertions

```powershell
# Equality
$result | Should -Be 'expected'
$result | Should -Not -Be 'unexpected'

# Null checks
$result | Should -BeNullOrEmpty
$result | Should -Not -BeNullOrEmpty

# Type checks
$result | Should -BeOfType [string]
$result | Should -BeOfType [System.Collections.Hashtable]

# Boolean
$result | Should -BeTrue
$result | Should -BeFalse

# Exceptions
{ Get-Item 'C:\NonExistent' } | Should -Throw
{ Get-Item 'C:\NonExistent' } | Should -Throw -ExpectedMessage '*cannot find*'

# File/Path
'C:\Temp\file.txt' | Should -Exist
'C:\Temp\file.txt' | Should -FileContentMatch 'pattern'

# Collections
$array | Should -Contain 'item'
$array | Should -HaveCount 5
```

## Mocking

### Mock Functions and Cmdlets

```powershell
Describe 'Send-Notification' {
    It 'Should call Send-MailMessage' {
        # Arrange
        Mock Send-MailMessage { }
        
        # Act
        Send-Notification -To 'user@example.com' -Message 'Test'
        
        # Assert
        Should -Invoke Send-MailMessage -Times 1 -Exactly
        Should -Invoke Send-MailMessage -ParameterFilter {
            $To -eq 'user@example.com'
        }
    }
}
```

### Mock Return Values

```powershell
Describe 'Get-ProcessedData' {
    It 'Should process API response' {
        # Arrange
        Mock Invoke-RestMethod {
            return @{
                Status = 'Success'
                Data = @('Item1', 'Item2')
            }
        }
        
        # Act
        $result = Get-ProcessedData
        
        # Assert
        $result.Data | Should -HaveCount 2
    }
}
```

## Test Organization

### Unit Tests

Test individual functions in isolation:

```powershell
Describe 'ConvertTo-TitleCase' -Tag 'Unit' {
    It 'Should capitalize first letter of each word' {
        $result = ConvertTo-TitleCase -Text 'hello world'
        $result | Should -Be 'Hello World'
    }
}
```

### Integration Tests

Test multiple components together:

```powershell
Describe 'User Management Integration' -Tag 'Integration' {
    It 'Should create and retrieve user' {
        # Create user
        New-User -Name 'TestUser' -Email 'test@example.com'
        
        # Retrieve user
        $user = Get-User -Name 'TestUser'
        $user.Email | Should -Be 'test@example.com'
    }
}
```

## Running Tests

### Command Line

```powershell
# Run all tests
Invoke-Pester

# Run specific file
Invoke-Pester -Path .\Tests\Get-UserData.Tests.ps1

# Run tests with tag
Invoke-Pester -Tag 'Unit'

# Generate code coverage
Invoke-Pester -CodeCoverage .\Public\*.ps1 -CodeCoverageOutputFile coverage.xml
```

### Configuration File

Create `PesterConfiguration.psd1`:

```powershell
@{
    Run = @{
        Path = './Tests'
        Exit = $true
    }
    CodeCoverage = @{
        Enabled = $true
        Path = './Public/*.ps1', './Private/*.ps1'
        OutputFormat = 'JaCoCo'
    }
    TestResult = @{
        Enabled = $true
        OutputFormat = 'NUnitXml'
    }
}
```

## Best Practices

1. **Use Pester 5.x** - Latest version with improved performance
2. **Follow AAA pattern** - Arrange, Act, Assert
3. **One assertion per test** - Keep tests focused
4. **Use descriptive names** - Test names should explain what is tested
5. **Mock external dependencies** - Isolate unit tests
6. **Use tags** - Organize tests (Unit, Integration, Slow)
7. **Test edge cases** - Null, empty, invalid inputs
8. **Aim for 80%+ coverage** - Use code coverage reports
9. **Run tests in CI/CD** - Automate testing
10. **Keep tests fast** - Unit tests should run in milliseconds

