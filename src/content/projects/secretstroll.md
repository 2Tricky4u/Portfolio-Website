---
title: 'SecretStroll: Privacy-Preserving Location-Based Search'
summary: A location-based point-of-interest service where users authenticate with attribute-based credentials and query over Tor — the server learns neither identity nor location.
period: '2024'
org: EPFL · Privacy Enhancing Technologies
tags: [Python, Cryptography, ABC, Tor, Docker]
featured: true
order: 5
cover: ../../assets/projects/SecretStroll.png
links:
  pdf: /doc/SecretStrollReport.pdf
---

## Context

Location-based services are a privacy worst case: every query reveals who you are and where you stand. SecretStroll builds a point-of-interest search service under a stronger threat model — the service operator itself is honest-but-curious and must learn neither the user's identity nor their location.

## Approach

- **Attribute-based credentials** built on cryptographic pairings (via the petrelic library) let users prove they hold a valid subscription for a queried area without revealing who they are; showing a credential twice is unlinkable.
- **Tor integration** hides the network-level identity of querying clients, closing the metadata side of the channel.
- **Isolated client–server architecture** deployed with Docker, separating the credential issuer from the location service.
- A **fingerprinting study** on the anonymized query traffic examined how much location information still leaks through traffic patterns alone.

Robustness was validated with a pytest suite covering the credential protocol's correctness and failure modes.

## Results

A working end-to-end private POI service, plus a quantified analysis of residual leakage. The [report](/doc/SecretStrollReport.pdf) details the credential scheme, the deployment, and the fingerprinting evaluation.
