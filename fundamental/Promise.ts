// Promise A+ 规范
// 1. 术语
//     1. thanable：带有 then 方法的对象或函数
//     2. promise：带有then方法的对象或函数，且 then 行为完全满足 Promise A+ 规范
//     3. value： 合法的 js 值
//     4. exception： 指被 throw 的值
//     5. reason： 代表 promise rejected 原因的值
// 2. 要求
//     1. Promise 状态：只有三种状态：pending进行中，fulfilled已成功，rejected已失败
//         1. 当 promise pending 时
//             1. 可能会转变成 fulfilled 或 rejected
//         2. 当 promise fulfilled 时
//             1. 状态凝固不能再变
//             2. 必须有一个凝固不变的 value
//         3. 当 promise rejected 时
//             1. 状态凝固不能再变
//             2. 必须有一个凝固不变的 reason
//     2. then 方法：Promise 必须提供一个 then 方法来拿到当前的或者最终的 value 或者 reason，then方法接收两个参数：onFulfilled, onRejected
//         1. onFulfilled 和 onRejected 都是可选的。如果不是函数，被忽略
//         2. 如果 onFulfilled 是函数，要满足以下行为：
//             1. 必须在 promise 转变为 fulfilled 后执行，以 promise 的 value 作为第一个参数，且最多执行一次
//             2. promise 转变为 fulfilled 前不可执行
//         3. 如果 onRejected 是函数，要满足以下行为：
//             1. 必须在 promise 转变为 rejected 后执行，以 promise 的 reason 作为第一个参数，且最多执行一次
//             2. promise 转变为 rejected 前不可执行
//         4. onFulfilled 和 onRejected 必须等到下一个 microtask 时执行（保证是异步的）
//         5. onFulfilled 和 onRejected 执行时必须作为函数调用，this 为 undefined(严格)，或者 global object(非严格)
//         6. 同一个 promise 可以执行多次 then
//             1. 当 promise 转变为 fulfilled 时，多个 onFulfilled 按注册顺序执行
//             2. 当 promise 转变为 rejected 时，多个 onRejected 按注册顺序执行
//         7. then 必须返回一个 promise。 promise2 = promise1.then(onFulfilled, onRejected)
//             1. 如果 onFulfilled 或 onRejected 返回一个 value x，则执行 [[Resolve]](promise2, x)
//             2. 如果 onFulfilled 或 onRejected throw 一个 exception e，promise2 用 e 作为 reason rejected
//             3. 如果 onFulfilled 不是函数，且 promise1 fulfilled 了， promise2 用 promise1 的 value fulfilled
//             4. 如果 onRejected 不是函数，且 promise1 rejected 了，promise2 用 promise1 的 reason rejected
//     3. [[Resolve]](promise, x)流程
//         1. 如果 x 和 promise 指向同一对象， 使用 TypeError reason reject promise
//         2. 如果 x 是一个 promise：
//             1. 如果 x 是pending，promise 也维持pending，直到x被决议为 fulfilled 或 rejected
//             2. 如果/当 x 是 fulfilled时，用x的value fulfill promise
//             3. 如果/当 x 是 rejected时，用x的reason reject promise
//         3. 其他情况，如果x是个函数或者对象，试图用 thenable 对待
//             1. 让 then 取值等于 x.then
//             2. 如果在访问 x.then 时就throw exception e，用 e 作为 reason reject promise
//             3. 如果 then 是个函数，执行 then，用 x 作为 this，第一个参数为函数 resolvePromise，第二个参数为函数 rejectPromise
//                 1. 如果 resolvePromise 被执行了，传入参数为 y，执行 [[Resolve]](promise, y)
//                 2. 如果 rejectPromise 被执行了，传入参数为 r ，用 r 作为 reason reject promise
//                 3. 如果都被执行了，或者执行多次，只有第一次生效，之后全被忽略
//                 4. 如果执行then时 throw e
//                     1. 如果 resolvePromise 或者 rejectPromise 已被执行，忽略
//                     2. 用 e 作为 reason reject promise
//             4. 如果 then 不是函数，用 x fulfill promise
//         4. 如果 x 不是个函数或者对象，用 x fulfill promise


