/*
WHAT: Generic type parameter naming conventions in Q#.
HOW: Type parameters use single uppercase letter or descriptive camelCase with "T" prefix (e.g., 'TInput, 'TOutput); avoid single lowercase.
WHEN: Defining generic operations/functions that work on multiple types (states, results, etc.).
WHERE: Operation/function signatures using <'T> syntax; inside generic bodies.
WHY: Generics enable reusable quantum libraries; clear parameter names improve type inference readability and prevent confusion in complex quantum algorithm templates.
*/

// GOOD: Descriptive generic type parameters
namespace AugmentExtensions.Quantum.NamingStandards.Generics {

    operation ApplyGenericOperation<'TInput, 'TOutput>(input : 'TInput) : 'TOutput {
        // GOOD: 'TInput and 'TOutput follow convention
        // BAD example (commented): operation ApplyGenericOperation<tinput, toutput>
        // Violates: lowercase

        // Placeholder for generic logic
        return input as 'TOutput;  // Type cast for demo
    }
}