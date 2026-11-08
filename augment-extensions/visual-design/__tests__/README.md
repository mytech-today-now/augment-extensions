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

Run the tests from the repository root with the dependencies in `package-lock.json` installed:

```bash
npm test -- --runInBand augment-extensions/visual-design/__tests__
```

### Run Specific Test Files
```bash
npm test -- --runInBand augment-extensions/visual-design/__tests__/style-selector.test.ts
npm test -- --runInBand augment-extensions/visual-design/__tests__/vendor-styles.test.ts
npm test -- --runInBand augment-extensions/visual-design/__tests__/guidance-contract.test.ts
```

### Run with Coverage
```bash
npm test -- --coverage
```

## Verified Coverage

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
- Guidance paths, indexes, local Markdown links, metadata synchronization, and CLI module discovery
- Responsive sweep planning, viewport boundaries, aspect ratios, and breakpoint neighbors
- Synthetic pass, fail, and needs-review metric classifications

The responsive contract tests do not render an application. Browser layout, native UI, physical device, zoom, reduced-motion effect, localization, and assistive-technology behavior require a consuming application and its runner.

## Covered Modules

The focused suite covers behavior in:
- `style-selector.ts`
- `scripts/validate-guidance.cjs`
- `skills/responsive-validation/scripts/responsive-sweep.cjs`
- `domains/web-page-styles/google-modern.ts`
- `domains/web-page-styles/microsoft-fluent.ts`
- `domains/web-page-styles/amazon-cloudscape.ts`

## Adding New Tests

The guidance contract suite also checks module.json references, local Markdown paths and headings, module discovery, version-aware loading, vendor priority, and responsive sweep planning. It uses synthetic invalid metadata and viewport metrics for negative-path coverage. It does not render an application.

Run the module test files with Jest:

    npm test -- --runInBand augment-extensions/visual-design/__tests__

Validate the checked-in guidance references directly:

    node augment-extensions/visual-design/scripts/validate-guidance.cjs

Inspect the responsive viewport plan without an application:

    node augment-extensions/visual-design/skills/responsive-validation/scripts/responsive-sweep.cjs --dry-run --width-breakpoints 768,1024

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
- Deterministic and isolated
- No additional external dependencies
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

