---
title: How do students share a Project?
label: wayfinder:grilling
status: closed
blocked_by: [051]
assignee: claude
---

## Question

With no accounts and no server, a Project travels as its Export file: one `.json` with the Project and its images ([Where do Projects with images live?](051-project-storage.md)). Is that file also how students share a Project with a friend or a teacher, or is something more wanted (a link with the Project packed in, a play-only view without the code, a gallery)? Cover: what the receiver can do (play, read the code, remix as a new Project), whether a shared Project can be opened by someone who hasn't unlocked Sandbox, size limits for any link form, and what sharing means for the Course (sharing Lesson code, or Sandbox only).

## Resolution

**The Export file is the only way to share; the receiver gets an ordinary new Project; Sandbox only.**

- **The file is the share**: a student shares by sending `<name>.learn-dev.json` (chat, email, USB, class drive). No link with the Project packed in (a Project with own sprites reaches 2 MB, too long for chat apps), no gallery (needs a server), no play-only page.
- **Receiver gets a full copy**: opening the file is the existing Import ("+ New → From a file…" or dropping it on the Sandbox menu). It becomes the receiver's own new Project to play, read and change; the sender's copy is never touched. No read-only mode, no record of who sent it.
- **Before Sandbox unlocks**: 💾 Saves → Import (and dropping a file on the menu) accepts both a backup and a single Project, told apart by the file's `format`. A single Project is stored now with "Saved. This is a Sandbox Project; you'll find it in Sandbox after Lesson 15." and simply sits in the carousel once Sandbox unlocks, with no extra marking.
- **Sandbox only**: there is no Export of one Lesson's code; showing Lesson code is copy and paste. Importing someone else's Export everything still works (it merges and never overwrites) but is never presented as sharing.
- **Finding it**: no Share button. Export's tooltip says "Save this Project as a file: to keep, or to send to a friend."; 📖 Docs has one line: "Share a Project: Export it and send the file. Your friend opens it with + New → From a file…."
- **Dev unlock**: in the dev build only (`import.meta.env.DEV`, absent from production), the menu has a labelled toggle "DEV: Unlock Sandbox / Lock Sandbox". It sets a separate `dev:sandbox-unlocked` flag in localStorage, never marks Lesson 15 passed, is never exported, and skips the "🔓 Sandbox unlocked" toast and slide. Locking again hides Sandbox but keeps its Projects.
