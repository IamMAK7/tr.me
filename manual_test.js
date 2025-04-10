// Manual test checklist for Trivia App

// 1. Environment Setup
// - Start the development server: npm run dev
// - Access the application at http://localhost:3000

// 2. Database Setup
// - Reset the database: wrangler d1 execute DB --local --file=migrations/0001_initial.sql
// - Verify database tables are created correctly

// 3. Home Page Testing
// - Verify the home page loads correctly
// - Test room creation functionality:
//   * Enter room name and host name
//   * Create room and verify redirection to host page
// - Test room joining functionality:
//   * Enter valid room code and guest name
//   * Join room and verify redirection to guest page
// - Test validation:
//   * Try creating room without required fields
//   * Try joining room with invalid room code

// 4. Host Interface Testing
// - Verify theme selection works
// - Verify questions load when theme is selected
// - Test question selection:
//   * Select a question and verify it becomes active
//   * Clear question and verify it's removed
// - Test participant list:
//   * Verify host appears in the list
//   * Verify guests appear when they join
// - Test buzzer events:
//   * Verify buzzer events appear in order
//   * Test awarding points to users
// - Test scoring:
//   * Verify scores update correctly
//   * Verify all users can see updated scores

// 5. Guest Interface Testing
// - Verify current question appears when selected by host
// - Test buzzer functionality:
//   * Press buzzer and verify it's disabled after pressing
//   * Verify host sees the buzz event
// - Verify score updates when points are awarded
// - Verify participant list shows all users

// 6. WebSocket Testing
// - Verify real-time updates work:
//   * New question selection
//   * Buzzer events
//   * Score updates
// - Test with multiple browser windows/devices simultaneously
// - Test reconnection behavior

// 7. Mobile Responsiveness Testing
// - Test on various screen sizes:
//   * Desktop
//   * Tablet
//   * Mobile phone
// - Verify all interfaces are usable on small screens
// - Test touch interactions for buzzer

// 8. Error Handling
// - Test invalid API requests
// - Test WebSocket disconnection and reconnection
// - Verify appropriate error messages are displayed

// 9. Performance Testing
// - Test with multiple simultaneous users
// - Verify buzzer timing accuracy
// - Check page load times

// 10. Browser Compatibility
// - Test on different browsers:
//   * Chrome
//   * Firefox
//   * Safari
//   * Edge
