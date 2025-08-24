import { Component, inject } from '@angular/core';
import { QuestionDifficultyDto } from '../../../../../Interfaces/Reports/question-difficulty-dto';
import { ReportsService } from '../../../../../Services/Reports/reports.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assessment-difficulty',
  standalone: true,
  imports: [FormsModule,RouterLink,CommonModule],
  templateUrl: './assessment-difficulty.component.html',
  styleUrl: './assessment-difficulty.component.css'
})
export class AssessmentDifficultyComponent {
private api = inject(ReportsService);
  private route = inject(ActivatedRoute);

  id!: number;
  loading = true;
  error: string | null = null;
  rows: QuestionDifficultyDto[] = [];

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getQuestionDifficulty(this.id).subscribe({
      next: d => { this.rows = d ?? []; this.loading = false; },
      error: _ => { this.error = 'فشل تحميل صعوبة الأسئلة'; this.loading = false; }
    });
  }

  get totalCount(): number {
    return this.rows?.length ?? 0;
  }

  get easyCount(): number {
    const list = this.rows ?? [];
    return list.filter(q => (q.wrongRate ?? 0) < 30).length;
  }

  get mediumCount(): number {
    const list = this.rows ?? [];
    return list.filter(q => {
      const r = q.wrongRate ?? 0;
      return r >= 50 && r < 70;
    }).length;
  }

  get hardCount(): number {
    const list = this.rows ?? [];
    return list.filter(q => (q.wrongRate ?? 0) >= 70).length;
  }
}
