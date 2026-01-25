# Kids Games - Staging Area

This folder is a staging area for setting up the kids-games GitHub repo.

## Step 1: Copy Artifact Code from Claude.ai

You need to manually copy the artifact code from each of these Claude.ai chats into the corresponding files in the `games/` folder:

| Game | Source Chat | Target File |
|------|-------------|-------------|
| Penguin Maze | https://claude.ai/chat/ee4b200a-0c7b-4d89-a616-1c74668fed97 | games/penguin-maze.jsx |
| Six vs Nine | https://claude.ai/chat/9714b6f0-1c37-4faa-bbc8-2c5235253b4b | games/six-vs-nine.jsx |
| Time Practice | https://claude.ai/chat/71005d4f-ac20-451a-a2af-a29c1d0c640e | games/time-practice.jsx |
| Memory Game | https://claude.ai/chat/08e58326-d54b-4e67-acc5-347e32c04b22 | games/memory-game.html |

**How to copy:**
1. Open each chat link
2. Find the artifact (the interactive game preview)
3. Click the "Code" tab or download button to see the full source
4. Copy the entire content
5. Save to the corresponding file in `games/`

Note: Penguin Maze, Six vs Nine, and Time Practice are React JSX artifacts. Memory Game was already converted to standalone HTML.

## Step 2: Hand off to Claude Code

Once you've copied the artifact code, paste the CLAUDE_CODE_PROMPT.md contents into Claude Code to finish the setup.
