# call与apply模拟实现

## call与apply相同点与不同点

相同点：

1. 都是为了改变函数运行时的this指向, 并立即执行改变了this指向的函数
2. 第一个参数都是你想要指定的this，也就是想指定的上下文

不同点：

1. call方法中，除第一个参数外，剩余参数以逗号分隔，逐个传入
2. apply方法中，除第一个参数外，甚于参数以数组的形式传入

## call模拟实现

先看例子：

```js
var person = {
    skill: 'speak'
};

function xiaoming() {
    console.log(this.skill);
}

xiaoming.call(person); // speak
```

运行上面代码， xiaoming 函数本身并没有skill，但是通过call方法，输出了`speak`，也就是说call方法实现了俩个效果：

1. call 改变了this的指向，指向了传入的参数 person对象
2. xiaoming方法执行了

顺着上面的思路，我们来模拟实现上面来个效果

```js
var person = {
    skill: 'speak',
    xiaoming: function() {
        console.log(this.skill)
    }
}

person.xiaoming() // speak
```

上面代码虽然实现了效果，但是有一个副作用，就是给person上新增了一个方法，显然是不合理的，所以要在函数执行完成后删除，思路分析如下：

1. 将call的调用者(函数)设置为传入参数的属性
2. 执行该函数
3. 删除该函数

根据上面的思路，来实现第一版mycall函数：

```js
Function.prototype.mycall = function(target) {
	// 1. 将call的调用者(函数)设置为传入参数的一个属性
	target.fn = this
    // 2. 执行该函数
    target.fn()
    // 3. 删除该函数
    delete target.fn
}

var person = {
    skill: 'speak'
};

function xiaoming() {
    console.log(this.skill);
}

xiaoming.mycall(person); // speak
```

我们知道，call方法除了可以传入第一个参数改变this指向，还可以传入第二个、第三个、......、第N个参数，接下来，我们就来考虑传入多个参数的情况，先看原版的call方法：

```js
var person = {
    skill: 'speak'
};

function xiaoming(age,gender) {
    console.log(age)
    console.log(gender)
    console.log(this.skill);
}

xiaoming.call(person,18,'男'); 
// 18
// 男
// speak
```

需要注意的是，传入的参数个数不定，怎么办呢？

我们知道，在ES6出现之前，函数有一个默认参数是arguments，它是一个类数组对象，举个例子：

```js
function foo(){
	console.log(arguments)
}
foo(1,2,3,'xiaohong','唱歌')
```

运行结果如下图：

![](assets\Snipaste_2019-07-12_11-29-03.png)

如果想要获取除第一参数之后的所有参数，我们可以从索引`1`循环遍历arguments，将传入的参数push到一个自己定义的数组中，不过，ES6之后，引入了rest参数，形式为(...rest),用于获取函数的多余参数，这样就不需要arguments对象了，所以我们的第二版代码如下：

```js
Function.prototype.mycall = function (target, ...rest) {
    target.fn = this
    context.fn(...rest)
    delete context.fn
}

var person = {
    skill: 'speak'
};

function xiaoming(age,gender) {
    console.log(age)
    console.log(gender)
    console.log(this.skill);
}

xiaoming.mycall(person,18,'男'); 
```

到此，我们已经实现了传入多个参数的情况，不过还有俩个问题需要解决：

1. 原生call函数第一个参数可以传null, 非严格模式下，传入null视为指向window
2. 函数可以有返回值

接下来， 我们就来解决上面俩个问题，代码如下：

```js
Function.prototype.mycall = function (target, ...rest) {
    // 若target不为null, 就用传入的target，反之，用window
    var target = target || window 
    target.fn = this
    // 若函数有返回值，接收返回值，然后return出去
    var result = target.fn(...rest)
    delete target.fn
    return result
}
var skill = 'paly'
var person = {
    skill: 'speak'
};

function xiaoming(age,gender) {
    // 验证传入null时，this执行window
    console.log(this.skill); // play
    // 验证有返回值
    return {
        skill: this.skill,
        // age: age
        age,
        // gender: gender
        gender
    }
}

xiaoming.mycall(null,18,'男'); 
console.log(xiaoming.mycall(person,'jack',18))
```

到此call的模拟实现就已经完成了

## apply模拟实现

通过对比我们知道apply实现的功能与call功能相同，只是第二个参数类型不同，实现代码如下：

```js
Function.prototype.myapply = function(target,arr) {
	var target = target || window
	target.fn = this
	var result = target.fn(...arr)
	delete target.fn
	return result
}

var skill = 'heihei'
var person = {
    skill: 'speak'
};

function xiaoming(m,n) {
    console.log(this.skill);
	return {
		skill: this.skill,
		m,
		n
	}
}
```