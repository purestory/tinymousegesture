# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a Chrome extension (Manifest V3) called "tiny mouse gesture & etc." that provides mouse gestures, copy protection bypass, and quick search functionality.

### Core Files
- **manifest.json**: Extension manifest with permissions and content script definitions
- **background.js**: Service worker handling extension lifecycle, context menus, and settings
- **popup.html/popup.js**: Extension popup interface for settings management
- **gesture.js**: Mouse gesture implementation for navigation
- **unblock.js**: Copy protection bypass functionality
- **searchModifier.js**: Quick search with custom prefix functionality
- **youtubeControl.js**: YouTube player controls (skip buttons)
- **contentFilter.js**: Content filtering for specific sites (Hitomi.la, Twidouga)
- **hitomiRedirect.js**: URL redirection for Hitomi.la
- **rules.json**: Declarative net request rules for DC Inside URL redirection
- **i18n.js**: Internationalization wrapper (legacy)

### Internationalization System
- **i18n/messages.js**: Custom i18n system with 20+ language support
- Uses custom implementation instead of standard Chrome _locales folder
- Languages: English, Korean, Japanese, Chinese (Simplified/Traditional), Spanish, French, German, Italian, Portuguese, Russian, Arabic, Hindi, Vietnamese, Thai, Indonesian, Turkish, Polish, Dutch, Czech
- Functions: `getMessage()`, `getCurrentLanguage()`, `getAllMessages()`

### Icons and Resources
- **icons/**: Extension icons in 16x16, 48x48, 128x128 sizes (normal and active states)
- **web_accessible_resources**: i18n messages, icons, styles, override.js

## Architecture

### Content Script Architecture
- **Modular Design**: Each feature implemented as separate content script
- **All URLs Matching**: Most scripts run on all websites (`<all_urls>`)
- **Site-Specific Scripts**: YouTube controls, Hitomi.la features with specific matching patterns
- **Run Timing**: 
  - `document_start`: unblock.js, contentFilter.js, hitomiRedirect.js
  - Default: gesture.js, searchModifier.js, youtubeControl.js

### Background Service Worker
- **BackgroundManager Class**: Centralized state and settings management
- **Context Menu System**: Dynamic menu creation with i18n support
- **Storage Management**: Chrome storage API for persistent settings
- **Message Passing**: Runtime message handling between components
- **Icon Management**: Dynamic icon updates based on active state

### Feature Implementation
1. **Mouse Gestures**: Right-click drag left/right for back/forward navigation
2. **Copy Protection Bypass**: Toggleable feature to enable text selection/copying
3. **Quick Search**: Right-click menu search with customizable prefix
4. **YouTube Controls**: Add skip forward/backward buttons with customizable time
5. **DC Inside Redirect**: Auto-redirect mobile DC Inside URLs to desktop version
6. **Content Filtering**: Site-specific content filtering and modifications

## Development Commands

### Extension Development
```bash
# No build process - pure JavaScript/HTML/CSS
# Load unpacked extension in Chrome:
# 1. Go to chrome://extensions/
# 2. Enable Developer Mode
# 3. Click "Load unpacked"
# 4. Select project directory
```

### Testing
- Test in Chrome browser by loading as unpacked extension
- Check console for errors in extension's service worker and content scripts
- Use Chrome DevTools for popup debugging
- Test context menus by right-clicking on web pages

## Settings and Storage

### Chrome Storage Schema
```javascript
{
  searchPrefix: string,          // Custom search prefix
  youtubeSkipTime: number,       // YouTube skip time in seconds (1-60)
  isUnblocked: boolean,          // Copy protection bypass state
  isAdBlockerEnabled: boolean,   // Ad blocker state
  dcRedirectEnabled: boolean     // DC Inside redirect state (default: true)
}
```

### Permissions Required
- **storage**: Local settings persistence
- **contextMenus**: Right-click menu integration
- **tabs**: Navigation and tab management
- **declarativeNetRequest**: URL redirection rules
- **host_permissions**: `*://*/*` for all-site functionality

## Multi-language Support

The extension uses a custom i18n system with comprehensive language support. Key message keys:
- `extensionName`, `extensionDescription`
- `copyProtectionToggle`, `searchPrefixPlaceholder`, `saveButton`
- `youtubeControlText`, `adBlockerText`
- `gestureBack`, `gestureForward`
- Context menu labels for various search options

## Content Security Policy

Extension pages use: `script-src 'self'; object-src 'self'`

## Deployment

1. **Chrome Web Store**: Package extension as .zip file
2. **Manual Installation**: Load unpacked extension in developer mode
3. **Version Management**: Update version in manifest.json for releases

## Key Design Patterns

- **Event-driven Architecture**: Heavy use of Chrome APIs and event listeners
- **Modular Content Scripts**: Feature separation for maintainability
- **Dynamic UI Updates**: Context menus and icons update based on settings
- **Error Handling**: Comprehensive try-catch blocks with console logging
- **Storage Synchronization**: Real-time sync between popup, background, and content scripts