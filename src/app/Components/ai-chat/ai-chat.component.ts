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
    <div class="chat-widget" [class.expanded]="isExpanded">
      <div class="chat-button" (click)="toggleChat()" *ngIf="!isExpanded">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
                fill="currentColor"/>
          <circle cx="8" cy="11" r="1" fill="white"/>
          <circle cx="12" cy="11" r="1" fill="white"/>
          <circle cx="16" cy="11" r="1" fill="white"/>
        </svg>
      </div>

      <div class="chat-window" *ngIf="isExpanded">
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
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
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
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
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

  private readonly FAQ_CONTEXT = `
    س: إزاي أعمل حساب؟
ج: اضغط إنشاء حساب بالأعلى، أدخل الإيميل والباسورد، ثم فعِّل الحساب من رسالة التأكيد.

س: لازم أفعِّل الإيميل؟
ج: نعم، تتفعّل المزايا بعد الضغط على رابط التأكيد في الإيميل.

س: نسيت كلمة السر؟
ج: اضغط هل نسيت كلمة المرور في صفحة الدخول واتبع التعليمات المُرسلة لإيميلك.

س: أغيّر كلمة السر بعد ما أسجل دخول؟
ج: الإعدادات > الأمان > تغيير كلمة المرور.

س: أعدِّل عنوان الإيميل؟
ج: الإعدادات > البيانات الشخصية > تعديل الإيميل، ثم أدخل كود التحقق المُرسل للإيميل الجديد.

س: أقدر أغيّر رقم الموبايل؟
ج: نعم من الإعدادات > البيانات الشخصية، ثم تأكيد بالكود.

س: أوقف الإشعارات؟
ج: الإعدادات > الإشعارات لتخصيصها أو تعطيلها مؤقتًا.

س: أحذف حسابي نهائيًا؟
ج: الإعدادات > الحساب > حذف الحساب. سيُعطَّل الوصول وتُحذف البيانات غير المطلوبة قانونيًا.
س: أرقام الدعم ؟
ج: 01149122568 || 01127597047
س: أصدّر بياناتي؟
ج: الإعدادات > تصدير البيانات، واختر JSON أو CSV أو PDF.

س: بياناتي آمنة؟
ج: نعم، وفق سياسة خصوصية صارمة. لا نشارك بياناتك مع طرف ثالث إلا إذا طُلِب قانونيًا.

س: بتحتفظوا ببياناتي بعد انتهاء الاشتراك؟
ج: نحتفظ بالحد الأدنى المطلوب قانونًا. يمكنك طلب الحذف من الإعدادات > الحساب.

س: مين مستر نادر؟
ج: مستر نادر مُعلّم اللغة العربية للثانوي (أولى/تانية/تالتة). نشرح منهج الوزارة كاملًا مع تدريب عملي على أساليب أسئلة الامتحان.

س: أكلم مستر نادر مباشرة؟
ج: لا يوجد تواصل مباشر. اكتب رسالتك عبر الدعم وسنوصّلها للفريق الأكاديمي.

س: مواعيد عمل الدعم؟
ج: موضّحة داخل حسابك في صفحة تواصل معنا.

س: أتواصل مع الدعم إزاي؟
ج: من داخل التطبيق عبر المحادثة أو الإيميل في قسم المساعدة > تواصل معنا.

س: فين الدروس الحضورية؟
ج: بني سويف الجديدة – شارع الأباصيري. العنوان الكامل والخريطة داخل حسابك في قسم الموقع.

س: فيه مجموعات أونلاين؟
ج: نعم، مجموعات مباشرة عبر الإنترنت بالإضافة للحضوري.

س: مستر نادر يدرّس لمين؟
ج: لغة عربية لصفوف: أولى – تانية – تالتة ثانوي فقط.

س: بتتّبعوا منهج الوزارة؟
ج: نعم، مع تدريب على نمط الأسئلة الحديثة.

س: موضوعات العربي اللي بتتغطّى؟
ج: نحو، بلاغة، نصوص/أدب، قراءة، وتعبير (وظيفي وإبداعي).

س: فيه تدريب على استراتيجيات الامتحان؟
ج: بالتأكيد: إدارة الوقت، مهارات الاختيار من متعدد، وصياغة إجابات التعبير.

س: بتستخدموا أي منصة للأونلاين؟
ج: غالبًا Zoom، والرابط يظهر في لوحة الطالب قبل المحاضرة.

س: المتطلبات التقنية للأونلاين؟
ج: هاتف أو كمبيوتر، إنترنت مستقر، متصفح/Zoom مُحدّث، وسماعات مُستحسنة.

س: النت ضعيف، أعمل إيه؟
ج: اقفل التطبيقات الأخرى، قرّب من الراوتر/استخدم سلكي إن أمكن، واطلب تسجيل الجلسة لو متاح.

س: حصل انقطاع كهرباء في الحضوري؟
ج: قد نمدّ المدة/نعيد الجدولة/نقدّم بديل تعويضي. التحديثات تصلك عبر المنصة.

س: سياسة التأخّر؟
ج: ادخل بهدوء، ويمكنك المراجعة من الملحوظات أو التسجيل (إن وُجد).

س: الحضور بيتسجّل؟
ج: نعم. لو هتتأخر/تغيب، بلّغ الدعم.

س: بتسجّلوا المحاضرات؟
ج: بعض المجموعات فقط. ستظهر لك روابط المشاهدة في لوحة الطالب حال توفرها ولمدّة محدودة.

س: فيه حصة تجريبية؟
ج: غالبًا في بداية كل مجموعة. راجع الجدول.

س: عدد الطلبة في المجموعة؟
ج: مجموعات صغيرة لتحسين التفاعل (العدد يختلف حسب المجموعة).

س: فيه دروس واحد لواحد؟
ج: نعم بأسعار منفصلة وحسب المتاح.

س: طرق الدفع؟
ج: فودافون كاش فقط حاليًا.

س: تحويل بنكي أو فوري؟
ج: غير متاح. المعتمد فودافون كاش فقط.

س: أرفع إيصال الدفع إزاي؟
ج: لوحة التحكم > المدفوعات > رفع إيصال وانتظر التأكيد.

س: تفعيل الاشتراك بياخد قد إيه بعد الدفع؟
ج: خلال وقت قصير بعد مراجعة الإيصال. الحالة بتظهر في حسابك.

س: اتأخّرت في الدفع؟
ج: قد يتوقّف الوصول لحين الإتمام عبر فودافون كاش.

س: ألغِي الاشتراك وأسترد فلوسي؟
ج: قبل بدء الكورس: استرداد كامل. بعد البدء: لا يوجد استرداد، لكن يمكن النقل/التجميد حسب السياسة.

س: أنقل الاشتراك لشخص آخر؟
ج: مرّة واحدة خلال الأسبوع الأول وبعد موافقة الإدارة.

س: أجمّد الاشتراك؟
ج: نعم لفترة محدودة وبموافقة—تواصل مع الدعم.

س: أغيّر مجموعتي؟
ج: مسموح مرّة واحدة في الترم بناءً على المقاعد المتاحة.

س: أغيّر من حضوري لأونلاين؟
ج: نعم إذا توفّر مكان ووفق الشروط.

س: أنضم لمجموعة بدأت؟
ج: ممكن لو فيه مقاعد. هنساعدك تلحق بالمحتوى.

س: الطلبة الحاليين لهم أولوية؟
ج: نعم، لهم أولوية التجديد قبل فتح المقاعد للجمهور.

س: أشوف الجدول فين؟
ج: يُنشر أسبوعيًا في لوحة الطالب > الجدول.

س: بتعدّلوا الجداول في رمضان والإجازات؟
ج: نعم، ننشر جدولًا خاصًا مسبقًا.

س: فيه تقويم سنوي؟
ج: الخطة العامة متاحة، والتفاصيل تُحدّث أسبوعيًا داخل المنصة.

س: معسكرات مُكثّفة قبل الامتحانات؟
ج: نعم، مع اختبارات تجريبية.

س: باقات مُراجعة نهائية؟
ج: نعم، مراجعات مركّزة مع بنوك أسئلة مُدرجة.

س: فيديوهات عند الطلب؟
ج: أحيانًا لموضوعات محددة—نعلن عنها داخل المنصة.

س: المذكرات PDF متضمنة؟
ج: نعم ضمن الاشتراك.

س: مذكرات مطبوعة؟
ج: إن توفّرت، تستلمها من المركز في مواعيد مُعلنة (قد تُحتسب رسوم بسيطة للطباعة).

س: أجيب إيه معايا في الحضوري؟
ج: كشكول وقلم وكتيّب المادة. وأي أوراق إضافية نعلن عنها.

س: فيه نماذج إجابات وسُلم تصحيح؟
ج: نعم لِمجموعات مختارة من الأسئلة والامتحانات.

س: بتدرّبوا على الاختيار من متعدد والتعبير؟
ج: نعم، بأساليب عملية لكلٍّ منهما.

س: بتوفّروا امتحانات سابقة؟
ج: نعم، مع محاكاة واقعية للاتجاهات الحديثة.

س: مين بيصحّح التعبير؟
ج: فريق التصحيح تحت إشراف مستر نادر وبنُظم تقييم واضحة.

س: هاخد تعليقات على الواجب؟
ج: نعم، ملاحظات ونصائح تحسّن مستواك دوريًا.

س: تأخير تسليم الواجب يتخصم؟
ج: قد يُخفَّض التقييم—راجِع سياسة مجموعتك في اللوحة.

س: فيه كويزات أونلاين؟
ج: نعم، قصيرة ودورية لقياس تقدّمك.

س: أقدر أُعيد محاولة الكويز؟
ج: بعض الكويزات تسمح بمحاولات متعددة—ستجد التنبيه قبل البدء.

س: الدرجات بتظهر في تقرير التقدم؟
ج: نعم، داخل لوحة الطالب.

س: أعرف إن مستواي بيتحسّن إزاي؟
ج: عبر نتائج الكويزات والواجبات وتقارير شهرية مختصرة.

س: وليّ الأمر يطّلع على تقدمي؟
ج: يمكنك مشاركة تقارير مُلخّصة من حسابك.

س: شهادة إتمام؟
ج: نعم إلكترونية عند استيفاء متطلبات الحضور.

س: الاسم على الشهادة؟
ج: كما هو في البيانات الشخصية—راجِعه قبل الإصدار.

س: خطط مذاكرة؟
ج: نعم—جداول قابلة للتعديل حسب وقتك.

س: جلسات إرشاد دراسي؟
ج: إرشاد جماعي مجاني، وفردي اختياري مدفوع.

س: سياسة الانضباط داخل الفصل؟
ج: هدوء، الهاتف صامت، واحترام الجميع.

س: آكل أو أشرب أثناء الحصة؟
ج: ماء فقط داخل الفصل—الأطعمة أثناء الاستراحة.

س: في Wi-Fi بالمركز؟
ج: محدود وليس مخصصًا للاستخدام أثناء الدرس.

س: في مكان انتظار لأولياء الأمور؟
ج: المساحة محدودة—يُفضّل التنسيق مسبقًا مع الاستقبال.

س: أسجّل الدرس بنفسي؟
ج: التسجيل الشخصي غير مسموح. التسجيلات الرسمية—إن وُجدت—تصل عبر المنصة.

س: قواعد استخدام الموبايل؟
ج: صامت وبدون استخدام أثناء الحصة.

س: دعم للطوارئ؟
ج: عبر محادثة التطبيق أو الإيميل—التفاصيل في المساعدة > تواصل معنا.

س: استلام تذكيرات على واتساب؟
ج: الإشعارات الأساسية داخل التطبيق، وقد نوفّر قنوات إضافية عند تفعيلها.

س: بتنظّموا مجموعات مذاكرة؟
ج: نعم—غرف نقاش مُدارة داخل المنصة.

س: أستخدم تابلت المدرسة للأونلاين؟
ج: نعم إذا كان يدعم Zoom ومتصفح حديث وإنترنت مستقر.

س: المنطقة الزمنية للجدول؟
ج: Africa/Cairo.

س: أبلّغ عن مشكلة تقنية أثناء الحصة الأونلاين؟
ج: استخدم زر الإبلاغ عن مشكلة أو راسل الدعم من المساعدة. نراجع السجلات والتسجيلات.

س: أحجز مكالمة دعم؟
ج: نعم—المساعدة > حجز مكالمة واختر ميعادًا مناسبًا.

س: أين أجد روابط الحصص والمواد؟
ج: داخل لوحة الطالب (روابط Zoom، المواد، المذكرات، الكويزات).

س: اتغيّر ميعاد الحصة؟
ج: نبلغك داخل التطبيق وبالإيميل مع بدائل إن لزم.

س: لو مستر نادر تعذّر حضوره فجأة؟
ج: نرتّب حصة تعويضية أو بديل مُعتمد، مع إخطار الجميع.

س: هل يوجد مساعدين لمستر نادر؟
ج: نعم—فريق أكاديمي وتقني للمساعدة في التصحيح وتنظيم الحصص.

س: أغيّر اسم مجموعتي بعد الحجز؟
ج: مسموح مرّة واحدة قبل بداية الأسبوع الجديد، حسب المقاعد.

س: سياسة الغش؟
ج: إلغاء نتيجة الامتحان وقد يُعلّق الحساب مؤقتًا.

س: جلسات تقوية قبل الامتحانات؟
ج: نعم—مراجعات مُكثّفة سريعة.

س: مجموعات مخصّصة لطلبة اللغات؟
ج: نعم—نُكيّف المصطلحات والأمثلة عند الحاجة.

س: لغة الشرح؟
ج: عربية فصحى مبسّطة مع أمثلة عملية لطلبة الثانوي.

س: خصم للإخوة؟
ج: نعم—نعلن عنه دوريًا في العروض ويُطبّق عند دفع فودافون كاش.

س: منح أو دعم مالي؟
ج: أحيانًا بمقاعد محدودة—تابع العروض.

س: برنامج الإحالة؟
ج: نعم عند تفعيله—تفاصيله في العروض.

س: خصومات/أكواد؟
ج: تُعلن أثناء الحملات داخل المنصة.

س: موقف للسيارات؟
ج: لا ندير جراجًا خاصًا—يُفضّل الحضور مبكرًا لركن قريب.

س: أقدر أنضم وأنا من خارج بني سويف؟
ج: نعم—المجموعات الأونلاين متاحة للجميع.

س: لو مجموعة اتلغت قبل البدء؟
ج: استرداد كامل عبر فودافون كاش أو التحويل لمجموعة أخرى.

س: أسلوب التدريس العام؟
ج: تبسيط المفاهيم + تدريب مكثّف + بناء مهارات جاهزة للامتحان وفق أحدث الأنماط.
  `;

  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: this.API_KEY });
  }

  ngOnInit() {
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