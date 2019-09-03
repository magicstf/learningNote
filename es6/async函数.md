# async函数

> ES2017 标准引入了 async 函数，使得`异步操作`变得更加方便。

## async函数是什么

`async`函数就是`Generator`函数的语法糖

## Generator函数

### Generator函数是什么

Generator 函数是 ES6 提供的一种`异步编程解`决方案，执行 Generator 函数会返回一个**遍历器对象**。

俩个特征：

1. `function`关键字与函数名之间有一个星号
2. 函数体内部使用`yield`表达式，定义不同的内部状态

eg:

```js
function* helloGenerator() {
  yield 'hello';
  yield 'Generator';
  return 'ending';
}

var hg = helloGenerator();
```

Generator 函数的调用方法与普通函数一样，也是在函数名后面加上一对圆括号。不同的是，调用 Generator 函数后，该函数并不执行，返回的也不是函数运行结果，而是一个指向内部状态的指针对象, 即`遍历器对象`.

Generator 函数是分段执行的，`yield`表达式是暂停执行的标记，而`next`方法可以继续执行

```js
hg.next()
// { value: 'hello', done: false }

hg.next()
// { value: 'Generator', done: false }

hg.next()
// { value: 'ending', done: true }

hg.next()
// { value: undefined, done: true }
```

调用next方法，Generator 函数开始执行，直到遇到第一个`yield`表达式为止。`next`方法返回一个对象，它的`value`属性就是当前`yield`表达式的值，`done`属性的值是一个布尔值，代表遍历是否结束。

总结一下，调用 Generator 函数，返回一个遍历器对象，代表 Generator 函数的内部指针。以后，每次调用遍历器对象的`next`方法，就会返回一个有着`value`和`done`两个属性的对象。`value`属性表示当前的内部状态的值，是`yield`表达式后面那个表达式的值；`done`属性是一个布尔值，表示是否遍历结束。

### yield表达式

Generator 函数返回的遍历器对象，只有调用`next`方法才会遍历下一个内部状态，所以其实提供了一种可以暂停执行的函数。`yield`表达式就是暂停标志。

遍历器对象的`next`方法的运行逻辑如下：

（1）遇到`yield`表达式，就暂停执行后面的操作，并将紧跟在`yield`后面的那个表达式的值，作为返回的对象的`value`属性值。

（2）下一次调用`next`方法时，再继续往下执行，直到遇到下一个`yield`表达式。

（3）如果没有再遇到新的`yield`表达式，就一直运行到函数结束，直到`return`语句为止，并将`return`语句后面的表达式的值，作为返回的对象的`value`属性值。

（4）如果该函数没有`return`语句，则返回的对象的`value`属性值为`undefined`。

> `yield`表达式后面的表达式，只有当调用`next`方法、内部指针指向该语句时才会执行

`yield`表达式与`return`语句的相同点与不同点：

相同点:

1. 都返回紧跟在语句后面的那个表达式的值

不同点:

1. 每次遇到`yield`，函数暂停执行，下一次再从该位置继续向后执行，而`return`语句不具备位置记忆功能。
2. 一个函数里面，只能有一个`return`语句, 但是可以有多个`yield`表达式。
3. 正常函数只能返回一个值，因为只能有一个`return`语句，而`Generator `函数可以返回一系列的值，因为可以有任意多个`yield`。

`特别注意`: Generator函数中可以没有`yield`, 此时，这个函数变成了一个单纯的暂缓执行函数，但是，`yield`表达式必须用在`Generator`中，否则，会报错。

### next 方法的参数

`yield`表达式本身没有返回值，或者说总是返回`undefined`。`next`方法可以带一个参数，该参数就会被当作上一个`yield`表达式的返回值。

Generator 函数从暂停状态到恢复运行，它的上下文状态（context）是不变的。通过`next`方法的参数，就有办法在 Generator 函数开始运行之后，继续向函数体内部注入值。也就是说，可以在 Generator 函数运行的不同阶段，从外部向内部注入不同的值，从而调整函数行为。

`注意`: 由于`next`方法的参数表示上一个`yield`表达式的返回值，所以在第一次使用`next`方法时，传递参数是无效的。

### for...of 循环

`for...of`循环可以自动遍历 Generator 函数运行时生成的`Iterator`对象，且此时不再需要调用`next`方法。

```javascript
function* foo() {
  yield 1;
  yield 2;
  yield 3;
  yield 4;
  yield 5;
  return 6;
}

for (let v of foo()) {
  console.log(v);
}
// 1 2 3 4 5
```

注意，一旦`next`方法的返回对象的`done`属性为`true`，`for...of`循环就会中止，且不包含该返回对象，所以上面代码的`return`语句返回的`6`，不包括在`for...of`循环之中。

除了`for...of`循环以外，扩展运算符（`...`）、解构赋值和`Array.from`方法内部调用的，都是遍历器接口。这意味着，它们都可以将 Generator 函数返回的 Iterator 对象，作为参数。

```javascript
function* numbers () {
  yield 1
  yield 2
  return 3
  yield 4
}

// 扩展运算符
[...numbers()] // [1, 2]

// Array.from 方法
Array.from(numbers()) // [1, 2]

// 解构赋值
let [x, y] = numbers();
x // 1
y // 2

// for...of 循环
for (let n of numbers()) {
  console.log(n)
}
// 1
// 2
```

### Generator函数的应用

#### 异步

##### 传统方法

ES6 诞生以前，异步编程的方法，大概有下面四种。

- 回调函数
- 事件监听
- 发布/订阅
- Promise 对象

Generator 函数将 JavaScript 异步编程带入了一个全新的阶段。

#### 控制流管理

#### 控制流管理

#### 作为数据结构