import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleGenAI } from '@google/genai';

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Chat Widget Button -->
    <div class="chat-widget" [class.expanded]="isExpanded">
      <!-- Collapsed State Button -->
      <div class="chat-button" (click)="toggleChat()" *ngIf="!isExpanded">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                fill="currentColor"/>
          <circle cx="8" cy="11" r="1" fill="white"/>
          <circle cx="12" cy="11" r="1" fill="white"/>
          <circle cx="16" cy="11" r="1" fill="white"/>
        </svg>
      </div>

      <!-- Expanded Chat Window -->
      <div class="chat-window" *ngIf="isExpanded">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="header-content">
            <div class="bot-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V7H21V9Z"
                      fill="currentColor"/>
              </svg>
            </div>
            <div class="header-text">
              <h3>شات AI</h3>
              <p>أسال عن اي شي!</p>
            </div>
          </div>
          <button class="close-button" (click)="toggleChat()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12Z"
                    fill="currentColor"/>
            </svg>
          </button>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" #messagesContainer>
          <div class="welcome-message" *ngIf="messages.length === 0">
            <div class="bot-avatar">🤖</div>
            <div class="message-content">
              <p>اهلا بك كيف يمكنني مساعدتك؟</p>
            </div>
          </div>

          <div class="message"
               *ngFor="let message of messages"
               [class.user-message]="message.isUser"
               [class.bot-message]="!message.isUser">
            <div class="message-avatar" *ngIf="!message.isUser">🤖</div>
            <div class="message-content">
              <p [innerHTML]="message.content"></p>
              <span class="message-time">{{formatTime(message.timestamp)}}</span>
            </div>
            <div class="message-avatar" *ngIf="message.isUser">👤</div>
          </div>

          <div class="message bot-message" *ngIf="isLoading">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="chat-input">
          <div class="input-container">
            <input
              type="text"
              [(ngModel)]="currentMessage"
              (keypress)="onKeyPress($event)"
              placeholder="Type your message..."
              [disabled]="isLoading"
              #messageInput>
            <button
              (click)="sendMessage()"
              [disabled]="!currentMessage.trim() || isLoading"
              class="send-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12 2.01 3 2 10L17 12 2 14L2.01 21Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .chat-button {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      color: white;
      transition: all 0.3s ease;
    }

    .chat-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .chat-window {
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chat-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bot-avatar {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-text h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .header-text p {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
    }

    .close-button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .close-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8fafc;
    }

    .welcome-message {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .welcome-message .bot-avatar {
      width: 32px;
      height: 32px;
      background: #e2e8f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .welcome-message .message-content {
      background: white;
      padding: 12px;
      border-radius: 12px;
      border-top-left-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      flex: 1;
    }

    .welcome-message .message-content p {
      margin: 0;
      color: #374151;
      line-height: 1.5;
    }

    .message {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      background: #e2e8f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .user-message .message-avatar {
      background: #667eea;
      color: white;
    }

    .message-content {
      max-width: 70%;
      padding: 12px;
      border-radius: 12px;
      position: relative;
    }

    .bot-message .message-content {
      background: white;
      border-top-left-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .user-message {
      flex-direction: row-reverse;
    }

    .user-message .message-content {
      background: #667eea;
      color: white;
      border-top-right-radius: 4px;
    }

    .message-content p {
      margin: 0 0 4px 0;
      line-height: 1.4;
    }

    .message-time {
      font-size: 11px;
      opacity: 0.6;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .typing-indicator span {
      width: 6px;
      height: 6px;
      background: #9ca3af;
      border-radius: 50%;
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(1) {
      animation-delay: 0s;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.5;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }

    .chat-input {
      padding: 16px;
      background: white;
      border-top: 1px solid #e2e8f0;
    }

    .input-container {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .input-container input {
      flex: 1;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: 20px;
      outline: none;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .input-container input:focus {
      border-color: #667eea;
    }

    .input-container input:disabled {
      background: #f9fafb;
      opacity: 0.7;
    }

    .send-button {
      width: 40px;
      height: 40px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .send-button:hover:not(:disabled) {
      background: #5a67d8;
      transform: scale(1.05);
    }

    .send-button:disabled {
      background: #d1d5db;
      cursor: not-allowed;
      transform: none;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .chat-widget {
        bottom: 10px;
        right: 10px;
      }

      .chat-window {
        width: calc(100vw - 20px);
        height: calc(100vh - 100px);
        max-width: 350px;
        max-height: 500px;
      }
    }

    /* Custom scrollbar */
    .chat-messages::-webkit-scrollbar {
      width: 4px;
    }

    .chat-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 4px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
  `]
})
export class AiChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  isExpanded = false;
  currentMessage = '';
  messages: ChatMessage[] = [];
  isLoading = false;

  private genAI: GoogleGenAI;
  private readonly API_KEY = ''; // <-------- API KEY HERE

  // FAQ and support information
  private readonly FAQ_CONTEXT = `
    You are a helpful AI assistant for our web application. You are going to be getting questions in arabic and will also answer them in arabic. Here's important information about our app:

    FREQUENTLY ASKED QUESTIONS:

    Q: How do I create an account?
    A: Click the button in the top left corner, fill in your email and password, then verify your email address.

    Q: How do I reset my password?
    A: Click "Forgot Password" on the login page, enter your email, and follow the reset instructions sent to your inbox.

    Q: What payment methods do you accept?
    A: We accept Vodaphone cash payments only.

    Q: How do I cancel my subscription?
    A: Go to Account Settings > Subscription > Cancel Subscription. Your access will continue until the end of your billing period.

    Q: Is my data secure?
    A: Yes we are the only party with access to the data you provided.

    Q: How do I export my data?
    A: Go to Account Settings > Data Export and choose your preferred format (JSON, CSV, PDF).

    Q: How do I contact Mr.Nader?
    A: You cannot contact him directly. rather contact the support team.

    SUPPORT CONTACT INFORMATION:
    - Email: mahmood@mail.com
    - Phone: 01149122568
    - Live Chat: Available on our website during business hours
    - Help Center: help.basit.com

    Please provide helpful, accurate answers about our app and direct users to the appropriate support channels when needed.
    Keep responses concise but friendly. If you don't know something specific, direct them to our support team.

    If you got stuck just direct the user to the support team.
  `;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: this.API_KEY });
  }

  ngOnInit() {
    // Initialize the component
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      // Focus on input when chat opens
      setTimeout(() => {
        if (this.messageInput) {
          this.messageInput.nativeElement.focus();
        }
      }, 100);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading) return;

    const userMessage: ChatMessage = {
      content: this.currentMessage,
      isUser: true,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const messageToSend = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;

    try {
      const response = await this.genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: this.FAQ_CONTEXT + "\n\nUser question: " + messageToSend,
        config: {
          thinkingConfig: {
            thinkingBudget: 0 // Disable thinking for faster responses
          }
        }
      });

      const botMessage: ChatMessage = {
        content: this.formatResponseText(response.text || 'Sorry, I could not process your request.'),
        isUser: false,
        timestamp: new Date()
      };

      this.messages.push(botMessage);
    } catch (error) {
      console.error('Error calling Gemini API:', error);

      const errorMessage: ChatMessage = {
        content: 'Sorry, I\'m experiencing technical difficulties. Please contact our support team at <strong>support@yourapp.com</strong> or call <strong>+1 (555) 123-4567</strong> for immediate assistance.',
        isUser: false,
        timestamp: new Date()
      };

      this.messages.push(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  private formatResponseText(text: string): string {
    // Convert markdown-style formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}