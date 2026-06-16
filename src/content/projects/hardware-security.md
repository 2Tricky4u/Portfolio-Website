---
title: 'Hardware Security Attacks: AnC, Meltdown, RetBleed, Rowhammer'
summary: Implemented real-world microarchitectural and DRAM attacks end to end, from cache side-channel reconnaissance to cross-boundary memory leaks and bit flips.
period: Fall 2024
org: ETH Zürich · Hardware Security
tags: [C, x86, Side Channels, Speculative Execution, DRAM]
featured: true
order: 3
cover: ../../assets/projects/HardSec.png
links:
  pdf: /doc/HardwareSecuritySummary.pdf
---

## Context

Modern CPUs and DRAM trade isolation guarantees for performance, and a decade of research has shown those trade-offs are exploitable. In ETH Zürich's Hardware Security course, the labs reproduce the landmark attacks of that line of research, not as toy demos but as working exploits against real hardware.

## Approach

I implemented the full attack chain for several major classes of hardware vulnerabilities:

- **AnC.** Using cache side channels against the MMU's page-table walk to derandomize ASLR from unprivileged code.
- **Meltdown.** Leaking kernel memory across the user/kernel boundary via out-of-order execution and a cache covert channel.
- **RetBleed.** Exploiting return-instruction speculation to leak memory across privilege boundaries on mitigated CPUs.
- **Rowhammer.** Inducing DRAM bit flips through targeted row activation patterns and turning physical-reliability faults into a security primitive.

Each attack required careful microarchitectural reasoning: timer construction, eviction-set building, speculation-window tuning, and physical-memory massaging.

## Results

Working end-to-end exploits for each attack class, plus a deep practical understanding of where architectural isolation actually ends. A summary of the techniques is available as a [PDF](/doc/HardwareSecuritySummary.pdf).
