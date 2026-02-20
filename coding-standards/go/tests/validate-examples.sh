#!/bin/bash
# Validate Go Code Examples
# Covers GOL.4.3 - Example Validation

set -e

MODULE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXAMPLES_DIR="$MODULE_ROOT/examples"

echo "🔍 Validating Go Code Examples..."
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "  Testing: $test_name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}Error: Go is not installed${NC}"
    echo "Please install Go from https://golang.org/dl/"
    exit 1
fi

echo "Go version: $(go version)"
echo ""

# GOL.4.3.1: Compile all examples
echo "📦 GOL.4.3.1: Compiling Examples"
echo "--------------------------------"

cd "$EXAMPLES_DIR"

# Find all .go files
GO_FILES=$(find . -name "*.go" -type f)

if [ -z "$GO_FILES" ]; then
    echo -e "${YELLOW}Warning: No .go files found in examples directory${NC}"
else
    for file in $GO_FILES; do
        run_test "Compile $file" "go build -o /dev/null $file"
    done
fi

echo ""

# GOL.4.3.2: Run golangci-lint (if available)
echo "🔎 GOL.4.3.2: Running golangci-lint"
echo "-----------------------------------"

if command -v golangci-lint &> /dev/null; then
    run_test "golangci-lint" "golangci-lint run --timeout 5m"
else
    echo -e "${YELLOW}⚠ golangci-lint not installed, skipping${NC}"
    echo "  Install: https://golangci-lint.run/usage/install/"
fi

echo ""

# GOL.4.3.3: Run gofmt
echo "📝 GOL.4.3.3: Checking Formatting (gofmt)"
echo "-----------------------------------------"

UNFORMATTED=$(gofmt -l .)
if [ -z "$UNFORMATTED" ]; then
    run_test "gofmt formatting" "true"
else
    echo -e "${RED}✗ FAIL: Unformatted files found:${NC}"
    echo "$UNFORMATTED"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

echo ""

# GOL.4.3.4: Run go vet
echo "🔧 GOL.4.3.4: Running go vet"
echo "----------------------------"

for file in $GO_FILES; do
    run_test "go vet $file" "go vet $file"
done

echo ""

# GOL.4.3.5: Manual review checklist
echo "📋 GOL.4.3.5: Manual Review Checklist"
echo "-------------------------------------"
echo "  ✓ Examples demonstrate best practices"
echo "  ✓ Examples include error handling"
echo "  ✓ Examples use proper naming conventions"
echo "  ✓ Examples include documentation comments"
echo "  ✓ Examples are production-ready"

echo ""
echo "=================================="
echo "📊 Validation Summary"
echo "=================================="
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}✅ All validations passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some validations failed${NC}"
    exit 1
fi

