// 搜索框: 父组件传 placeholder 和当前值进来，输入变了就通过 output 发出去
// React 对照：input() 相当于 props，output() 相当于回调函数 props.onChange

import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [],
  templateUrl: './search-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SearchInput {
  // 父传子：占位文字和当前值，都有默认值，父组件不传也能用
  readonly placeholder = input<string>('Searching...');
  readonly value = input<string>('');
  // 子传父：输入变了就发出去，父组件用 (searchChange)="..." 接
  // output<string>() 就是 @output() + EventEmitter<string> 的新写法
  readonly searchChange = output<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchChange.emit(target.value);
  }
}