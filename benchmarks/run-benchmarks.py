#!/usr/bin/env python3
"""
Token Reduction Benchmark Suite

Measures token reduction achieved by skill-based system vs module-based system.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List

try:
    import tiktoken
except ImportError:
    print("Error: tiktoken not installed. Install with: pip install tiktoken")
    sys.exit(1)


def count_tokens(file_path: str, model: str = "gpt-4") -> int:
    """Count tokens in a file using tiktoken."""
    encoding = tiktoken.encoding_for_model(model)
    content = Path(file_path).read_text(encoding='utf-8')
    return len(encoding.encode(content))


def run_scenario(scenario_file: str) -> Dict:
    """Run a single benchmark scenario."""
    scenario = json.loads(Path(scenario_file).read_text(encoding='utf-8'))
    
    # Measure baseline
    baseline_tokens = sum(count_tokens(f) for f in scenario["baseline"]["files"])
    
    # Measure skills
    skill_tokens = sum(count_tokens(f) for f in scenario["skills"]["files"])
    
    # Calculate reduction
    reduction = ((baseline_tokens - skill_tokens) / baseline_tokens) * 100 if baseline_tokens > 0 else 0
    
    return {
        "scenario": scenario["name"],
        "description": scenario["description"],
        "baseline_tokens": baseline_tokens,
        "skill_tokens": skill_tokens,
        "reduction_percentage": reduction,
        "expected_reduction": scenario["expectedReduction"],
        "meets_expectation": reduction >= scenario["expectedReduction"]
    }


def print_results(results: List[Dict]):
    """Print benchmark results in a formatted table."""
    print("\n" + "=" * 100)
    print("TOKEN REDUCTION BENCHMARK RESULTS")
    print("=" * 100)
    
    for result in results:
        print(f"\n{result['scenario']}")
        print(f"  Description: {result['description']}")
        print(f"  Baseline:    {result['baseline_tokens']:,} tokens")
        print(f"  Skills:      {result['skill_tokens']:,} tokens")
        print(f"  Reduction:   {result['reduction_percentage']:.1f}%")
        print(f"  Expected:    {result['expected_reduction']:.1f}%")
        status = "✓ PASS" if result['meets_expectation'] else "✗ FAIL"
        print(f"  Status:      {status}")
    
    # Summary
    avg_reduction = sum(r["reduction_percentage"] for r in results) / len(results)
    passed = sum(1 for r in results if r['meets_expectation'])
    
    print(f"\n{'=' * 100}")
    print(f"SUMMARY")
    print(f"{'=' * 100}")
    print(f"  Total Scenarios:    {len(results)}")
    print(f"  Passed:             {passed}/{len(results)}")
    print(f"  Average Reduction:  {avg_reduction:.1f}%")
    print(f"  Overall Status:     {'✓ ALL PASS' if passed == len(results) else '✗ SOME FAILED'}")
    print(f"{'=' * 100}\n")


def export_json(results: List[Dict], output_file: str):
    """Export results to JSON file."""
    output = {
        "results": results,
        "summary": {
            "total_scenarios": len(results),
            "passed": sum(1 for r in results if r['meets_expectation']),
            "average_reduction": sum(r["reduction_percentage"] for r in results) / len(results)
        }
    }
    
    Path(output_file).write_text(json.dumps(output, indent=2), encoding='utf-8')
    print(f"Results exported to: {output_file}")


def main():
    """Main benchmark runner."""
    # Find all scenario files
    scenarios_dir = Path("benchmarks/scenarios")
    
    if not scenarios_dir.exists():
        print(f"Error: Scenarios directory not found: {scenarios_dir}")
        print("Please create benchmark scenarios first.")
        sys.exit(1)
    
    scenario_files = sorted(scenarios_dir.glob("*.json"))
    
    if not scenario_files:
        print(f"Error: No scenario files found in {scenarios_dir}")
        sys.exit(1)
    
    print(f"Found {len(scenario_files)} benchmark scenarios")
    
    # Run all scenarios
    results = []
    for scenario_file in scenario_files:
        try:
            result = run_scenario(str(scenario_file))
            results.append(result)
        except Exception as e:
            print(f"Error running scenario {scenario_file}: {e}")
            continue
    
    # Print results
    print_results(results)
    
    # Export to JSON
    export_json(results, "benchmarks/results.json")
    
    # Exit with appropriate code
    all_passed = all(r['meets_expectation'] for r in results)
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()

