// 函数参数按值传递，即把函数外部的值复制给函数内部的参数
// 对于基本类型值，复制基本类型值
// 对于引用类型值，复制引用类型的值（即复制的是指针）

console.log('example1:')

let test1 = 1
function foo1(o): void {
  o = 2
  console.log(o); // 2
}
foo1(test1);
console.log(test1) // 1

let obj2 = {
  value: 1
}
function foo2(o): void {  //o 为指针，类似 let o = obj2
  o.value = 2
  console.log(o.value); //2
}
foo2(obj2)
console.log(obj2.value) // 2

let obj3 = {
  value: 1
}
function foo3(o): void { //o 为指针，类似 let o = obj3
  o = 3
  console.log(o); // 3
}
foo3(obj3)
console.log(obj3) // {value: 1}