---
id: troubleshooting
title: cStor User Guide - troubleshooting
keywords:
  - cStor csi
  - cStor User Guide
  - cStor troubleshooting
description: This user guide will help you in troubleshooting cStor.
---

This user guide will help you in troubleshooting cStor.

### Troubleshooting

- [Troubleshooting cStor setup](#troubleshooting)

## Troubleshooting

- The volumes remains in `Init` state, even though pool pods are running. This can happen due to the pool pods failing to connect to Kubernetes API server. Check the logs of cstor pool pods. Restarting the pool pod can fix this issue. This is seen to happen in cases where cstor control plane is deleted and re-installed, while the pool pods were running.
