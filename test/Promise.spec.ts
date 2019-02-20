import * as promisesAplusTests from 'promises-aplus-tests'
import {MyPromise, resolve, reject} from '../fundamental/Promise'

let adapter = {
  resolved: MyPromise.resolve,
  rejected: MyPromise.reject,
  deferred() {
    let testPromise = new MyPromise(() => {})

    return {
      promise: testPromise,
      resolve(value) {
        resolve(testPromise, value)
      },
      reject(reason) {
        reject(testPromise, reason)
      }
    }
  }
}

promisesAplusTests(adapter, (err) => {
  console.log(err)
})
