// src/app/features/case-list/case-list.component.spec.ts
// 列表组件测试：只测搜索流，不测 Ag Grid 渲染。
// 用 Mock Service 代替真的 CaseService，Mock 里没有 delay(300)，
// 这样测试只用等组件自己的 debounceTime(300)，不用等两层延迟。
// 不用 fakeAsync：Angular 21 默认 zoneless，fakeAsync 跑不起来，
// 改成 async / await + setTimeout 真等 400ms。

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CaseListComponent } from './case-list.component';
import { CaseService } from '../../core/services/case.service';
import type { Case } from '../../core/models/cases.model';

const MOCK_LIST: Case[] = [
  {
    id: 'CASE-000001',
    title: 'Suspicious transaction review',
    status: 'pending',
    riskLevel: 'high',
    owner: 'Kyle',
    updateAt: '2026-11-24T00:00:00.000Z',
  },
  {
    id: 'CASE-000002',
    title: 'Customer due diligence',
    status: 'pending',
    riskLevel: 'medium',
    owner: 'Kyle',
    updateAt: '2026-11-24T00:00:00.000Z',
  },
  {
    id: 'CASE-000003',
    title: 'Sanctions list review',
    status: 'closed',
    riskLevel: 'low',
    owner: 'Kyle',
    updateAt: '2026-11-24T00:00:00.000Z',
  },
];



// Mock Service：按关键词过滤，不带 delay，测试只等组件的 debounce。
class MockCaseService {
  getCases(query = '') {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return of(MOCK_LIST);
    }
    return of(
      MOCK_LIST.filter(
        (c) =>
          c.title.toLowerCase().includes(keyword) ||
          c.id.toLowerCase().includes(keyword),
      ),
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('CaseListComponent', () => {
  let fixture: ComponentFixture<CaseListComponent>;
  let component: CaseListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseListComponent],
      providers: [{ provide: CaseService, useClass: MockCaseService }, provideRouter([]),],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Creation successful, open to load all', async () => {
    expect(component).toBeTruthy();
    // ngOnInit 里 startWith('') + debounceTime(300)，等 400ms 再断言。
    await sleep(400);
    expect(component.cases().length).toBe(3);
  });

  it('After entering keywords, only the matching lines will be filtered out', async () => {
    await sleep(400);
    component.searchControl.setValue('Suspicious');
    // setValue 后 valueChanges 发值，等 debounceTime(300) 再断言。
    await sleep(400);
    expect(component.cases().length).toBe(1);
    expect(component.cases()[0].id).toBe('CASE-000001');
  });

  it('Input a non-existent keyword, and the list will be empty', async () => {
    await sleep(400);
    component.searchControl.setValue('zzz-no-such-case');
    await sleep(400);
    expect(component.cases().length).toBe(0);
  });
});
