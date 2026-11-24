import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import type { Case, CaseStatus, RiskLevel } from "../../core/models/cases.model";
import { RouterLink } from "@angular/router";

// 自定义验证器（工厂函数）：标题里不能出现这些词
// 合法返回 null，不合法返回 { forbiddenTitle: {value} }
export function forbiddenTitleValidator(forbidden: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;
    if (!value) {
      return null;
    }
    const hit = forbidden.find((word) => value.includes(word));
    return hit ? { forbiddenTitle: { value: hit } } : null;
  };
}

@Component({
  selector: 'app-case-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './case-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CaseFormComponent {
  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(50),
        forbiddenTitleValidator(['test', 'demo'])
      ]
    }),
    status: new FormControl<CaseStatus>('pending', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    riskLevel: new FormControl<RiskLevel>('medium', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    owner: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    })
  });

  readonly submitted = signal<Case | null>(null);

  get titleControl(): FormControl<string> {
    return this.form.controls.title;
  }

  get ownerControl(): FormControl<string> {
    return this.form.controls.owner;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const created: Case = {
      id: `CASE-${Date.now().toString().slice(-6)}`,
      title: value.title,
      status: value.status,
      riskLevel: value.riskLevel,
      owner: value.owner,
      updateAt: new Date().toISOString(),
    };
    this.submitted.set(created);
  }
}