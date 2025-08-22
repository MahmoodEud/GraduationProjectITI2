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
  private readonly API_KEY = 'AIzaSyBSJLAiFOHYYpnLToY7A7bQ0ol-JQmJWIc'; // <-------- API KEY HERE

  // FAQ and support information
  private readonly FAQ_CONTEXT = `
    You are a helpful AI assistant for our web application. You are going to be getting questions in arabic and will also answer them in arabic. Here's important information about our app:

    FREQUENTLY ASKED QUESTIONS:

    Q: How do I create an account?
    A: Click Create Account at the top, enter your email and password, then verify via the confirmation email.

    Q: Do I have to verify my email?
    A: Yes. Your account features unlock after you confirm the link sent to your inbox.

    Q: How do I reset my password?
    A: Click Forgot Password on the login page, enter your email, and follow the instructions sent to you.

    Q: How do I change my password after logging in?
    A: Go to Settings > Security > Change Password and follow the prompts.

    Q: How do I update my email address?
    A: Settings > Personal Info > Edit Email, then confirm using the verification code sent to the new address.

    Q: Can I change my phone number?
    A: Yes. Update it under Settings > Personal Info, then verify using the code we send.

    Q: How do I turn off notifications?
    A: Settings > Notifications to customize or temporarily disable alerts.

    Q: How do I delete my account permanently?
    A: Settings > Account > Delete Account. This disables access and deletes data not required by law.

    Q: How do I export my data?
    A: Go to Settings > Data Export and choose JSON, CSV, or PDF.

    Q: Is my data secure?
    A: We follow a strict privacy policy. Only authorized staff can access your data, and we never share it with third parties except when required by law.

    Q: Do you keep my data after my subscription ends?
    A: We retain only the minimum legally necessary records. You can request deletion from Settings > Account.

    Q: How do I contact Mr. Nader directly?
    A: Direct contact isn’t available. Please contact the support team, and they’ll relay any necessary messages.

    Q: When is support available?
    A: Support hours are listed on the Contact Us page inside your account.

    Q: What channels can I use to reach support?
    A: In‑app chat and email (both listed in Help > Contact Us).

    Q: Where are in‑person classes held?
    A: Beni Suef – Al‑Abasiri Street. The full address and map are in Location inside your account.

    Q: Do you offer online classes as well?
    A: Yes. We have live online groups in addition to in‑person classes.

    Q: Which grades does Mr. Nader teach?
    A: Arabic for 1st, 2nd, and 3rd Secondary only.

    Q: Do you follow the official Ministry curriculum?
    A: Yes. We cover the full syllabus and train on exam‑style questions.

    Q: What Arabic topics are included?
    A: Grammar, rhetoric, literature/texts, reading comprehension, and composition (functional & creative).

    Q: Do you train specifically for exam strategies?
    A: Absolutely—time management, MCQ tactics, and structured answers for essay questions.

    Q: Which platform do you use for online sessions?
    A: Usually Zoom. The meeting link appears in your Student Dashboard before class.

    Q: What are the technical requirements for online classes?
    A: A phone or PC, stable internet, updated browser/Zoom, and headphones are recommended.

    Q: My internet is weak—what can I do?
    A: Close other apps, use wired or stronger Wi‑Fi if possible, and request the session recording when available.

    Q: What happens if there’s a power cut during an in‑person class?
    A: We may extend, reschedule, or offer a makeup option—updates come via the platform.

    Q: What’s the policy on late arrivals?
    A: You may enter quietly. Catch up using the notes or recording (if available).

    Q: Is attendance tracked?
    A: Yes. Please inform support if you expect to be late or absent.

    Q: Are classes recorded?
    A: Some groups are recorded. When available, the playback link appears on your dashboard.

    Q: If I miss a class, can I get a recording?
    A: If that group is recorded, you’ll get a link for a limited time.

    Q: Do you offer a trial class?
    A: Often yes at the start of each group. Check Schedule for upcoming trial dates.

    Q: How many students are in each group?
    A: Small groups for better interaction; exact numbers depend on the specific group.

    Q: Do you offer one‑to‑one tutoring?
    A: Yes, at separate rates and subject to availability.

    Q: What payment methods do you accept?
    A: Vodafone Cash only at the moment.

    Q: Do you accept bank transfer or Fawry?
    A: No. Accepted payments are Vodafone Cash only.

    Q: How do I upload a payment receipt?
    A: Dashboard > Payments > Upload Receipt, then wait for confirmation.

    Q: How long until my subscription is activated after payment?
    A: Shortly after our team reviews your receipt; you’ll see the status in your account.

    Q: What if I pay late?
    A: Access may be paused until payment is completed via Vodafone Cash.

    Q: Can I cancel my subscription?
    A: Before the course starts: full refund. After it starts: no refunds, but you may transfer or freeze per policy.

    Q: Can I transfer my subscription to someone else?
    A: Once, within the first week of the course, subject to admin approval.

    Q: Can I freeze my subscription?
    A: Yes, for a limited period upon approval—contact support.

    Q: Can I switch groups?
    A: One change per term, based on seat availability.

    Q: Can I change from in‑person to online?
    A: Yes, if there’s a seat in the online group and policy conditions are met.

    Q: Can I join a group that already started?
    A: If seats are available. We’ll guide you on catching up.

    Q: Do current students get priority for new seats?
    A: Yes—renewal priority is given before public enrollment opens.

    Q: Where can I see the timetable?
    A: It’s posted weekly in your Student Dashboard > Schedule.

    Q: Do you adjust schedules for Ramadan and holidays?
    A: Yes. We publish a special schedule in advance.

    Q: Is there a yearly academic calendar?
    A: There’s a general plan; detailed timings are updated weekly on the platform.

    Q: Do you run intensive revision camps?
    A: Yes—high‑focus sessions with mock exams before finals.

    Q: Do you offer final review packages?
    A: Yes, targeted revisions with graded question banks.

    Q: Are there on‑demand video packs I can buy?
    A: Sometimes for select topics—we announce availability in the platform.

    Q: Are PDFs of notes included?
    A: Core PDFs are included with your subscription.

    Q: Are printed notes available?
    A: If offered, you can collect them from the center at scheduled pickup times.

    Q: Do printed notes cost extra?
    A: Digital notes are included. Printed copies, if offered, may have a small fee.

    Q: What should I bring to in‑person classes?
    A: Notebook, pen, and the subject booklet. Extra handouts are announced in class.

    Q: Do you provide model answers and mark schemes?
    A: Yes, for selected sets of questions and exams.

    Q: Do you train on both MCQs and essays?
    A: Yes—techniques for both formats are covered.

    Q: Do you include past papers?
    A: Yes—plus realistic simulations aligned with recent trends.

    Q: Who grades composition and essays?
    A: The grading team under Mr. Nader’s supervision, using clear rubrics.

    Q: Will I get feedback on my homework?
    A: Yes—comments and improvement tips are shared regularly.

    Q: Are late homework submissions penalized?
    A: They may receive reduced credit. See each group’s policy in your dashboard.

    Q: Do you have online quizzes?
    A: Yes—short, periodic assessments to track your progress.

    Q: Can I retake online quizzes?
    A: Some allow multiple attempts—this will be stated before you start.

    Q: Do quiz scores appear in my progress report?
    A: Yes—scores are visible in your Student Dashboard.

    Q: How will I know I’m improving?
    A: Through periodic quiz results, graded assignments, and monthly progress summaries.

    Q: Can my parent/guardian view my progress?
    A: You can share summarized progress reports from your account.

    Q: Do you send a monthly performance report?
    A: Yes—highlights strengths and areas to reinforce.

    Q: Can I get a certificate of completion?
    A: Yes—an electronic certificate at the end if you meet attendance requirements.

    Q: Which name will appear on my certificate?
    A: Exactly as written in Personal Info—please check before issuance.

    Q: Do you offer study plans?
    A: Yes—editable study schedules tailored to your time.

    Q: Do you offer study guidance sessions?
    A: Group guidance is free; optional 1‑to‑1 advising is available.

    Q: What’s the classroom behavior policy?
    A: Stay quiet, phone on silent, and respect classmates and teachers.

    Q: Can I eat or drink during in‑person classes?
    A: Water only in the classroom; food is for breaks outside.

    Q: Is there Wi‑Fi at the center?
    A: Limited access; not intended for use during class.

    Q: Is there a waiting area for parents?
    A: Space is limited—please coordinate with reception in advance.

    Q: Is the venue accessible for students with disabilities?
    A: We do our best—request a ground‑floor room in advance if needed.

    Q: May I record the lesson myself?
    A: Personal recording isn’t allowed. Official recordings—when available—are shared via the platform.

    Q: Do you have rules about mobile phones?
    A: Phones must be silent and unused during class.

    Q: Is there emergency contact support?
    A: Use in‑app chat or support email; details are in Help > Contact Us.

    Q: Can I receive reminders on WhatsApp?
    A: Primary notifications are in‑app; additional channels may be offered when enabled.

    Q: Do you arrange student study groups?
    A: Yes—moderated discussion rooms are available on the platform.

    Q: Can I use my school tablet for online classes?
    A: Yes, if it supports Zoom and a modern browser with stable internet.

    Q: Which timezone are schedules shown in?
    A: Africa/Cairo.

    Q: How do I report a technical issue during an online class?
    A: Use the Report Issue button or message support from Help. We’ll review logs/recordings.

    Q: Can I book a support call?
    A: Yes—Help > Book a Call and choose an available slot.

    Q: Where do I find all important class links?
    A: Your Student Dashboard—it lists Zoom links, materials, notes, and quizzes.

    Q: What happens if the class time changes?
    A: You’ll be notified in‑app and by email, with alternative options if needed.

    Q: What if Mr. Nader is unexpectedly unavailable?
    A: We arrange a makeup class or a session with an approved assistant; everyone is compensated appropriately.

    Q: Does Mr. Nader have assistants?
    A: Yes—an academic team and technical support assist with grading and class logistics.

    Q: Can I rename my group after booking?
    A: Once, before the new week starts—contact support if seats allow.

    Q: What is your policy on cheating?
    A: Violations void the exam result and may lead to temporary account suspension.

    Q: Do you offer booster sessions right before exams?
    A: Yes—short, intensive refreshers with targeted drills.

    Q: Do you have groups tailored for language‑school students?
    A: Yes—terminology and examples are adjusted when needed.

    Q: What language is used in explanations?
    A: Clear Modern Standard Arabic, with practical examples suited to secondary students.

    Q: Do you offer sibling discounts?
    A: Yes—announced periodically in Offers and applied at Vodafone Cash payment.

    Q: Are scholarships or financial aid available?
    A: Occasionally, limited seats. Check Offers regularly.

    Q: Do you have a referral program?
    A: Yes, when active—you’ll find details in Offers.

    Q: Do you share discount codes?
    A: Sometimes during promotions—watch the platform announcements.

    Q: Is parking available near the center?
    A: We don’t manage a private lot. Arrive early to find a nearby spot.

    Q: Can I join from outside Beni Suef?
    A: Yes—online groups are open to students from anywhere.

    Q: What if a group is canceled before it starts?
    A: You get a full refund to your Vodafone Cash wallet or you may transfer to another group.

    Q: What’s the overall teaching approach of Mr. Nader?
    A: Simplify concepts, practice intensively, and build exam‑ready skills aligned with the current question styles.

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