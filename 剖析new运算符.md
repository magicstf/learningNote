# 剖析new运算符

## 作用：

1. 如果作用于内置对象，那么内置对象必须具有构造函数，最终生成一个内置对象的实例

   ```
   var fn = new Function()
   typeof fn // function
   
   var obj = new Object()
   typeof obj // object
   
   var num = new Number()
   typeof num // object 用基本包装类型创建的变量类型均为object
   
   var str = new String()
   typeof str // object
   ```

2. ​	如果作用于自定义的函数(一般称作构造函数，虽然和普通的函数没什么区别)，那么会生成一个该构造函数的实例对象

   ```js
   var Person = function(name){
       this.name = name
   }
   
   var xiaoming = new Person()
   
   p instanceof Person // true
   ```

## 效果：

我们来看一个例子，总结一下new实现了哪些效果

```js
var Person = function(name, age) {
    this.name = name
    this.age = age
}

Person.prototype.job = 'FE'
Person.prototype.skill = function(){
	console.log('Hi,'+this.name)
}

var xiaoming = new Person('xiaoming',18)
xiaoming.name // xiaoming
xiaoming.age // 18
xiaoming.job // FE
xiaoming.skill() // Hi,xiaoming
```

从上面例子我们看到，通过new运算符创建出来的Person实例对象xiaoming有如下特点：

1. 可以访问到Person构造函数里面的属性
2. 可以访问到Person原型上的属性

## 实现

> 根据我们分析出来的来个效果，我们来实现我们第一版代码，由于new是关键字，我们无法覆盖，所以我们通过一个simulateNew函数来模拟它实现的功能，用法如下所示：

```js
// 使用new
var xiaoming = new Person('xiaoming',18)
// 使用simulateNew
var xiaoming = simulateNew(Person,'xiaoming',18)
```

接下来我们就细化分析一下我们模拟实现new函数simulateNew中要完成哪些功能：

1. 我们知道new运算符的结果是一个实例对象，所以，在函数中我们需要新建一个空对象，并返回
2. 返回的对象中可以访问构造函数中的属性，我们可以通过Person.apply(obj)使得obj拥有了Person构造函数中的属性
3. 返回的对象总可以访问原型上的属性，我们可以通过将构造函数的prototype赋值给实例的`__proto__`来建立起实例与构造函数的继承关系，这样，实例就可以访问到原型上的属性了

上代码：

```js
var simulateNew = function(...rest) {
    // 创建一个新对象
    var obj = {},
    // 取出第一个参数，并从参数中移除
    Constructor = rest.shift()
    // 将obj的原型指向构造函数的原型 这样obj就可以访问到构造函数原型中的属性了
    obj.__proto__ = Constructor.prototype
    // 使用apply，改变构造函数的this指向obj,这样obj就可以访问到构造函数中的属性了
    Constructor.apply(obj, rest)
    // 返回obj
    return obj
}
```

别急，上面代码只是完成了构造函数没有返回值的情况，接下来，我们来完善代码，考虑有返回值的情况：

返回值有三种情况：

1. 返回普通类型
2. 返回非null的对象类型
3. 返回null

我们用代码验证一下第一种情况：

```js
var Person = function(name, age) {
    this.name = name
    this.age = age
	return 1
}

Person.prototype.job = 'FE'
Person.prototype.skill = function(){
	console.log('Hi,'+this.name)
}

var xiaoming = new Person('xiaoming',18)

xiaoming

// Person {name: "xiaoming", age: 18}
// age: 18
// name: "xiaoming"
// __proto__: Object
xiaoming.name // xiaoming
xiaoming.age // 18
xiaoming.job // FE
xiaoming.skill() // Hi, xiaoming
```

我们发现返回普通类型时，对生成的实例没有影响

接下来我们来验证一下第二种情况：

```js
var Person = function(name, age) {
    this.name = name
    this.age = age
	return {
		gender: '男',
	}
}

Person.prototype.job = 'FE'
Person.prototype.skill = function(){
	console.log('Hi,'+this.name)
}

var xiaoming = new Person('xiaoming',18)

xiaoming

// {gender: "男"}
// gender: "男"
// __proto__: Object
xiaoming.name // undefined
xiaoming.age // undefined
xiaoming.gender // 男
xiaoming.job // undefined
xiaoming.skill() // 报错 Uncaught TypeError: xiaoming.skill is not a function
```

我们看到，当返回非null的对象类型时，new运算符创建的实例对象是构造函数的返回值

第三种情况：

```js
var Person = function(name, age) {
    this.name = name
    this.age = age
	return null
}

Person.prototype.job = 'FE'
Person.prototype.skill = function(){
	console.log('Hi,'+this.name)
}

var xiaoming = new Person('xiaoming',18)
xiaoming

// Person {name: "xiaoming", age: 18}
// age: 18
// name: "xiaoming"
// __proto__: Object
```

我们看到，当构造函数返回null时，和没返回值时返回的是一样的

综上考虑，我们来写最后的版本：

```js
var simulateNew = function(...rest) {
    // 创建一个新对象
    var obj = {},
    // 取出第一个参数，并从参数中移除
    Constructor = rest.shift()
    // 将obj的原型指向构造函数的原型 这样obj就可以访问到构造函数原型中的属性了
    obj.__proto__ = Constructor.prototype
    // 使用apply，改变构造函数的this指向obj,这样obj就可以访问到构造函数中的属性了
    var result = Constructor.apply(obj, rest)
    // 判断返回值result类型，注意typeof null类型为object,所以 当返回值为null时，和没有返回值一样，返回obj
    return typeof result === 'object' ? result || obj : obj
}
```

