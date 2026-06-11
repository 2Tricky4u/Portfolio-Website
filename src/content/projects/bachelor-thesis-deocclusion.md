---
title: De-occlusion of Vehicle Images from Drone Video
summary: Bachelor thesis comparing two deep-learning inpainting models for reconstructing occluded vehicles in drone footage, improving detection reliability for urban traffic analysis.
period: '2023'
org: EPFL · Bachelor thesis
tags: [Python, PyTorch, Computer Vision, Inpainting]
featured: true
order: 4
cover: ../../assets/projects/LUTS.png
links:
  github: https://github.com/2Tricky4u/Bachelor-Thesis-De-occlusion-of-occluded-vehicle-images-from-drone-video
---

## Context

Drone video is a rich data source for urban traffic research, but vehicle detection accuracy degrades sharply when vehicles are partially occluded — by trees, buildings, bridges, or each other. Missed and misclassified vehicles propagate as noise into every downstream analysis.

My Bachelor thesis investigated whether image inpainting can recover occluded vehicle regions well enough to improve detection and data reliability.

## Approach

- Built an evaluation pipeline around real drone footage of urban traffic, with occluded vehicle instances as the target distribution.
- Compared two machine-learning inpainting models on the task of reconstructing the occluded portions of vehicle images.
- Measured the effect of de-occlusion on downstream detection quality, rather than just visual plausibility of the inpainted pixels.

## Results

The comparison quantified how much each inpainting approach helps detection under occlusion, identifying the conditions where reconstruction is reliable and where it introduces artifacts. Code and the full thesis methodology are on GitHub.
