# Visual Design Module Tests

Comprehensive unit and integration tests for the Visual Design module.

## Test Files

### `style-selector.test.ts`
Tests for the style selector module, including:
- Default vendor priority chain (google → microsoft → amazon)
- Custom priority configuration
- Vendor preference handling
- Fallback logic
- Case-insensitive vendor matching
- Helper functions (getVendorStyle, hasVendorStyle, getAllVendorStyles)

### `vendor-styles.test.ts`
Integration tests for all vendor design systems:
- **Google Modern (Material 3 Expressive)**: Color palette, typography, layout, motion, elevation, components
- **Microsoft Fluent 2**: Color palette, typography, layout, motion, elevation, components
- **Amazon Cloudscape**: Color palette, typography, layout, motion, elevation, components
- **Cross-vendor consistency**: Ensures all vendors implement required properties

## Running Tests

### Prerequisites
```bash
npm install --save-dev jest @types/jest ts-jest
```

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test style-selector.test.ts
npm test vendor-styles.test.ts
```

### Run with Coverage
```bash
npm test -- --coverage
```

## Test Coverage

The test suite covers:
- ✅ Style selector creation and configuration
- ✅ Default vendor priority chain
- ✅ Custom vendor priority chains
- ✅ Vendor preference handling
- ✅ Fallback logic for invalid vendors
- ✅ Case-insensitive vendor matching
- ✅ All vendor style implementations
- ✅ Cross-vendor consistency checks
- ✅ Required properties validation
- ✅ Accessibility standards validation
- ✅ Responsive grid systems
- ✅ Spacing systems

## Expected Test Results

All tests should pass with 100% coverage of:
- `style-selector.ts`
- `domains/web-page-styles/google-modern.ts`
- `domains/web-page-styles/microsoft-fluent.ts`
- `domains/web-page-styles/amazon-cloudscape.ts`

## Adding New Tests

When adding new vendor styles or features:

1. **Add vendor style tests** in `vendor-styles.test.ts`:
   ```typescript
   describe('New Vendor Style', () => {
     it('should have correct vendor identifier', () => {
       expect(NEW_VENDOR.vendor).toBe('vendor-name');
     });
     // Add more tests...
   });
   ```

2. **Update style selector tests** in `style-selector.test.ts`:
   ```typescript
   it('should select new vendor when specified', () => {
     const style = selectVendorStyle({ vendor: 'new-vendor' });
     expect(style).toBe(NEW_VENDOR);
   });
   ```

3. **Update cross-vendor tests** to include the new vendor in the array.

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- Fast execution (< 5 seconds)
- No external dependencies
- Deterministic results
- Clear error messages

## Troubleshooting

### Import Errors
If you encounter import errors, ensure:
- TypeScript is configured correctly (`tsconfig.json`)
- All dependencies are installed
- File paths are correct

### Type Errors
If you encounter type errors:
- Check that `types.ts` exports all required interfaces
- Verify vendor style implementations match the `VendorStyle` interface
- Ensure test files import types correctly

## License

Part of Augment Extensions. See repository root for license information.

