# Positioning copy — canonical source

Ready-to-paste copy for **off-site** profiles (GitHub, LinkedIn, CV), kept in sync with
the site's positioning. This file is **not deployed** — Astro only serves `src/pages/`
and `public/`, so a root `.md` never ships. Edit here first, then propagate outward.

> **Positioning:** Low-Level Systems & Cybersecurity Engineer
> **Status:** available now

---

## Canonical facts (single source of truth)

Keep every platform below consistent with these. If one changes, change it here first.

| Field | Value |
| --- | --- |
| Name | Xavier Ogay |
| Role / title | Low-Level Systems & Cybersecurity Engineer |
| Education | Joint MSc Cyber Security, EPFL / ETH Zürich (2023–2026) · BSc Computer Science, EPFL (2019–2023) |
| One-line | I build and analyse software close to the machine — embedded systems, compiler infrastructure, binary analysis, and security tooling. |
| Signature line | I live below the abstraction layers. |
| Core stack | C/C++, Rust, Python, LLVM, WebAssembly, x86/MIPS assembly, VHDL |
| Focus areas | Low-level systems, binary analysis, side channels, systems & hardware security, compilers |
| Signature work | Master's thesis *AutoMutate++* (armasuisse / Cyber-Defence Campus) · *Symbolic LLVM Memory Sandboxing for WebAssembly* (EPFL) |
| Site | https://www.xavierogay.ch |
| GitHub | https://github.com/2Tricky4u |
| LinkedIn | https://linkedin.com/in/xavier-ogay |
| EPFL profile | https://people.epfl.ch/xavier.ogay |
| Email | xaga.ogay@gmail.com |

**Canonical meta description** (site `<meta name="description">`, reuse for search/OG):

> Low-level systems and cybersecurity engineer working with Rust, C/C++, LLVM, embedded
> systems, binary analysis and security tooling. Joint MSc Cyber Security (EPFL/ETHZ).

---

## GitHub

### Bio (≤160 chars — profile field)

> Low-Level Systems & Cybersecurity Engineer. Below the abstraction layers: Rust, C/C++, LLVM, embedded, binary analysis. MSc Cyber Security (EPFL/ETHZ).

`— 149 chars.`

### Profile README intro

```markdown
### Xavier Ogay — Low-Level Systems & Cybersecurity Engineer

I build and analyse software close to the machine, from embedded systems and compiler
infrastructure to binary analysis and security tooling. Joint MSc in Cyber Security from
EPFL / ETH Zürich.

- 🔬 Currently: Master's thesis on automated AV/EDR evaluation at armasuisse (Cyber-Defence Campus)
- 🧰 Working with: Rust · C/C++ · LLVM · WebAssembly · x86/MIPS asm
- 🌐 Portfolio & write-ups: https://www.xavierogay.ch
- 📫 xaga.ogay@gmail.com
```

### Pinned-repo blurbs (match site project summaries)

- **AutoMutate++** — Closed-loop EDR evaluation framework in Rust that mutates software
  artifacts across multiple layers and differentially tests them against Windows Defender,
  MDE, and Cortex XDR.
- **Symbolic LLVM Memory Sandboxing** — Static analysis at the LLVM level that proves
  memory safety of WASM smart contracts and emits runtime checks only where safety can't
  be proven.
- **Hardware Security Attacks** — Real-world microarchitectural and DRAM attacks end to
  end: cache side channels, cross-boundary leaks (Meltdown, RetBleed), and Rowhammer bit flips.
- **ACME Certificate Client** — RFC 8555-compliant ACMEv2 client with custom DNS/HTTP/HTTPS
  stacks; dns-01 / http-01 challenges, wildcards, automated revocation.

---

## LinkedIn

### Headline (≤220 chars)

> Low-Level Systems & Cybersecurity Engineer · Rust / C/C++ / LLVM · binary analysis, embedded & systems security · MSc Cyber Security (EPFL / ETH Zürich)

`— 150 chars.`

