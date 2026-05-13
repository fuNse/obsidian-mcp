# Obsidian MCP Server

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that enables AI assistants to interact with Obsidian vaults, providing tools for reading, creating, editing and managing notes and tags.

## Features

- Read and search notes in your vault
- Create new notes and directories
- Edit existing notes
- Move and delete notes
- Manage tags (add, remove, rename)
- Search vault contents

## Requirements

- Node.js 20 or higher
- An Obsidian vault
- MCP supported IDE (tried on antigravity, vscode and cursor. Cursor is best among the three)

## Install

```bash
# Clone the repository
git clone https://github.com/fuNse/obsidian-mcp
cd obsidian-mcp

# Install dependencies
npm install

# Build
npm run build
```

Then add to your IDE configuration:

```json
{
    "mcpServers": {
        "obsidian": {
            "command": "node",
            "args": ["<path to your mcp server dir>/build/main.js", "<path to your obsidian vault>", "<path to your second obsidian vault, if needed>"]
        }
    }
}
```

Replace `<path to your obsidian vault>` with the absolute path to your Obsidian vault. For example:


```json
"C:/obsidian vaults/<name of vault>"
```

Restart IDE after saving the configuration. You should see the green light appear, indicating the server is connected.

## Available Tools

- `read-note` - Read the contents of a note
- `create-note` - Create a new note
- `edit-note` - Edit an existing note
- `delete-note` - Delete a note
- `move-note` - Move a note to a different location
- `create-directory` - Create a new directory
- `search-vault` - Search notes in the vault
- `add-tags` - Add tags to a note
- `remove-tags` - Remove tags from a note
- `rename-tag` - Rename a tag across all notes
- `manage-tags` - List and organize tags
- `list-available-vaults` - List all available vaults (helps with multi-vault setups)

## Security

This server requires access to your Obsidian vault directory. When configuring the server, make sure to:

- Only provide access to your intended vault directory
- Review tool actions before approving them