---
title: Symbolic LLVM Memory Sandboxing for WebAssembly
summary: A static analysis framework at the LLVM level that proves memory safety of WASM smart contracts and emits optimized runtime checks only where safety cannot be proven.
period: 2025 – 2026
org: EPFL · Master's thesis
tags: [LLVM, WebAssembly, 'C++', Static Analysis, Symbolic Execution]
featured: true
order: 1
cover: ../../assets/projects/MP.png
links:
  pdf: /doc/MP_slides.pdf
---

## Context

WebAssembly is increasingly used as an execution layer for smart contracts, where a single memory-safety bug can be catastrophic and execution must remain strictly deterministic. Conventional sandboxing approaches insert bounds checks on every memory access, paying a heavy runtime cost even when most accesses are provably safe.

My Master's thesis asks: how many of those checks can a compiler *prove away* — and how cheap can the remaining ones be made?

## Approach

I built a static analysis framework operating on LLVM IR that reasons symbolically about memory accesses:

- **Canonical symbolic expressions** represent pointer arithmetic in a normal form, so equivalent access patterns are recognized and analyzed once.
- **Phi-aware state merging** keeps the analysis precise across control-flow joins instead of conservatively discarding information.
- **Loop-bound inference** derives iteration bounds so accesses inside loops can be proven safe in aggregate rather than checked per iteration.

Accesses the analysis proves in-bounds need no instrumentation; for the rest, the framework emits optimized runtime checks, preserving WASM's determinism guarantees.

## Results

The framework was evaluated on real-world computation kernels, demonstrating that a large share of naive bounds checks can be eliminated while preserving full memory safety. The full write-up is in the thesis; the [slide deck](/doc/MP_slides.pdf) gives a condensed overview.