// 执行 [[Resolve]](promise, x)
export function resolve(promise: MyPromise, x) {
  // 完全按照 A+ 规范
  if(x === promise) {
    reject(promise, new TypeError('A+ Spec 2.3.1: If promise and x refer to the same object, reject promise with a TypeError as the reason'))
    return
  }
  if(x instanceof MyPromise) {
    if(x.status === 'pending') {
      x.then((value) => {
        fulfill(promise, value)
      }, (reason) => {
        reject(promise, reason)
      })
    }
    if(x.status === 'fulfilled') {
      fulfill(promise, x.value)
    }
    if(x.status === 'rejected') {
      reject(promise, x.reason)
    }
    return
  }
  if(x && (typeof x === 'function' || typeof x === 'object')) {
    let then
    // thenable 不一定保证 res/rej 只执行一次，这里我们保证一下
    let done = false
    try {
      then = x.then
      if(typeof then !== 'function') {
        fulfill(promise, x)
      }
      then.call(x, (y) => {
        if(done) return
        done = true
        resolve(promise, y)
      }, (r) => {
        if(done) return
        done = true
        reject(promise, r)
      })
    }catch(e) {
      // 如果是在 done 之后报的错，也要忽略
      if(!done) {
        reject(promise, e)
      }
    }
    return
  }
  fulfill(promise, x)
}

// 用 value fulfill promise
export function fulfill(promise: MyPromise, value) {
  if(promise.status !== 'pending') return
  promise.status = 'fulfilled'
  promise.value = value

  runQueue(promise, 'fulfilled', promise.value)
  runQueue(promise, 'finally', 'fulfilled', promise.value)
}

// 用 reason reject promise
export function reject(promise: MyPromise, reason) {
  if(promise.status !== 'pending') return
  promise.status = 'rejected'
  promise.reason = reason

  runQueue(promise, 'rejected', promise.reason)
  runQueue(promise, 'finally', 'rejected', promise.reason)
}

// 对于 pending 时注册进的回调，在状态决议后批量执行
function runQueue(promise: MyPromise, type: 'fulfilled' | 'rejected' | 'finally', ...args) {
  promise.deferred[type].forEach(cb => {
    cb(...args)
  })
}

export class MyPromise {
  status: 'pending' | 'fulfilled' | 'rejected'
  value: any
  reason: any
  deferred: {
    fulfilled: Function[],
    rejected: Function[],
    finally: Function[]
  }

  constructor(exe) {

    this.status = 'pending'
    this.value = null
    this.reason = null
    this.deferred = {
      fulfilled: [],
      rejected: [],
      finally: []
    }

    // 保证 res/rej 只支持一次，之后的忽略
    let done = false

    try {
      exe((value) => {
        if(done) return
        done = true
        resolve(this, value)
      }, (reason) => {
        if(done) return
        done = true
        reject(this, reason)
      })
    }catch(e) {
      reject(this, e)
    }

  }

  then(onFulfilled?, onRejected?) {
    let promise2 = new MyPromise(() => {})

    // 立刻执行
    if(this.status === 'fulfilled') {
      if(typeof onFulfilled !== 'function') {
        fulfill(promise2, this.value)
      }else {
        setTimeout(() => {
          try {
            let newValue = onFulfilled.call(undefined, this.value)
            resolve(promise2, newValue)
          }catch(e) {
            reject(promise2, e)
          }
        }, 0)
      }
    }

    if(this.status === 'rejected') {
      if(typeof onRejected !== 'function') {
        reject(promise2, this.reason)
      }else {
        setTimeout(() => {
          try {
            let newValue = onRejected.call(undefined, this.reason)
            resolve(promise2, newValue)
          }catch(e) {
            reject(promise2, e)
          }
        }, 0)
      }
    }

    // 延迟执行，注册进 deferred 数组中
    if(this.status === 'pending') {
      this.deferred.fulfilled.push((value) => {
        if(typeof onFulfilled !== 'function') {
          fulfill(promise2, value)
        }else {
          setTimeout(() => {
            try {
              let newValue = onFulfilled.call(undefined, value)
              resolve(promise2, newValue)
            }catch(e) {
              reject(promise2, e)
            }
          }, 0)
        }
      })
      this.deferred.rejected.push((reason) => {
        if(typeof onRejected !== 'function') {
          reject(promise2, reason)
        }else {
          setTimeout(() => {
            try {
              let newValue = onRejected.call(undefined, reason)
              resolve(promise2, newValue)
            }catch(e) {
              reject(promise2, e)
            }
          }, 0)
        }
      })
    }

    return promise2
  }

