// 闭包示例
console.log('example1:')

let scope = 'global scope'

function checkScope(): Function {
  let scope = 'function scope'

  function test(): void {
    console.log(scope)
  }

  return test
}

checkScope()()


// let 块级作用域
console.log('\nexample2:')

var data = [];

for (var i = 0; i < 3; i++) {
  data[i] = function () {
    console.log(i);
  };
}

data[0]()
data[1]()
data[2]()

let data2 = [];

for (let i = 0; i < 3; i++) {
  data2[i] = function () {
    console.log(i);
  };
}

data2[0]()
data2[1]()
data2[2]()