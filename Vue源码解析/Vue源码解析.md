# Vue源码解析

## 目标

1. 深入理解vue底层原理
2. 手写vue核心部分代码

## 要点

- vue工作机制

- vue响应式原理

- 依赖收集与追踪

- 模板编译compile

## 为什么要懂原理

编程世界其实和武侠事件很像，每一个有追求的程序员，都幻想着有朝一日能名闻天下，万人敬仰，但是在修炼的路上很多人看中招式，武器，而忽略了内功的修炼，导致耗费了大量的经历，学到的却是些中看不中用的花拳绣腿。

武学之道，切勿贪多嚼不烂，博而不精不如一招鲜吃遍天，编程亦是如此，读源码，悟原理就是修炼内功的捷径。

## Vue工作机制

1. **初始化**

在new Vue() 之后，Vue会调用init方法进行初始化，会初始化生命周期、事件、props、methods、data、computed与watch等。其中最重要的是通过Object.defineProperty 设置setter与getter,用来实现【响应式】和【依赖收集】。

初始化之后调用$mount挂载组件

![img](https://upload-images.jianshu.io/upload_images/8082826-0c9309d9fb63e521.PNG?imageMogr2/auto-orient/strip%7CimageView2/2/w/767/format/webp)

自制版：

![](.\assets\vue.png)

2. **编译**

   编译模块分为三个阶段

   1. parse
      1. 使用正则解析template中vue的指令、class、style等数据，形成AST。
   2. optimize
      1. optimize 的主要作用是标记 static 静态节点，这是 Vue 在编译过程中的一处优化，后面当 update 更新界面时，会有一个 patch 的过程， diff 算法会直接跳过静态节点，从而减少了比较的过程，优化了 patch 的性能。
   3. generate
      1. generate 是将 AST 转化成 render function 字符串的过程，得到结果是 render 的字符串以及 staticRenderFns 字符串。


## vue响应式原理

1. `defineProperty`初体验

```js
<body>
  <div id="app">
      <input type="text" id="txt">
      <p id="show-txt"></p>
  </div>
  <script>
      var obj = {}
      Object.defineProperty(obj, 'txt', {
          get: function () {
              return document.getElementById('txt').value
          },
          set: function (newValue) {
              document.getElementById('txt').value = newValue
              document.getElementById('show-txt').innerHTML = newValue
          }
      })
      document.addEventListener('keyup', function (e) {
          obj.txt = e.target.value
      })
  </script>
</body>
```

2. 利用defineProperty实现数据侦听

```js
  <body>
    <script src="svue.js"></script>
    <script>
      const sm = new SVue({
        data: {
          test: "I am test",
          foo: {
            bar: "bar"
          }
        }
      });
      sm.$data.test = "hello world!";
      sm.$data.foo.bar = "foo";
    </script>
  </body>

class SVue {
  constructor(options) {
    // 保存选项
    this.$options = options;
    // 传入data选项
    this.$data = options.data;
    this.observe(this.$data);
  }
  observe(data) {
    if (!data || typeof data !== "object") {
      return;
    }
    // 遍历对象
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key]);
    });
  }
  // 数据响应化
  defineReactive(data, key, val) {
    this.observe(val); // 递归解决数据嵌套问题
    Object.defineProperty(data, key, {
      get() {
        return val;
      },
      set(newval) {
        if (newval === val) {
          return;
        }
        val = newval;
        console.log(`${key}属性更新了：${val}`);
      }
    });
  }
}

```

## 依赖收集与追踪

看下面案例，分析得出思路：

```js
    <div id="app">
      <span>{{ name1 }}</span>
      <span>{{ name2 }}</span>
      <span>{{ name1 }}</span>
    </div>

    new Vue({
      el: "#app",
      data: {
        name1: 'name1',
        name2: 'name2',
        name3: 'name3'
      },
      created(){
        this.name1 = 'rose',
        this.name3 = 'jack'
      }
    })
```

分析：

> name1被修改，视图更新，且好更新两处；
>
> name2被修改，视图更新一处；
>
> name3没用到，不需要更新；
>
> vue是如何实现的呢？需要扫描视图收集依赖，收集到视图中到底哪些地方对数据有依赖，这样，当数据发生变化时，就知道要更新谁了。

## 模板编译compile