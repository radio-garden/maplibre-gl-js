/**
 * This file registers all default handlers for the full MapLibre bundle.
 * For tree-shaking, import individual handlers instead of this file.
 */

// Low-level handlers
import './handlers/mouse-rotate';
import './handlers/mouse-pitch';
import './handlers/mouse-roll';
import './handlers/mouse-pan';
import './handlers/touch-pan';
import './handlers/click-zoom';
import './handlers/tap-zoom';
import './handlers/touch-rotate';
import './handlers/touch-zoom';

// Composite handlers
import './handlers/box-zoom';
import './handlers/cooperative-gestures';
import './handlers/double-click-zoom';
import './handlers/tap-drag-zoom';
import './handlers/touch-pitch';
import './handlers/drag-rotate';
import './handlers/drag-pan';
import './handlers/touch-zoom-rotate';
import './handlers/scroll-zoom';
import './handlers/keyboard';
