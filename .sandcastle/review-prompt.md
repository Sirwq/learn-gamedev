# Task

You are the review agent. Another agent just finished one ticket. Review its commits and fix what is really wrong.

## Commits to review

!`git log --oneline {{RANGE}}`

## Diff

!`git diff {{RANGE}}`

# Review

1. Review the range `{{RANGE}}` in this order: correct, safe, tested, fast, lean (every line needed, no abstraction nobody asked for).
2. Read the ticket the commits closed (in `.wayfinder/tickets/`) and the spec tickets it links. Check the change does what its **Done when** says.
3. Read the code the diff touches, not only the diff: callers, tests, the functions it calls.

# Fix

- Fix only real findings: bugs, missed **Done when** items, missing tests for risky logic, and code that can be deleted without losing behaviour. Leave style nitpicks alone.
- Don't change what the code does unless it's a bug, and don't start the next ticket.
- Run `npm run typecheck` and `npm run test`. Both must pass.
- Every finding you don't fix (too big, or an edge case you left alone) goes in the ticket file under `## Review follow-up`.
- Commit all your changes in one commit starting with `RALPH: review:` that lists each finding and what you did about it. Only uncommitted work is lost when you stop, so run `git status` and leave it clean. Skip the commit only if you found nothing at all.

When done, output:

<promise>COMPLETE</promise>
