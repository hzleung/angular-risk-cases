import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ConfirmDialogComponent {
  readonly title = input<string>('Please confirm')
  readonly message = input<string>('Are you sure to continue?');
  readonly open = input<boolean>(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }

}