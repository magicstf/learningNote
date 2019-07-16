# bind方法模拟实现

作用：

`bind()`方法创建一个新的函数，在`bind()`被调用时，这个新函数的this被bind的第一个参数指定，其余的参数将作为新函数的参数供调用时使用。

由此我们可以得出使用bind后的效果是:

1. 返回一个this由bind方法第一个参数指定的新函数
2. 可以传入其他参数作为新函数的参数来使用

我们先看原生bind方法的效果：

```js
var module = {
  x: 42,
  getX: function() {
    return this.x;
  }
}

var unboundGetX = module.getX;
// 函数在全局范围内调用，由于全局范围内没有x, 所以
console.log(unboundGetX()); // undefined

// 使用bind将this指向module，由于module中有x, 所以
var boundGetX = unboundGetX.bind(module);
console.log(boundGetX()); // 42
```

接下来我们就来实现第一个效果，在这里，我们要用到call或者apply, 关于call和apply的实现可以看[call和apply模拟实现]([https://github.com/magicstf/learningNote/blob/master/js-call%E4%B8%8Eapply%E6%A8%A1%E6%8B%9F%E5%AE%9E%E7%8E%B0.md](https://github.com/magicstf/learningNote/blob/master/js-call与apply模拟实现.md)) ，上代码：

```js
Function.prototype.mybind = function (target) {
    return () => {
        return this.apply(target);
    }
}
```

此处，之所以 `return self.apply(context)`，是考虑到绑定函数可能是有返回值的，接下来，我们来看下如果实现第二个效果，传入其他参数：

```js
var module = {
  x: 42,
  getX: function(name, age) {
    console.log(name);
    console.log(age);
    return this.x;
  }
}
var unboundGetX = module.getX;
// 使用bind将this指向module，由于module中有x, 所以
var boundGetX = unboundGetX.bind(module,'xiaoming', 18);
// 或者
var boundGetX2 = unboundGetX.bind(module,'xiaoming');
console.log(boundGetX());
console.log(boundGetX2(18)); // xiaoming 18 42
```

以上代码 boundGetX和boundGetX2都正确的输出了结果，也就是说，你既可以使用bind时传入参数， 也可以在调用返回的新函数时传入参数，情况有点多，我们来看代码：

```js
Function.prototype.mybind = function (target,...outerRest) {
    return (...innerRest) => {
        return this.apply(target, outerRest.concat(innerRest));
    }
}
```

为了逻辑的严谨，我们需加一个判断，调用bind方法的必须是一个函数，代码如下:

```js
Function.prototype.mybind = function (target,...outerRest) {
    if( typeof this !== "function" ){
       throw new Error("Uncaught TypeError:"+ this.name +".bind is not a function")
    }
    return (...innerRest) => {
        return this.apply(target, outerRest.concat(innerRest));
    }
}
```

写在最后的话，可能细心的同学已经发现了，我们的bind和原生的bind有些不一样：我们用代码来验证:

```js
var x = 24
var module = {
  x: 42,
  getX: function(name,age) {
    console.log(this.x)
    console.log(name)
    console.log(age)
    return this.x;
  }
}

var unboundGetX = module.getX;

var boundGetX = unboundGetX.bind(module,'xiaoming');
var newf = new boundGetX(18) // xiaoming 18 undefined


```

> 注意：尽管在全局和 module 中都声明了 x 的值，最后依然返回了 undefind，说明绑定的 this 失效了，如果大家了解 new 的模拟实现，就会知道这个时候的 this 已经指向了 newf

而我们自己实现的mybind结果是：

```js
var x = 24
var module = {
  x: 42,
  getX: function() {
    console.log(this.x)
    return this.x;
  }
}

var unboundGetX = module.getX;

var boundGetX = unboundGetX.mybind(module);
var newf = new boundGetX() // Uncaught TypeError: boundGetX is not a constructor
```

报错了，莫慌，这是因为我们返回了一个箭头函数，而箭头函数有一个特点就是没有构造器，不能作为构造函数使用，我们稍作改动，看代码：

```js
Function.prototype.mybind = function (target,...outerRest) {
    if( typeof this !== "function" ){
       throw new Error("Uncaught TypeError:"+ this.name +".bind is not a function")
    }
    var _this = this
    return function(...innerRest) {
        return _this.apply(target, outerRest.concat(innerRest));
    }
}
```

再次运行上面代码：

```js
var x = 24
var module = {
  x: 42,
  getX: function() {
    console.log(this.x)
    return this.x;
  }
}

var unboundGetX = module.getX;

var boundGetX = unboundGetX.mybind(module);
var newf = new boundGetX() // 42
```

对比发现：原生的bind方法有一个特点：当把用bind方法返回的新函数作为构造函数，使用new创建对象时，bind方法提供的this会被忽略，不过后面的参数会正确的传入。

个人观点：个人觉得这是原生bind方法的一个bug, 既然用bind,肯定是想改变this指向，然后再把改变了this指向后的函数作为构造函数创建新对象。

不过为了实现和原生bind方法一模一样的效果，我们来改造我们的bind:

```js
Function.prototype.mybind = function (target,...outerRest) {
    if( typeof this !== "function" ){
       throw new Error("Uncaught TypeError:"+ this.name +".bind is not a function")
    }
    var _this = this;
     // this instanceof fBound === true时,说明返回的fBound被当做new的构造函数调用
    var fBound = function (...innerRest) { 
        return _this.apply(this instanceof fBound ? this : target, outerRest.concat(innerRest));
    }
    
    fBound.prototype = this.prototype;
    return fBound;
}
```

bind实现先写到这里，里面还有很多问题，比如原生bind绑定后new的实例和模拟的方法new出来的实例的原型链不一样,会多一层。

大家如果有更好的实现，欢迎讨论，共同进步。