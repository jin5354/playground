// 构造函数 new 的 4步骤
// 1. 创建一个全新对象
// 2. 全新对象执行 [[prototype]] 链接
// 3. 将全新对象绑定到this
// 4. 如果函数没返回其他值，就返回这个全新对象

function Test(arg1, arg2) {
  this.arg1 = arg1
  this.arg2 = arg2
}

Test.prototype.p = '123'
Test.prototype.sayArg1 = function() {
  console.log(this.arg1)
}

function objectFactory(con) {
  let args = Array.prototype.slice.call(arguments, 1)

  let instance = Object.create(con.prototype)
  let result = con.apply(instance, args)
  return typeof result === 'object' ? result : instance
}

let test = objectFactory(Test, 1, 2)