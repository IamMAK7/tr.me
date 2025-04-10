// Test script for the Trivia App
// This script tests the main functionality of the application

// Import required modules
const fetch = require('node-fetch');
const WebSocket = require('ws');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_BASE_URL = `${BASE_URL}/api`;

// Test functions
async function testThemeAPI() {
  console.log('\n--- Testing Theme API ---');
  
  // Get all themes
  console.log('Getting all themes...');
  const themesResponse = await fetch(`${API_BASE_URL}/themes`);
  const themes = await themesResponse.json();
  console.log(`Found ${themes.length} themes`);
  
  // Create a new theme
  console.log('Creating a new theme...');
  const newThemeResponse = await fetch(`${API_BASE_URL}/themes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Theme', description: 'A theme for testing' })
  });
  const newTheme = await newThemeResponse.json();
  console.log(`Created theme with ID: ${newTheme.id}`);
  
  return themes;
}

async function testQuestionAPI(themeId) {
  console.log('\n--- Testing Question API ---');
  
  // Get questions for a theme
  console.log(`Getting questions for theme ID: ${themeId}...`);
  const questionsResponse = await fetch(`${API_BASE_URL}/questions?themeId=${themeId}`);
  const questions = await questionsResponse.json();
  console.log(`Found ${questions.length} questions for the theme`);
  
  // Create a new question
  console.log('Creating a new question...');
  const newQuestionResponse = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      themeId,
      questionText: 'What is the capital of France?',
      answerText: 'Paris',
      difficulty: 1
    })
  });
  const newQuestion = await newQuestionResponse.json();
  console.log(`Created question with ID: ${newQuestion.id}`);
  
  return questions;
}

async function testRoomAPI() {
  console.log('\n--- Testing Room API ---');
  
  // Create a new room
  console.log('Creating a new room...');
  const newRoomResponse = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Room' })
  });
  const newRoom = await newRoomResponse.json();
  console.log(`Created room with ID: ${newRoom.id} and code: ${newRoom.roomCode}`);
  
  // Get room by code
  console.log(`Getting room by code: ${newRoom.roomCode}...`);
  const roomResponse = await fetch(`${API_BASE_URL}/rooms?code=${newRoom.roomCode}`);
  const room = await roomResponse.json();
  console.log(`Found room: ${room.name}`);
  
  return newRoom;
}

async function testUserAPI(roomId) {
  console.log('\n--- Testing User API ---');
  
  // Create a host user
  console.log('Creating a host user...');
  const hostResponse = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: `host_${Date.now()}`,
      displayName: 'Test Host',
      isHost: true,
      roomId
    })
  });
  const host = await hostResponse.json();
  console.log(`Created host user with ID: ${host.id}`);
  
  // Create a guest user
  console.log('Creating a guest user...');
  const guestResponse = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: `guest_${Date.now()}`,
      displayName: 'Test Guest',
      isHost: false,
      roomId
    })
  });
  const guest = await guestResponse.json();
  console.log(`Created guest user with ID: ${guest.id}`);
  
  // Get users in room
  console.log(`Getting users in room ID: ${roomId}...`);
  const usersResponse = await fetch(`${API_BASE_URL}/users?roomId=${roomId}`);
  const users = await usersResponse.json();
  console.log(`Found ${users.length} users in the room`);
  
  return { host, guest };
}

async function testQuestionSelection(roomId, questionId) {
  console.log('\n--- Testing Question Selection ---');
  
  // Update room's current question
  console.log(`Setting current question for room ID: ${roomId} to question ID: ${questionId}...`);
  const updateResponse = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, questionId })
  });
  const updateResult = await updateResponse.json();
  console.log(`Update result: ${updateResult.success ? 'Success' : 'Failed'}`);
  
  // Get room with current question
  console.log(`Getting room ID: ${roomId} with current question...`);
  const roomResponse = await fetch(`${API_BASE_URL}/rooms?id=${roomId}`);
  const roomData = await roomResponse.json();
  console.log(`Current question: ${roomData.currentQuestion ? roomData.currentQuestion.question_text : 'None'}`);
  
  return roomData;
}

async function testBuzzerAPI(roomId, userId, questionId) {
  console.log('\n--- Testing Buzzer API ---');
  
  // Record a buzz
  console.log(`Recording buzz for user ID: ${userId} in room ID: ${roomId} for question ID: ${questionId}...`);
  const buzzerResponse = await fetch(`${API_BASE_URL}/buzzer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId, questionId })
  });
  const buzzerResult = await buzzerResponse.json();
  console.log(`Recorded buzz with ID: ${buzzerResult.id}`);
  
  // Get buzzer events for question
  console.log(`Getting buzzer events for room ID: ${roomId} and question ID: ${questionId}...`);
  const eventsResponse = await fetch(`${API_BASE_URL}/buzzer?roomId=${roomId}&questionId=${questionId}`);
  const events = await eventsResponse.json();
  console.log(`Found ${events.length} buzzer events`);
  
  return events;
}

async function testScoringAPI(roomId, userId, questionId) {
  console.log('\n--- Testing Scoring API ---');
  
  // Record a score
  console.log(`Recording score for user ID: ${userId} in room ID: ${roomId} for question ID: ${questionId}...`);
  const scoreResponse = await fetch(`${API_BASE_URL}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, userId, questionId, points: 2 })
  });
  const scoreResult = await scoreResponse.json();
  console.log(`Recorded score with ID: ${scoreResult.id} and ${scoreResult.points} points`);
  
  // Get scores for room
  console.log(`Getting scores for room ID: ${roomId}...`);
  const scoresResponse = await fetch(`${API_BASE_URL}/scores?roomId=${roomId}`);
  const scores = await scoresResponse.json();
  console.log(`Found scores for ${scores.length} users`);
  
  return scores;
}

async function testWebSocketConnection(roomCode) {
  console.log('\n--- Testing WebSocket Connection ---');
  
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:3000/api/ws?roomCode=${roomCode}`);
    
    ws.on('open', () => {
      console.log('WebSocket connection established');
      
      // Send a test message
      const message = {
        type: 'test',
        data: { message: 'Hello WebSocket!' }
      };
      ws.send(JSON.stringify(message));
      console.log('Sent test message');
    });
    
    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message);
      
      // Close the connection after receiving a message
      ws.close();
      console.log('WebSocket connection closed');
      resolve(true);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      resolve(false);
    });
  });
}

// Main test function
async function runTests() {
  console.log('=== Starting Trivia App Tests ===');
  
  try {
    // Test theme API
    const themes = await testThemeAPI();
    const themeId = themes[0].id;
    
    // Test question API
    const questions = await testQuestionAPI(themeId);
    const questionId = questions[0].id;
    
    // Test room API
    const room = await testRoomAPI();
    
    // Test user API
    const { host, guest } = await testUserAPI(room.id);
    
    // Test question selection
    await testQuestionSelection(room.id, questionId);
    
    // Test buzzer API
    await testBuzzerAPI(room.id, guest.id, questionId);
    
    // Test scoring API
    await testScoringAPI(room.id, guest.id, questionId);
    
    // Test WebSocket connection
    await testWebSocketConnection(room.roomCode);
    
    console.log('\n=== All tests completed successfully ===');
  } catch (error) {
    console.error('\n=== Test failed ===');
    console.error(error);
  }
}

// Run the tests
runTests();
