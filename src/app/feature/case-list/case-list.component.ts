// 列表页：只管“输入关键字 -> 拿到列表 -> 交给模板显示”
// 过滤逻辑在Service里，这里只做两件事
// 1) 把搜索框的输入编程一个带防抖的 RxJS 流；2）把拿到的列表放进 signal 里，模板里用 async 管道显示。

import { Component, ChangeDetectionStrategy, inject, OnInit, DestroyRef, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { AgGridAngular } from "ag-grid-angular";
import { CaseService } from "../../core/services/case.service";
import type { Case } from "../../core/models/cases.model";
import type { ColDef } from "ag-grid-community";
import { debounceTime, distinctUntilChanged, startWith, switchMap, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { Router, RouterLink } from "@angular/router";
import type { RowClickedEvent } from "ag-grid-community";

// 注册一次，在任何表格实例化之前执行，写在模块顶层（类外面）
// 组件文件一被 import 就行会执行，比卸载ngOnInit里更早、更稳。
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [ReactiveFormsModule, AgGridAngular, RouterLink],
  templateUrl: './case-list.component.html',
  // OnPush: 只有输入变化、事件、signal变化或Observable 发出新值时才检查这个组件。
  // 配合下面 signal 的 set() 使用，2 万条数据也不会每次都全量检查，性能好。
  // changeDetection 作用是告诉 Angular 什么时候检查组件的模板。默认是 Default，每次事件、定时器、HTTP 响应等都会检查整个组件树，性能差。
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CaseListComponent implements OnInit {
  // inject() 拿 Service 实例，不用写 constructor. DestroyRef 用于 takeUntilDestroyed()，自动取消订阅，避免内存泄漏，不用自己写 ngOnDestroy。
  private readonly caseService = inject(CaseService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  // 搜索框：Reactive Forms 的 FormControl，nonNullable 表示值一定是 string，不会是 string | null，后面写 q ?? '' 只是兜底
  readonly searchControl = new FormControl('');

  // 列表数据和加载状态都放 signal 里，模板用 cases() / loading() 取值
  readonly cases = signal<Case[]>([]);
  readonly loading = signal(false);

  // AgGrid 的列定义，只读常量，只写一次，绝不在模板里用方法现算、也绝不在每次渲染时重建。重建一次，Ag Grid 就要重新初始化一次。
  readonly columnDefs: ColDef<Case>[] = [
    { field: 'id', headerName: '编号', width: 120 },
    { field: 'title', headerName: '标题', flex: 1 },
    { field: 'status', headerName: '状态', width: 100 },
    { field: 'riskLevel', headerName: '风险等级', width: 100 },
    { field: 'owner', headerName: '负责人', width: 120 },
    { field: 'updateAt', headerName: '更新时间', width: 160 },
  ];

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      // 先发一个空字符串，页面一打开就加载全部2万条，不用等用户先敲字。
      startWith(''),
      // 停 300 ms 没新输入才发请求：用户连续敲“trace”不会发 4 次请求
      debounceTime(300),
      // 和上一次输入一样的值不发请求：比如删了又敲回同一个词
      distinctUntilChanged(),
      // 发请求前先把 loading 置 true，模板可以显示“loading”
      tap(() => this.loading.set(true)),
      // 换关键词时取消上一次还没回来的请求，只留最新的一次
      // Service 里有 delay(300) 模拟延迟，这个取消正好能被测到
      switchMap(q => this.caseService.getCases(q ?? '')),
      // 组件销毁时自动取消订阅，不用写 ngOnDestroy，也不会漏取消导致内存泄漏
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: list => {
        // 只能用 set() 换整个数组，不能用 push() 改原数组
        // OnPush 下 push() 不会触发检查，页面看起来就是“数据没变”
        this.cases.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

  }

  onRowClicked(event: RowClickedEvent<Case>): void {
    const clicked = event.data;
    if (!clicked) {
      return;
    }
    void this.router.navigate(['/cases', clicked.id])
  }
}