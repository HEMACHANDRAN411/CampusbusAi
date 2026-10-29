/**
 * CampusBus AI - Chatbot Assistant Widget
 * Handles user messaging, Tanglish queries, and async communication with /api/chat.
 */

const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatWindow = document.getElementById('chatWindow');
const btnCloseChat = document.getElementById('btnCloseChat');
const btnClearChat = document.getElementById('btnClearChat');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const chatBadge = document.getElementById('chatBadge');
const quickChips = document.querySelectorAll('.quick-chips .chip');

let isChatOpen = false;

// Initial Welcome Message
const WELCOME_MESSAGE = 
  "🙏 **Vanakkam! Welcome to CampusBus AI Student Assistant.**\n\n" +
  "I am your college bus tracking buddy. You can ask me questions in **English** or **Tanglish**:\n\n" +
  "• `Where is bus 12?` / `Bus 12 enge?`\n" +
  "• `When will Bus 7 arrive?` / `Bus 7 eppo varum?`\n" +
  "• `Chromepet entha bus varum?`\n" +
  "• `List all buses`";

function initChat() {
  // Render initial message
  appendMessage('bot', WELCOME_MESSAGE);

  // Toggle open/close
  chatToggleBtn.addEventListener('click', toggleChat);
  btnCloseChat.addEventListener('click', toggleChat);

  // Clear chat
  btnClearChat.addEventListener('click', () => {
    chatMessages.innerHTML = '';
    appendMessage('bot', WELCOME_MESSAGE);
  });

  // Form submit
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = chatInput.value.trim();
    if (!query) return;

    handleUserMessage(query);
    chatInput.value = '';
  });

  // Suggestion chips
  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (query) {
        if (!isChatOpen) toggleChat();
        handleUserMessage(query);
      }
    });
  });
}

function toggleChat() {
  isChatOpen = !isChatOpen;
  if (isChatOpen) {
    chatWindow.style.display = 'flex';
    if (chatBadge) chatBadge.style.display = 'none';
    setTimeout(() => chatInput.focus(), 150);
  } else {
    chatWindow.style.display = 'none';
  }
}

async function handleUserMessage(userText) {
  // 1. Add user bubble
  appendMessage('user', userText);

  // 2. Add loading indicator
  const loadingId = appendLoadingBubble();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    removeLoadingBubble(loadingId);
    appendMessage('bot', data.reply);
  } catch (err) {
    console.error('Chat error:', err);
    removeLoadingBubble(loadingId);
    appendMessage('bot', '⚠️ Sorry, could not reach the server right now. Please check if the backend is running.');
  }
}

function appendMessage(sender, text) {
  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${sender}`;

  // Format simple markdown: **bold**, `code`, newlines
  let formatted = escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  bubble.innerHTML = `
    <div>${formatted}</div>
    <div class="message-time">${timeStr}</div>
  `;

  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendLoadingBubble() {
  const id = 'loading-' + Date.now();
  const bubble = document.createElement('div');
  bubble.id = id;
  bubble.className = 'message-bubble bot';
  bubble.innerHTML = `<em>Checking live bus data...</em>`;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return id;
}

function removeLoadingBubble(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

document.addEventListener('DOMContentLoaded', initChat);
