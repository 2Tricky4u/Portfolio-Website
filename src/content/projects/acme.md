---
title: ACME Certificate Client
summary: A fully functional ACMEv2 client with custom DNS/HTTP/HTTPS stacks, supporting dns-01 and http-01 challenges, wildcard domains, and automated revocation — RFC 8555 compliant, tested against Pebble.
period: '2024'
org: ETH Zürich
tags: [Python, TLS, X.509, RFC 8555]
featured: true
order: 5
cover: ../../assets/projects/ACME.png
links:
  pdf: /doc/ACME.pdf
---

## Context

Automatic Certificate Management Environment (ACME) is the protocol behind Let's Encrypt — it lets a server prove control of a domain and obtain a TLS certificate without any human in the loop. Understanding it properly means building it: not just calling a library, but speaking ACMEv2 end to end, answering the validation challenges, and handling the X.509 and JOSE machinery underneath.

This project is a from-scratch ACMEv2 client that drives the full certificate lifecycle — request, validation, issuance, and revocation — against a real ACME server.

## Approach

The client implements the protocol and all the infrastructure a validation requires:

- **Challenge handling** — both `dns-01` (provisioning TXT records the server queries) and `http-01` (serving the token over HTTP), including **wildcard** certificates, which are only obtainable via `dns-01`.
- **Custom DNS / HTTP / HTTPS stack** — a purpose-built DNS server answers the validation queries, an HTTP server serves `http-01` tokens, and an HTTPS server presents the freshly issued certificate, so the whole exchange runs without external infrastructure.
- **JOSE-compliant signing** — every ACME request is a signed JWS with the correct nonce handling and key/account binding per the spec.
- **X.509 and RFC 8555 state machines** — CSR generation, certificate parsing, and the order → authorization → challenge → finalize → revoke flow modelled as compliant state machines.

## Results

A complete client that issues and revokes certificates (including wildcards) over both challenge types, validated end to end against [Pebble](https://github.com/letsencrypt/pebble), the ACME test server. The [report](/doc/ACME.pdf) walks through the architecture and the protocol flow.
