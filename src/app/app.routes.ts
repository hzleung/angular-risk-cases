// 路由表： URL -> 组件。Angular 按顺序从上往下匹配，第一个命中的生效。
import { Routes } from '@angular/router';
import { CaseListComponent } from './feature/case-list/case-list.component';

export const routes: Routes = [
  { path: '', component: CaseListComponent },
  { path: 'cases/new', loadComponent: () => import('./feature/case-form/case-form.component').then((m) => m.CaseFormComponent) },
  { path: 'cases/:id', loadComponent: () => import('./feature/case-detail/case-detail.component').then((m) => m.CaseDetailComponent) },
  { path: '**', redirectTo: '' },
];
