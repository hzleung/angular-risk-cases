import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { catchError, throwError } from "rxjs";

// 函数式拦截器: Angular 21 推荐写法，不用写 class + @Injectable
// 所有 HttpClient 发出的请求都会先经过这里
// 再决定要不要方形，要不要改，出错了怎么处理
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        console.error('[Interceptor] 401 Unable Login, Please login again.')
      } else if (err.status === 500) {
        console.error('[Interceptor] 500 Server Error, Please try again.')
      } else {
        console.error('[Interceptor] Request failed', err.status, err.message)
      }
      // 一定要把错误再跑出去，不然订阅者收不到 error
      // 组件里的 subscribe({ error }) 永远不会跑
      return throwError(() => err);
    })
  )
}