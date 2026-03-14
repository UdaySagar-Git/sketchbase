// Auth
export const MSG_ENTER_WORKSPACE_KEY = "Please enter a workspace key";
export const MSG_WORKSPACE_REQUIRES_PASSWORD = "This workspace requires a password";
export const MSG_INCORRECT_PASSWORD = "Incorrect password";
export const MSG_CURRENT_PASSWORD_REQUIRED = "Current password is required";
export const MSG_CURRENT_PASSWORD_INCORRECT = "Current password is incorrect";
export const MSG_PASSWORD_UPDATED = "Password updated";
export const MSG_PASSWORD_REMOVED = "Password removed — workspace is now open access";

// Validation
export const MSG_PROJECT_NAME_REQUIRED = "Project name is required";
export const MSG_BOARD_NAME_REQUIRED = "Board name is required";

// Confirmations
export const confirmDeleteBoard = (name: string) => `Delete "${name}"?`;
export const confirmDeleteProject = (name: string) => `Delete "${name}" and all its boards?`;
export const MSG_CONFIRM_DELETE_WORKSPACE =
  "Are you sure? This will permanently delete your workspace, all projects, and all boards. This cannot be undone.";

// Save status
export const MSG_SAVING = "Saving...";
export const MSG_SAVED = "Saved";
export const MSG_SAVE_FAILED = "Save failed";
export const MSG_LAST_SAVED = "Last saved";
