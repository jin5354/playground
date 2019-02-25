// 实现一些常见的 lodash 方法

// curry
// 函数柯里化，复用
export function curry(func, ...args) {
  // 根据 func.length 获取函数形参数量。如果传入的参数已足够，执行 func，否则返回一个函数，继续接收新参数
  let length = func.length
  if(args.length === length) {
    return func(...args)
  }else {
    return function(...newArgs) {
      return curry(func, ...args, ...newArgs)
    }
  }
}

function add(a, b, c) {
  return a + b + c
}

console.log(curry(add, 1, 2, 3))
console.log(curry(add)(1)(2)(3))
console.log(curry(add, 1)(2)(3))
console.log(curry(add)(1, 2)(3))
console.log(curry(add)(1, 2, 3))

// deepClone
// 用 typeof === 'object' 来判断对象的话，要注意排除 null
// 问题： funciton 未能进入递归，挂的属性不是 deepClone
export function deepClone(obj) {
  if(!obj || typeof obj !== 'object') {
    return obj
  }
  let result = Array.isArray(obj) ? [] : {}
  for(let key in obj) {
    if(obj.hasOwnProperty(key)) {
      result[key] = (obj && typeof obj[key] === 'object') ? deepClone(obj[key]) : obj[key]
    }
  }
  return result
}

// 数组去重
export function unique(ary: any[]) {
  let result = []
  // 如果用 Object 做 hashmap，由于 Object 的 key 只能是字符串，所以 1 和 '1' 会被认为是同一种，对象也没法存，不是合适的 hashmap
  // 只有 Map 是合适的 hashmap，做到总时间复杂度 O(n) 但是都用 es6 了，直接用 Set 一行就完事了。 Array.from(new Set(ary))
  // 在 es6 前，为了准确，只好用数组做 hashmap，但是用 indexOf 寻址复杂度为 O(n)，总时间复杂度为 O(n^2)，这就蛋疼了，不过也没办法
  let hashMap = []
  ary.forEach(e => {
    if(hashMap.indexOf(e) === -1) {
      result.push(e)
      hashMap.push(e)
    }
  })
  return result
}

export function uniqueES6(ary: any[]) {
  return Array.from(new Set(ary))
}

let testUniqueAry = [1, 1, 2, 3, 'a', 4, 'a', '1']
console.log(unique(testUniqueAry))
console.log(uniqueES6(testUniqueAry))

// 数组扁平化
// 遍历数组，随后产生一个汇总结果，用 reduce 不错
// 深层嵌套就用递归
export function flatten(ary) {
  return ary.reduce((prev, next) => {
    return prev.concat(Array.isArray(next) ? flatten(next): [next])
  }, [])
}

let testFlattenAry = [1, 2, [3, 4, [5]], [6, [[[[7]]]]]]
console.log(flatten(testFlattenAry))

function test() {
  console.log('测试用输出')
}

// 防抖 debounce
// 注意点：防抖和节流一般用在浏览器事件回调函数，此时 this 指向 dom 节点。所以 func 不能直接执行（this 指向 window 了），要绑一下 this
console.log('测试防抖：')

export function debounce(func: Function, time: number) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.call(this, ...args)
    }, time)
  }
}

let debouncedTest = debounce(test, 1000)

debouncedTest()
debouncedTest()
setTimeout(() => {
  debouncedTest()
},200)
setTimeout(() => {
  debouncedTest()
},400)
setTimeout(() => {
  debouncedTest()
},2000)

// 节流 throttle
console.log('\n测试节流：')

export function throttle(func: Function, time: number) {
  let timer = null
  return function(...args) {
    if(timer) return
    timer = setTimeout(() => {
      func.call(this, ...args)
      timer = null
    }, time)
    // 若要做到首次立刻执行，将 func.call 移动到此行位置即可
  }
}

let throttledTest = throttle(test, 500)

throttledTest()
setTimeout(() => {
  throttledTest()
}, 200)
setTimeout(() => {
  throttledTest()
}, 400)
setTimeout(() => {
  throttledTest()
}, 600)
setTimeout(() => {
  throttledTest()
}, 800)
setTimeout(() => {
  throttledTest()
}, 1100)