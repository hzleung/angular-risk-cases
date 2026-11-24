// 路由表： URL -> 组件。Angular 按顺序从上往下匹配，第一个命中的生效。
import { Routes } from '@angular/router';
import { CaseListComponent } from './feature/case-list/case-list.component';
import { CaseDetailComponent } from './feature/case-detail/case-detail.component';
import { CaseFormComponent } from './feature/case-form/case-form.component';

export const routes: Routes = [
  // 打开 http://localhost:4200/ 就显示列表页
  { path: '', component: CaseListComponent },
  { path: 'cases/new', component: CaseFormComponent },
  // 打开 http://localhost:4200/cases/CASE-000001 就显示详情页
  // :id 是路由参数，paramMap.get('id') 拿到的就是它
  { path: 'cases/:id', component: CaseDetailComponent },
  // 兜底：上面两条都没命中（比如输错了地址），跳回列表页
  // ** 必须放最后，放前面会把所有地址都吞掉
  { path: '**', redirectTo: '' },
];
