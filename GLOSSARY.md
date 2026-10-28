# Glossary

**Course**: An ordered list of Lessons that teaches one programming language.

**Lesson**: One step in a Course. The student writes code to add exactly one Mechanic to the game.

**Mechanic**: One thing the character or game can do, e.g. move, jump, shoot, collide.

**Check**: An automatic test that watches the game while the student plays and sees when a Goal is met.

**Goal**: Something the student must achieve in the level using the Lesson's Mechanic, e.g. reach the flag or destroy all enemies. A Lesson passes when all its Goals are met.

**Lose event**: Something in the level that stops the game and makes the student try again, e.g. falling off the screen or touching an enemy.

**Explanation**: The teaching text that comes with a Lesson. It introduces the concept and points out how the code differs from Unity C#.

**Script**: One code file the student edits, such as Player or Bullet. It defines one behaviour attached to a game object.

**Reference code**: A known-good version of a Script, unlocked after the student passes the Lesson that Script belongs to. The student can load it to replace their own.

**Level**: The starting layout of game objects for a Lesson, such as walls, platforms, a flag and enemies. Each Lesson has exactly one Level.

**Console**: The panel where the student's log messages and runtime errors appear while the game runs.

**Sandbox mode**: Using the engine on its own, without Lessons or Goals.

**AI tutor**: The built-in assistant that helps a stuck student with hints and explanations, never with the solution.

**Achievement**: A reward the student earns once, for doing something for the first time in the game (like a first jump) or for passing a Lesson. Shown on the achievement map.

**Tutor prompt**: The text the student copies to an outside AI chat when stuck. It holds the tutor rules, the current Lesson and the student's code, and asks for hints, never the solution. Unlike the AI tutor, it lives outside the app.
