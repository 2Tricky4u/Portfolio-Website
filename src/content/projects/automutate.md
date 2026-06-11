---
title: 'AutoMutate++: Automated Artifact Mutation against AV/EDR'
summary: A closed-loop EDR evaluation framework in Rust that mutates software artifacts across multiple layers and differentially tests them against Windows Defender, MDE, and Cortex XDR.
period: '2026'
org: armasuisse · Cyber-Defence Campus (CYD)
tags: [Rust, EDR, LLVM, tree-sitter, Windows, Security Research]
featured: true
order: 1
cover: ../../assets/projects/Automutate.png
links:
  github: https://github.com/2Tricky4u/Automated-Analysis-and-Mutation-of-Software-Artifacts-against-AV-EDR
---

## Context

Endpoint Detection and Response (EDR) products are the front line of enterprise defense, but *what exactly* triggers their detections is opaque — both to defenders tuning them and to researchers evaluating them. Understanding which artifact features a detection hinges on usually requires slow, manual trial and error.

AutoMutate++ — my Master's thesis, carried out in industry at armasuisse's Cyber-Defence Campus (CYD) — automates that process: it systematically mutates a software artifact and observes which mutations flip the verdict of real EDR products, localizing the features detections depend on.

## Approach

The framework, written in Rust, runs a closed feedback loop:

- **Multi-layer mutation** — transformations are applied at three levels of the toolchain: source AST (via tree-sitter), LLVM IR, and the final PE binary, covering syntactic, structural, and binary-level features.
- **Differential testing** — each mutant is evaluated against multiple EDRs (Windows Defender, Microsoft Defender for Endpoint, Cortex XDR), so verdict differences isolate product-specific detection logic.
- **Token-driven feedback scoring** — detection feedback drives the next round of mutations, steering the search toward the minimal change that alters the verdict.

## Results

The framework systematically discovers which artifact characteristics individual EDR products key on, turning a manual reverse-engineering exercise into a reproducible, automated measurement. Conducted as authorized security research for my Master's thesis at the Cyber-Defence Campus (armasuisse); source and report are on GitHub.
