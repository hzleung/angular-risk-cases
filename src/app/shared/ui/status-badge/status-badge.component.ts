import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import type { CaseStatus } from "../../../core/models/cases.model";

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [],
  templateUrl: './status-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class StatusBadgeComponent {
  // input.required: 父组件必须传 status, 不传编译就会报错
  // 这就是新写法的 @input, 只不过用 signal 的形式写，模板里读要加括号: status()
  readonly status = input.required<CaseStatus>();

  // 状态 -> 样式类，查表不用 switch / if-else 链，状态多了只加一行
  // 用 Record<string, string> 而不用 Record<CaseStatus, string> 是故意的
  // 键不在联合类型里也不会让 tsc 报错，没命中就回落到默认的 'badge', 样式缺一块时页面不会炸，只是显示默认灰底。
  private static readonly CLASS_MAP: Readonly<Record<string, string>> = {
    'pending': 'badge badge--pending',
    'active': 'badge badge--active',
    'pending-review': 'badge badge--pending-review',
    'closed': 'badge badge--closed',
  };

  readonly badgeClass = computed(
    () => StatusBadgeComponent.CLASS_MAP[this.status()] ?? 'badge',
  );
}