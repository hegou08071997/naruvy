---
name: sync
description: Sync base setup files from LevonBecker/repo_setup_ruby GitHub main branch into this repo. Use when: /sync, sync base setup, update from repo_setup_ruby.
argument-hint: no arguments required
agent: agent
---

!`cd "$(yq .repo.local properties.yml)" && bundle exec rake repo:sync:github`
