# Perl Coding Standard

This document defines the coding standards for all Perl code in projects using augment-extensions. The goal is to ensure consistency, readability, maintainability, security, and performance across Perl 5.20+ codebases (preferably 5.36+ for modern features).

These guidelines build on core Perl community recommendations:
- `perlstyle` (core Perl style guide)
- Perl Best Practices (Damian Conway, O'Reilly 2005 — still highly relevant)
- Modern Perl (4th edition practices)
- Perltidy defaults with overrides for team consistency

All Perl code **must** pass strict and warnings, and should use modern features where they improve clarity and safety.

## 1. File Naming and Organization

- Use lowercase_with_underscores.pl for scripts.
- Use CamelCase.pm for modules / classes (but prefer lowercase_with_underscores.pm for utility modules when not object-oriented).
- Main application entry point: `app.pl` or `scriptname.pl`.
- Tests: `t/001_basic.t`, `t/foo-bar.t` (use descriptive names).
- Configuration files: `.pl`, `.conf`, or `.ini` (avoid `.pm` unless it's a config module).
- Organize large projects with `lib/`, `bin/`, `t/`, `script/`, `share/`.

**Must** place `use strict;` and `use warnings;` (or `use v5.36;` which implies them) at the top of every file.

```perl
use v5.36;    # Enables strict, warnings, signatures, etc.
```

## 2. Indentation and Whitespace

Use 4 spaces for indentation (no tabs).
Use perltidy with project .perltidyrc for automatic formatting:
-i=4 -et=4 -l=100 -ce -bar -bbb -bbc -bbs

Align fat commas (=>) where reasonable.

Keep lines ≤ 100 characters (soft limit 120).
One true brace style (K&R / OTBS): opening brace on same line as control structure.

Blank lines:
1 between logical blocks inside subroutines.
2 between subroutines.

Avoid trailing whitespace.


Example:
```perl
sub process_data ($data) {
    my $result = {};

    if ($data->{enabled}) {
        $result->{status} = 'active';
    }
    else {
        $result->{status} = 'inactive';
    }

    return $result;
}
```

## 3. Naming Conventions

Variables: $snake_case (lowercase with underscores).
Constants: UPPER_CASE.
Subroutines: snake_case().
Packages/Modules: CamelCase for OO / distributions, lowercase::with::namespaces otherwise.
Filehandles: $fh or $IN_FH, $OUT_FH.
Package variables: avoid globals; prefer our or state when needed.
Avoid single-letter variables except for obvious loop counters ($i, $j) or throwaways ($_).

Prefer lexical variables (my, our, state) over local or package globals.
Avoid $a, $b outside sort blocks.

## 4. Comments and Documentation

Use POD for module/user documentation.
Inline comments for non-obvious logic only.
Use # for comments, aligned when possible.
Document all subs with purpose, params, returns using simple POD or plain comments.
For complex regexes, use /xms and comment each line.

Example:
```perl

# Parse ISO date with named captures
if ($input =~ m{
    ^ (?<year>   \d{4} ) -
      (?<month>  \d{2} ) -
      (?<day>    \d{2} ) $
}xms) {
    # ...
}
```

## 5. Language Features and Best Practices

Alwaysuse v5.36; (or at minimum use 5.20;) for signatures, postderef, etc.
Use subroutine signatures (sub foo ($bar, $baz) { ... }).
Prefer say over print when no newline is unwanted.
Use // (defined-or) and //= over || for defaults unless undef is meaningful.
List assignment and slices for clarity:

```perl
my ($host, $port) = @config{qw(host port)};
```

Use Carp instead of die in libraries (croak, confess).
Prefer exceptions over return undef for error handling.
Use Try::Tiny or core try/catch (v5.36+) for exception handling.

```perl
use Try::Tiny;

try {
    dangerous_operation();
}
catch {
    croak "Failed: $_";
};
```

## 6. Control Structures

Prefer postfix conditionals for simple guards:

```perl
return if !$condition;
```

Use for instead of foreach (they are synonyms, but for is idiomatic).
Avoid C-style for (;;) unless performance-critical.
Use given/when sparingly (deprecated in future Perl); prefer if/elsif/else.

## 7. Regular Expressions

Always use /xms flags for complex regexes.
Use named captures ((?<name>...)) over numbered.
Prefer qr// for building regexes.
Quote regex metacharacters when interpolating user input (quotemeta).

## 8. Error Handling and Security

Check return values of system calls (open, sysread, chdir, etc.).
Use IPC::System::Simple or capture output safely.
Taint mode (-T) for CGI / untrusted input scripts.
Use Hash::Util to lock hashes where appropriate.
Avoid system(@args) with interpolation; prefer list form.

## 9. Testing

Use Test2::V0 or Test::More + Test2::Suite.
Write tests first when feasible (TDD encouraged).
Aim for >80% coverage on business logic.
Use done_testing() instead of plan count.

## 10. Performance and Modernization

Profile before optimizing (Devel::NYTProf).
Prefer arrayrefs over arrays for large data.
Use Moo / Moose / Mojo::Base for OO (project choice).
Avoid source filters.
Use feature qw( postderef signatures ) if not using v5.36.

## Tooling

Run perltidy -b before commit.
Use perlcritic with severity 3+ (custom .perlcriticrc recommended).
Enforce via pre-commit hooks or CI.

Follow these guidelines unless a deliberate, documented exception exists. Consistency across the codebase takes precedence over individual preferences.

This new Perl standard mirrors the structure, prescriptive tone, code examples, and depth seen in the repo's other language standards (e.g., Python's emphasis on modern features/type hints, PHP's PSR adherence with extensions). Place it in `augment-extensions/coding-standards/perl/README.md` (or similar) to match the pattern. If you need adjustments or more sections, let me know!