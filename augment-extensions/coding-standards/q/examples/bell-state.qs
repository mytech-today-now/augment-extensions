namespace AugmentQuantum.Examples {
    open Microsoft.Quantum.Intrinsic;
    open Microsoft.Quantum.Measurement;

    /// # Summary
    /// Prepares a Bell pair (|00> + |11>)/sqrt(2) on two qubits.
    /// # Input
    /// q1, q2 : Qubits assumed in |0> state.
    operation PrepareBellState(q1 : Qubit, q2 : Qubit) : Unit is Adj + Ctl {
        H(q1);
        CNOT(q1, q2);
    }

    @EntryPoint()
    operation RunBellState() : (Result, Result) {
        use (a, b) = (Qubit(), Qubit());
        PrepareBellState(a, b);
        let result = (MResetZ(a), MResetZ(b));
        return result;
    }
}