### About / summary

> I build and analyse software close to the machine — embedded systems, compiler
> infrastructure, binary analysis, and security tooling. I hold a joint MSc in Cyber
> Security from EPFL and ETH Zürich, where I focused on software, hardware, and systems
> security alongside deep learning.
>
> Right now I'm finishing my Master's thesis at armasuisse (Cyber-Defence Campus), building
> AutoMutate++: a closed-loop framework in Rust that mutates software artifacts across
> multiple layers and differentially tests them against production EDRs (Windows Defender,
> Microsoft Defender for Endpoint, Cortex XDR). Before that, at EPFL, I built a symbolic
> LLVM analysis that proves memory safety of WebAssembly smart contracts and inserts runtime
> checks only where safety can't be statically proven.
>
> I'm most at home below the abstraction layers: reading disassembly, reasoning about
> memory and microarchitecture, and turning low-level insight into tooling. I'm available
> now for roles in low-level software, embedded, systems/security R&D, and compilers.
>
> Toolbox: Rust · C/C++ · Python · LLVM · WebAssembly · x86/MIPS assembly · VHDL ·
> binary analysis · side channels · cryptography.
>
> Portfolio & write-ups → https://www.xavierogay.ch

### Featured (link captions)

- **Portfolio** — xavierogay.ch — projects, case studies, and reverse-engineering write-ups.
- **AutoMutate++ case study** — automated artifact mutation against AV/EDR.
- **Symbolic LLVM Sandboxing case study** — proving WASM memory safety at the IR level.

---

## CV

### Professional summary

> Low-Level Systems & Cybersecurity Engineer with a joint MSc in Cyber Security (EPFL /
> ETH Zürich). I build and analyse software close to the machine — embedded systems,
> compiler infrastructure, binary analysis, and security tooling — and turn low-level
> insight into practical tools. Experienced across Rust, C/C++, LLVM, and WebAssembly,
> with security research spanning EDR evaluation, microarchitectural attacks, and static
> analysis for memory safety.

### Skills (grouped for a CV skills block)

- **Languages:** C/C++, Rust, Python, Java, Kotlin, Scala, x86/MIPS assembly, VHDL
- **Systems & compilers:** LLVM, WebAssembly, embedded systems, static analysis, symbolic execution
- **Security:** binary analysis, side channels, speculative-execution & DRAM attacks, EDR/AV evaluation, cryptography
- **Tooling:** Docker, Git, PyTorch, tree-sitter

### Selected experience (CV bullets)

- **Master's thesis — AutoMutate++ · armasuisse, Cyber-Defence Campus (CYD), 2026.**
  Built a closed-loop EDR evaluation framework in Rust with multi-layer artifact mutation
  and differential testing against Windows Defender, MDE, and Cortex XDR.
- **Research project — Symbolic LLVM Memory Sandboxing for WebAssembly · EPFL, 2025.**
  Static analysis framework proving memory safety of WASM smart contracts at the LLVM
  level; emits optimized runtime checks only where safety can't be proven.

### One-line (email signature / header)

> Xavier Ogay · Low-Level Systems & Cybersecurity Engineer · xavierogay.ch

---

## Short bios (reusable)

- **25 words.** Low-Level Systems & Cybersecurity Engineer. I build and analyse software
  close to the machine — embedded, compilers, binary analysis, security tooling. MSc Cyber
  Security (EPFL/ETHZ).
- **50 words.** Xavier Ogay is a Low-Level Systems & Cybersecurity Engineer with a joint MSc
  in Cyber Security from EPFL and ETH Zürich. He works below the abstraction layers —
  embedded systems, compiler infrastructure, binary analysis, and security tooling — with
  recent research on automated EDR evaluation and LLVM-level memory safety.

---

*Last aligned with site copy in Hero, Contact, BaseLayout (meta + JSON-LD), Timeline, and
the terminal easter egg. When the site's positioning changes, update the canonical facts
table above and re-propagate.*
