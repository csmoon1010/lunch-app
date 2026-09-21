---
name: git-commit-policy
description: Use this skill whenever creating a git commit so the commit message follows the required policy. Apply it to any task that ends with a commit, and enforce a Korean commit message with a one-line summary title, known Redmine/JIRA issue number prefix, and a detailed body that reflects the user's request in the conversation and the concrete actions taken.
---

# Git Commit Policy

## Origin

This curated skill was created by AI Lab.

## Overview

Use this skill whenever you are about to create a git commit.
Its purpose is to keep commit history readable, consistent, and aligned with the user's stated request.

## Commit Message Rules

- Write the entire commit message in Korean.
- Write the title as a single-line summary of the change.
- If a Redmine or JIRA work item number is known, prefix the title with the number in `#<number>` form.
- For example, write `#12 <Korean one-line summary>` when work item 12 is the known context.
- Keep the title focused on the main outcome of the commit.
- Write the body in detail.
- In the body, describe the user's requirement that led to the change.
- Reflect the conversation context in the body instead of writing a generic explanation.
- In the body, explain the concrete actions taken to satisfy that requirement.
- When relevant, include important implementation decisions, affected behavior, and verification performed.

## Workflow

1. Review the latest user request and the surrounding conversation before committing.
2. Identify the core requirement, constraint, or intent that motivated the change.
3. Check whether the relevant Redmine or JIRA work item number is known.
4. Summarize the change in a one-line Korean title, adding the `#<number>` prefix when a known work item number exists.
5. Write a Korean body that connects the user's request to the implementation work.
6. Check that the message is specific to this commit and not reusable boilerplate.

## Preferred Structure

Use this structure by default:

```text
<#number prefix when known> <Korean one-line summary>

<Detailed Korean explanation of the user's request or context>
<Detailed Korean explanation of the actions taken to address it>
```

## Guardrails

- Do not write the title in multiple lines.
- Do not write the body in English.
- Do not omit the `#<number>` prefix from the title when the Redmine or JIRA work item number is known.
- Do not omit the user-request context when the commit was driven by a conversation.
- Do not use vague body text such as "fix issues" or "apply requested changes."
- Do not describe unrelated changes that are not part of the commit.
