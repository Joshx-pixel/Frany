Improve accessibility: keyboard navigation, focus management, and aria updates

This PR applies a set of small, low-risk accessibility improvements:

- Make message cards programmatically focusable so assistive technologies notice message changes.
- Add keyboard navigation: ArrowRight / Space to advance messages or start the celebration; ArrowLeft to go back; Enter to start the celebration.
- Update the play/pause control to expose state with aria-pressed and aria-label updates.
- Mark decorative images as aria-hidden and role="presentation", and add loading="lazy".
- Add visible focus styles for message cards (.message-box) to help keyboard users.

Manual testing suggestions:
- Verify keyboard navigation (Arrow keys, Space, Enter) and that focus moves to the active message without page jump.
- Test with a screen reader (NVDA or VoiceOver) — ensure message changes are announced.
- Verify audio playback behavior in Chrome/Firefox (browsers may block autoplay until user interacts).

