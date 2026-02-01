# Molt Swarm Evolution Plan

This document outlines the roadmap for evolving the Molt ecosystem.

**Core Principles:**
1.  **CLI-First:** The CLI (`clmnt`) remains the engine.
2.  **OS-Native Automation:** Use `systemd` features (Services & Path Units) instead of fragile scripts.
3.  **TypeScript Interface:** A unified `.dashboard` app for visualization and routing.
4.  **Strict Pathing:** All paths relative to project root.

---

## Phase 1: Robust Process Management (Systemd Services)
**Objective:** robustly manage molts as OS services.

*   **Tool:** `.scripts/_molt/daemonize`
*   **Mechanism:**
    *   Generates `~/.config/systemd/user/molt-<name>.service`.
    *   **Dynamic Pathing:** Injects the *current* project root path into the unit file.
*   **Result:** Auto-restart, boot persistence, standardized logging (`journalctl`).

---

## Phase 2: Native Dropzone (Systemd Path Units)
**Objective:** "Drag & Drop" interaction **without** running any background scripts/watchers.

*   **Tool:** `.scripts/_molt/dropzone-setup`
*   **Mechanism:**
    *   Generates a `systemd.path` unit: `molt-<name>-dropzone.path`.
    *   Watches `[project_root]/.dropzone/<name>/`.
    *   When a file appears, Systemd *instantly* triggers a one-shot service that:
        1.  Pushes the file path to the molt's Webhook.
        2.  Cleans up the file.
*   **Benefit:** Zero CPU usage when idle. Pure OS-level integration.

---

## Phase 3: The Dashboard & Switchboard (TypeScript)
**Objective:** A visual registry and "Multi-Executor" router.

### 1. The Switchboard (Backend Router)
*   **Location:** `.dashboard/server` (Bun + Elysia)
*   **Role:** The central nervous system.
*   **Capabilities:**
    *   **Multi-Exec:** `POST /api/broadcast` -> Triggers all molts.
    *   **Routing:** `POST /api/message` -> Allows Molt A to send data to Molt B (Inter-agent exchange).
    *   The Switchboard simply calls the underlying CLI / Webhooks.

### 2. The Dashboard (Frontend UI)
*   **Location:** `.dashboard/client` (React)
*   **Role:** Visual control plane.
*   **Features:**
    *   Fleet status (parsing `clmnt molt list --json`).
    *   Global input box (sends to Switchboard).
    *   Links to individual molt interfaces.

---

**Execution Order:**
1.  **Systemd Services:** Foundation for stability.
2.  **Systemd Dropzones:** Native input mechanism.
3.  **Switchboard/Dashboard:** The unified control layer.
