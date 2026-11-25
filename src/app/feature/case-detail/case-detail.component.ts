import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { CaseService } from "../../core/services/case.service";
import type { Case } from "../../core/models/cases.model";
import { distinctUntilChanged, forkJoin, map, of, switchMap, tap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { StatusBadgeComponent } from "../../shared/ui/status-badge/status-badge.component";

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './case-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CaseDetailComponent implements OnInit {
  // ActivatedRoute 是当前路由的信息源：URL 参数、查询参数都在它身上
  // getCaseById(id) 是 CaseService 中的方法
  private readonly route = inject(ActivatedRoute);
  private readonly caseService = inject(CaseService);
  private readonly destroyRef = inject(DestroyRef);

  // 查到的那一条案件，找不到就是 undefined，模板要处理“找不到”这个分支
  // loading 用来在请求回来之前显示“loading...”
  readonly caseDetail = signal<Case | undefined>(undefined);
  readonly loading = signal(true);

  readonly caseLogs = signal<string[]>([]);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      // paramMap 是“URL 参数的流”，每次URL里的 id 变了它就发一个新值
      // .get(id) 取出 id，可能是 string，也可能是 null（URL 里没写 id 时）
      map(params => params.get('id')),
      // 同一个 id 重复进页面不重新查：比如从列表点进来两次都是同一个 id
      distinctUntilChanged(),
      tap(() => this.loading.set(true)),
      // id 变了就取消上一次还没回来的请求，只留最新的一次
      // 没有 id 时直接返回 of(undefined)，不调 Service
      switchMap(id => (id ? forkJoin({
        detail: this.caseService.getCaseById(id),
        logs: this.caseService.getCaseLogs(id)
      }) : of({ detail: undefined, logs: [] as string[] }))),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: ({ detail, logs }) => {
        this.caseDetail.set(detail);
        this.caseLogs.set(logs);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    })
  }
}