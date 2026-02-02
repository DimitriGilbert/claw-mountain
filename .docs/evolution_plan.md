# Molt Swarm Evolution Plan

This document outlines the roadmap for evolving the Molt ecosystem into a robust, OS-integrated fleet.

## Reference Documentation
**CRITICAL:** Before implementing any phase, consult these specific technical docs created from OpenClaw research:
*   **Payloads & Scheduling:** [`.docs/openclaw/cron_and_scheduling.md`](./openclaw/cron_and_scheduling.md) - Contains the *exact* JSON schema for "Isolated Sessions" used in Phase 2.
*   **Configuration & Paths:** [`.docs/openclaw/configuration.md`](./openclaw/configuration.md) - Details env vars (`OPENCLAW_CONFIG_PATH`) and config structure.
*   **Hooks & Webhooks:** [`.docs/openclaw/hooks_and_webhooks.md`](./openclaw/hooks_and_webhooks.md) - Details the Webhook ingress endpoints and authentication.

**Core Principles:**
1.  **CLI-First:** The CLI (`clmnt`) is the engine; everything else (UI, Systemd) wraps it.
2.  **OS-Native Automation:** Use `systemd` (Services & Path Units) for process management and triggers. No polling scripts.
3.  **Strict Pathing:** All paths must be relative to the project root.
4.  **OpenClaw Standards:** Use native OpenClaw API patterns (Isolated Sessions) for tasks.

---

## Phase 1: Robust Process Management (Systemd Services)
**Objective:** robustly manage molts as OS services.

*   **Prerequisite:** Register `daemonize` subcommand in `.scripts/molt` by updating:
    1.  The `@parseArger` declaration (add `--one-of "daemonize"`).
    2.  **The `_one_of_arg_action` array** (add `"daemonize"`).
    3.  **The `print_help` function** (add to usage/help text).
    *   *Note: This is required because `@parseArger` comments are passive; the Bash code (90% of the logic) must be updated manually or via the tool.*
*   **Tool:** `.scripts/_molt/daemonize`
*   **Mechanism:**
    *   Generates `~/.config/systemd/user/molt-<name>.service`.
    *   **Unit Configuration:**
        *   `Type=forking`
        *   `WorkingDirectory=[absolute_project_root]`
        *   `ExecStart=[absolute_project_root]/clmnt molt start <name>`
        *   `PIDFile=[absolute_project_root]/<name>/.openclaw/gateway.pid`
        *   `Restart=always`
*   **Result:** Auto-restart, boot persistence, standard logging (`journalctl --user -u molt-<name>`).

---

## Phase 2: Native Dropzone (Systemd Path Units)
**Objective:** "Drag & Drop" interaction **without** running any background scripts/watchers.

*   **Prerequisite:** Register `dropzone-setup` subcommand in `.scripts/molt` by updating:
    1.  The `@parseArger` declaration (add `--one-of "dropzone-setup"`).
    2.  **The `_one_of_arg_action` array** (add `"dropzone-setup"`).
    3.  **The `print_help` function** (add to usage/help text).
*   **Tool:** `.scripts/_molt/dropzone-setup`
*   **Mechanism:**
    *   **Unit 1: Path Monitor** (`molt-<name>-dropzone.path`)
        *   `PathChanged=[project_root]/.dropzone/<name>/`
        *   Triggers the service unit below.
    *   **Unit 2: One-Shot Service** (`molt-<name>-dropzone.service`)
        *   `Type=oneshot`
        *   Executes a script that finds the new file and POSTs to the OpenClaw Gateway.
*   **Payload Specification (Isolated Session):**
    To ensure the dropzone task runs in the background without polluting the main chat, the `curl` payload must use the **Isolated Session** pattern found in OpenClaw docs:
    ```json
    {
      "name": "Dropzone File",
      "sessionTarget": "isolated",
      "wakeMode": "now",
      "payload": {
        "kind": "agentTurn",
        "message": "A file was dropped at: [file_path]. Please analyze it.",
        "deliver": false
      },
      "isolation": {
        "postToMainPrefix": "Dropzone",
        "postToMainMode": "summary"
      }
    }
    ```
*   **Benefit:** Zero CPU usage when idle. Native OS event handling.

---

## Phase 3: The Dashboard & Switchboard (TypeScript)
**Objective:** A visual registry and "Multi-Executor" router.

### 1. The Switchboard (Backend Router)
*   **Location:** `.dashboard/server` (Bun + Elysia)
*   **Role:** The central nervous system.
*   **Capabilities:**
    *   **Multi-Exec:** `POST /api/broadcast` -> Iterates active molts and calls their Webhook API.
    *   **Routing:** `POST /api/message` -> Routes inter-agent messages.
    *   **Discovery:** Parses `molts/*/openclaw.json` to auto-discover ports and tokens.

### 2. The Dashboard (Frontend UI)
*   **Location:** `.dashboard/client` (React)
*   **Role:** Visual control plane.
*   **Prerequisite:** Add `--json` output flag to `.scripts/_molt/list`.
*   **Features:**
    *   **Fleet Status:** Visualization of `clmnt molt list --json`.
    *   **Global Input:** Sends commands to Switchboard.
    *   **Deep Links:** Links to individual molt dashboards (`http://localhost:<port>`).

---

**Execution Order:**
1.  **Systemd Services:** Foundation for stability (requires parent CLI registration).
2.  **Systemd Dropzones:** Native input mechanism (requires parent CLI registration and Phase 1).
3.  **CLI JSON Support:** Add `--json` to `list` command for dashboard compatibility.
    *   Update `@parseArger` declaration (add `flag json "Output in JSON format"`).
    *   Update `_arg_json` initialization.
    *   Update `parse_commandline` to handle the flag.
    *   Update `print_help` to show the option.
4.  **Switchboard/Dashboard:** The unified control layer.