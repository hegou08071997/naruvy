---
name: autocorrect
description: Auto-fix Ruby linting issues. Use when you want to run rubocop autocorrect.
argument-hint: no arguments required
agent: agent
---

!`cd "$(yq .repo.local properties.yml)" && bundle exec rake fix`
