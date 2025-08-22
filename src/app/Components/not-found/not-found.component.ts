import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {
alert(){
Swal.fire({
    title: '<strong>الدعم الفني</strong>',
    icon: 'info',
    width: 700,
    showCloseButton: true,
    focusConfirm: false,
    confirmButtonText: 'إغلاق',
    confirmButtonAriaLabel: 'إغلاق مربع الحوار',
    html: `
      <div dir="rtl" class="support-wrap">
        <p>لو واجهتك أي مشكلة، تواصل معانا خلال <b>10 صباحًا – 10 مساءً</b> بتوقيت القاهرة.</p>

        <ul class="support-list">
          <li>
            <div class="label">الدعم الفني (1)</div>
            <div class="actions">
              <a class="btn" href="tel:+201127597047" aria-label="اتصال بالرقم 0112 759 7047">اتصال</a>
              <a class="btn" href="https://wa.me/+201127597047?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%AD%D8%AA%D8%A7%D8%AC%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9" target="_blank" rel="noopener" aria-label="مراسلة واتساب">واتساب</a>
              <button class="btn copy" data-copy="+201001234567" aria-label="نسخ الرقم">نسخ</button>
              <span class="num" dir="ltr">0112 759 7047</span>
            </div>
          </li>

          <li>
            <div class="label">الدعم الفني (2)</div>
            <div class="actions">
              <a class="btn" href="tel:+201119876543" aria-label="اتصال بالرقم 0114 912 2568">اتصال</a>
              <a class="btn" href="https://wa.me/+201149122568?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%AD%D8%AA%D8%A7%D8%AC%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9" target="_blank" rel="noopener" aria-label="مراسلة واتساب">واتساب</a>
              <button class="btn copy" data-copy="+01149122568" aria-label="نسخ الرقم">نسخ</button>
              <span class="num" dir="ltr">0114 912 2568</span>
            </div>
          </li>

          <li>
            <div class="label">البريد الإلكتروني</div>
            <div class="actions">
              <a class="btn" href="mailto:elbasit.support@gmail.com" aria-label="إرسال بريد">إرسال بريد</a>
              <button class="btn copy" data-copy="elbasit.support@gmail.com" aria-label="نسخ البريد">نسخ</button>
              <span class="num" dir="ltr">elbasit.support@gmail.com</span>
            </div>
          </li>
        </ul>

        <p class="note">ملاحظة: يُفضّل مراسلتنا على واتساب لسرعة الرد.</p>
      </div>

      <style>
        .support-wrap { text-align: right; }
        .support-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
        .support-list li { background: #f6f7f9; border-radius: 12px; padding: 12px; }
        .label { font-weight: 700; margin-bottom: 6px; }
        .actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .btn {
          border: 1px solid #e0e3e7;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 14px;
          text-decoration: none;
          background: #fff;
          cursor: pointer;
        }
        .btn:hover { filter: brightness(0.97); }
        .num { opacity: 0.8; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
        .note { margin-top: 10px; font-size: 13px; opacity: .8; }
        @media (max-width: 480px){ .actions { gap: 6px; } }
      </style>
    `,
    didOpen: (popup) => {
      popup.querySelectorAll('.copy').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const val = btn.getAttribute('data-copy') || '';
          try {
            await navigator.clipboard.writeText(val);
            const prev = btn.textContent;
            btn.textContent = 'تم النسخ ✓';
            setTimeout(() => (btn.textContent = prev || 'نسخ'), 1200);
          } catch {
            // fallback لو ممنوع الوصول للحافظة
            alert('انسخ يدويًا: ' + val);
          }
        });
      });
    },
  });
}
}
