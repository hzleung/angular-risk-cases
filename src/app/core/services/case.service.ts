import { Injectable } from "@angular/core";
import { delay, map, Observable, of } from "rxjs";
import type { Case } from "../models/cases.model";
import { generateMockCase } from "../data/mock-cases";


@Injectable({
  // providedIn: 'root' = 全局单例，整个应用共用同一个 CaseService 实例。
  // Angular 在需要它的地方自动把实例“注入”进来，不用你手动 new。
  providedIn: 'root',
})
export class CaseService {
  // Mock 数据只生成一次，存在内存里。2万条是文件 1 生成的那个固定种子版本
  // 每次刷新内容都一样，方便复现
  private readonly cases: Case[] = generateMockCase();
  /**
   * 按关键词查案件列表
   * @param query 搜索关键词，空字符串 = 查全部。不区分大小写，匹配标题或编号。
   * @param Observable<Case[]>: 现在模拟请求，delay(300) 模拟 300ms 网络延迟。
   */
  getCases(query: string): Observable<Case[]> {
    const keyword = query.trim().toLocaleLowerCase();
    return of(this.cases).pipe(
      delay(300),
      map(list => {
        if (!keyword) {
          return list;
        }
        return list.filter(c => c.title.toLowerCase().includes(keyword) || c.id.toLowerCase().includes(keyword))
      })
    )
  }

  /**
   * 按编号查一条案件，详情页用。
   * @param id 案件编号
   * @returns Observable<Case | undefined>，找不到返回 undefined，调用方要处理。
   */
  getCaseById(id: string): Observable<Case | undefined> {
    return of(this.cases).pipe(
      delay(300),
      map(list => list.find(c => c.id === id)),
    );
  }
}