  // resolve 的行为：
  // 1. 参数是 promise，原封不动返回
  // 2. 参数是 thenable，试图按照 promise 处理，立刻执行 then
  // 3. 非 thenable，返回 fulfilled 状态的 promise， 值为参数
  // 2和3可以理解为返回一个 promise， [[Resolve]](promise, 参数)

  static resolve(value) {
    if(value instanceof MyPromise) {
      return value
    }
    let result = new MyPromise((res) => {
      res(value)
    })
    return result
  }

  static reject(reason) {
    return new MyPromise((res, rej) => {
      rej(reason)
    })
  }

  // Promise.all 返回一个 promise 实例，遍历执行所有迭代器中的 promise，全部子 promise fulfill 后用 value 形成数组 fulfill 结果 promise（无子 promise 时用 [] fulfill 结果 promise）。若子 promise 出现 reject 用第一个 reason reject 结果 promise。
  static all(iterable) {
    let arr: MyPromise[] = Array.from(iterable)
    let result = new MyPromise(() => {})
    if(arr.length === 0) {
      fulfill(result, [])
    }else {
      let value = []
      let count = 0
      arr.forEach((promise, i) => {
        promise.then((v) => {
          value[i] = v
          count++
          if(count === arr.length) {
            fulfill(result, value)
          }
        }, (r) => {
          reject(result, r)
        })
      })
    }

    return result
  }

  // Promise.race，返回一个 promise，一旦迭代器中的某个 promise fulfill 或 reject，就以此处理结果 promise
  static race(iterable) {
    let arr: MyPromise[] = Array.from(iterable)
    let result = new MyPromise(() => {})

    if(arr.length === 0) {
      fulfill(result, undefined)
    }else {
      arr.forEach(promise => {
        promise.then((value) => {
          fulfill(result, value)
        }, (reason) => {
          reject(result, reason)
        })
      })
    }

    return result
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }

  // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally
  // onFinally 不接受参数 且 this.finally 返回的 promise 状态和值与 this 保持一致，
  finally(onFinally) {
    let promise2 = new MyPromise(() => {})
    if(this.status === 'fulfilled') {
      onFinally.call(undefined)
      fulfill(promise2, this.value)
    }
    if(this.status === 'rejected') {
      onFinally.call(undefined)
      reject(promise2, this.reason)
    }
    if(this.status === 'pending') {
      this.deferred.finally.push((status, value) => {
        if(status === 'fulfilled') {
          onFinally.call(undefined)
          fulfill(promise2, value)
        }
        if(status === 'rejected') {
          onFinally.call(undefined)
          reject(promise2, value)
        }
      })
    }
    return promise2
  }

}

// function time1() {
//   return new MyPromise((res) => {
//     setTimeout(() => {
//       res(1)
//     }, 1000)
//   })
// }

// function time2() {
//   return new MyPromise((res, rej) => {
//     setTimeout(() => {
//       rej(3)
//     }, 2000)
//   })
// }

// function time3() {
//   return new MyPromise((res) => {
//     setTimeout(() => {
//       res(3)
//     }, 3000)
//   })
// }

// console.log('all inited')
// MyPromise.race([time1(), time2(), time3()]).then((value) => {
//   console.log('fu')
//   console.log(value)
// }, (reason) => {
//   console.log('re')
//   console.log(reason)
// })