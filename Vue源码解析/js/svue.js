class SVue {
  constructor(options) {
    // 保存选项
    this.$options = options;
    // 传入data选项
    this.$data = options.data;
    this.observe(this.$data);

    // 模拟watcher创建
    // new Watcher();
    // // 通过访问test属性触发get方法，添加依赖
    // this.$data.test;
    // new Watcher();
    // this.$data.foo.bar;

    new Compile(options.el, this);

    // created执行
    if (options.created) {
      options.created.call(this);
    }
  }
  observe(data) {
    if (!data || typeof data !== "object") {
      return;
    }
    // 遍历对象
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key]);
      // 代理data中的属性到vue的实例上
      this.proxyData(key);
    });
  }
  // 数据响应化
  defineReactive(data, key, val) {
    this.observe(val); // 递归解决数据嵌套问题

    const dep = new Dep();

    Object.defineProperty(data, key, {
      get() {
        if (Dep.target) {
          dep.addDep(Dep.target);
        }
        return val;
      },
      set(newval) {
        if (newval === val) {
          return;
        }
        val = newval;
        // console.log(`${key}属性更新了：${val}`);
        dep.notify();
      }
    });
  }

  // 数据代理方法
  proxyData(key) {
    Object.defineProperty(this, key, {
      get() {
        return this.$data[key];
      },
      set(newval) {
        this.$data[key] = newval;
      }
    });
  }
}

// Dep: 用来管理watcher
class Dep {
  constructor() {
    // 存放依赖
    this.deps = [];
  }
  addDep(dep) {
    this.deps.push(dep);
  }
  notify() {
    this.deps.forEach(dep => {
      dep.update();
    });
  }
}
