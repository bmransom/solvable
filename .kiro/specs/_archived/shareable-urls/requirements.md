# Requirements Document

## Introduction

Shareable URLs enable users to share LP models as links with zero backend infrastructure. The model is encoded in the URL fragment (hash), so no server-side storage is needed. This is critical for classroom use — an instructor can distribute a model to students via a link, and students can share their work with each other.

**Depends on**: solver-ui (editor, toolbar)

## Requirements

### Requirement 1: Encode models in the URL

**User Story:** As an instructor, I want to share an LP model with my students via a URL, so that they can open it directly in their browser and start experimenting without any setup.

#### Acceptance Criteria

1. WHEN the user clicks a Share button THE SYSTEM SHALL encode the current editor contents into the URL fragment and copy the URL to the clipboard
2. WHEN a user opens a URL with a model encoded in the fragment THE SYSTEM SHALL decode the model and load it into the editor
3. WHEN encoding a model THE SYSTEM SHALL compress it to keep URLs reasonably short (under 2000 characters for typical models)
4. WHEN a URL contains an invalid or corrupted fragment THE SYSTEM SHALL fall back to the default example model and show a brief warning
5. WHEN encoding a model THE SYSTEM SHALL include a version prefix in the fragment (e.g., `v1,`) so that future format changes can detect and handle old URLs gracefully

### Requirement 2: User feedback on sharing

**User Story:** As a user sharing a model, I want confirmation that the URL was copied, so that I know I can paste it.

#### Acceptance Criteria

1. WHEN the URL is successfully copied to the clipboard THE SYSTEM SHALL show a brief toast notification confirming the copy
2. WHEN clipboard access is denied by the browser THE SYSTEM SHALL display the URL in a selectable text field so the user can copy it manually
