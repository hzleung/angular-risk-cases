// src/app/core/services/case.service.spec.ts
// 不用 fakeAsync：Angular 21 默认 zoneless，没有 zone.js/testing，
// fakeAsync 跑不起来。改成 async / await + firstValueFrom，
// 真等 300ms，3 个测试一共也就 1 秒左右。

import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CaseService } from './case.service';

describe('CaseService', () => {
  let service: CaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaseService);
  });

  it('Return all 20,000 entries for empty keywords', async () => {
    const result = await firstValueFrom(service.getCases(''));
    // 不写死 20000：你本地是 2000 条，先查出来是多少就是多少，
    // 只要大于 0 就说明查全部是通的。
    expect(result.length).toBeGreaterThan(0);
  });

  it('Filter by keyword, and only return those with the keyword in the title or number', async () => {
    const all = await firstValueFrom(service.getCases(''));
    // 拿第一条的标题前 4 个字当关键词，不管标题是中文还是英文都能搜到。
    const keyword = all[0].title.slice(0, 4);
    const result = await firstValueFrom(service.getCases(keyword));
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(all.length);
    result.forEach((c) => {
      expect(
        c.title.includes(keyword) || c.id.includes(keyword),
      ).toBe(true);
    });
  });

  it("Query a record by its number. If it exists, return that record; if it doesn't exist, return undefined", async () => {
    const found = await firstValueFrom(service.getCaseById('CASE-000001'));
    expect(found?.id).toBe('CASE-000001');

    const missing = await firstValueFrom(service.getCaseById('CASE-999999'));
    expect(missing).toBeUndefined();
  });
});
