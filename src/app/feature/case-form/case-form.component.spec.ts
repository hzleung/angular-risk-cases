// src/app/features/case-form/case-form.component.spec.ts
// 表单组件测试：只测校验和提交，不测 Service。
// 不用 fakeAsync，不用等延迟，表单校验是同步的。

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CaseFormComponent } from './case-form.component';

describe('CaseFormComponent', () => {
  let fixture: ComponentFixture<CaseFormComponent>;
  let component: CaseFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaseFormComponent],
      // 模板里有 routerLink="/"，和 case-list 一样要给一个空路由。
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Creation successful, but the initial form is invalid', () => {
    expect(component).toBeTruthy();
    // 标题和负责人一开始都是空字符串，required 不过。
    expect(component.form.valid).toBe(false);
  });

  it('The title is less than 4 characters, which is illegal', () => {
    component.form.controls.title.setValue('123');
    component.form.controls.owner.setValue('Kyle');
    expect(component.form.controls.title.hasError('minlength')).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('The title contains the prohibited word "test", which is illegal', () => {
    component.form.controls.title.setValue('test case');
    component.form.controls.owner.setValue('Kyle');
    expect(component.form.controls.title.hasError('forbiddenTitle')).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('Fill in the legal title and responsible person, and the "submitted" field will have a value after submission', () => {
    component.form.controls.title.setValue('Suspicious transaction review');
    component.form.controls.owner.setValue('Kyle');
    expect(component.form.valid).toBe(true);

    component.onSubmit();
    expect(component.submitted()).not.toBeNull();
    expect(component.submitted()?.title).toBe('Suspicious transaction review');
    expect(component.submitted()?.id.startsWith('CASE-')).toBe(true);
  });

  it('When the form is submitted with invalid data, is submitted still null', () => {
    component.form.controls.title.setValue('123');
    component.form.controls.owner.setValue('Kyle');
    component.onSubmit();
    expect(component.submitted()).toBeNull();
    // onSubmit 里 markAllAsTouched() 跑了，标题被标为 touched。
    expect(component.form.controls.title.touched).toBe(true);
  });
});
