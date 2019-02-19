// 模拟实现 call apply bind

// 改变 this 指向原理，将函数作为 this 目标属性进行调用，this 就会指向目标。
// 对于基本类型值用 Object 包装一下，对于 null/undefined 处理为 window（非严格模式）

Function.prototype.call2 = function(thisArg, ...argArray) {
  thisArg = Object(thisArg) || window
  thisArg._fn = this
  //es6
  //thisArg._fn(...argArray)
  let argStrings = []
  for(let i = 1, len = arguments.length; i < len; i++) {
    argStrings.push('arguments[' + i + ']')
  }
  let result = eval('thisArg._fn(' + argStrings.join(',') + ')')
  delete thisArg._fn
  return result
}

let foo = {
  bar: 1
}

function test(arg1, arg2) {
  console.log(this.bar, arg1, arg2)
}

test()
test.call(foo, 1, 2)
test.call2(foo, 1, 2)
test.call(null, 1, 2)
test.call2(null, 1, 2)
test.call('123', 1, 2)
test.call2('123', 1, 2)

// apply 类似，只是传参方式变为数组

Function.prototype.apply2 = function(thisArg, args) {
  thisArg = Object(thisArg) || window
  thisArg._fn = this
  let argStrings = []
  for(let i = 0, len = args.length; i < len; i++) {
    argStrings.push('args[' + i + ']')
  }
  let result = eval('thisArg._fn(' + argStrings.join(',') + ')')
  delete thisArg._fn
  return result
}

let foo2 = {
  bar: 1
}

function test2(arg1, arg2) {
  console.log(this.bar, arg1, arg2)
}

test2()
test2.apply(foo2, [1, 2])
test2.apply2(foo2, [1, 2])
test2.apply(null, [1, 2])
test2.apply2(null, [1, 2])
test2.apply('123', [1, 2])
test2.apply2('123', [1, 2])

// 问题1： bind 支持预先埋几个参数，实际调用时再补充几个参数
// 解决：将两次传入的参数 concat 起来，使用 apply 传入
// 问题2： 若原函数用途为构造函数，那么 bind 产生的绑定函数也可以使用 new 调用，此时 this 无效，但预先埋入的参数有效
// 解决：使用 instanceof 判断是否为 new 调用场景，若是，则模拟 new 用途：将 this 绑定到新创建对象，同时将绑定函数的原型链继承到原函数上

Function.prototype.bind2 = function(thisArg) {
  let that = this
  let args =  Array.prototype.slice.call(arguments, 1)
  let newBind = function() {
    arguments = Array.prototype.slice.call(arguments)
    // 如果是 new 调用，此时 this 是新创建对象（详见 new 执行过程），且 instanceof newBind 为 true
    return that.apply(this instanceof newBind ? this : thisArg, args.concat(arguments))
  }

  // 绑定函数添加原型链，模拟 newBind.prototype = Object.create(that.prototype)，让实例能拿到原函数原型的值，模拟原生 bind 行为
  bindedF.prototype = Object.create(funSelf.prototype)

  return newBind
}

let foo3 = {
  bar: 1
}

function test3(arg1, arg2) {
  console.log(this.bar, arg1, arg2)
}

test3()
let b1a = test3.bind(foo3, 1)
b1a(2)
let b1b = test3.bind2(foo3, 1)
b1b(2)
let b2a = test3.bind(null, 1)
b2a(2)
let b2b = test3.bind2(null, 1)
b2b(2)
let b3a = test3.bind('123', 1)
b3a(2)
let b3b = test3.bind2('123', 1)
b3b(2)
