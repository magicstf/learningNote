
function defineReactive(data, key, val) {
  // 判断val类型，如果为对象，调用observe为子属性添加get/set方法
  if (typeof val === "object") {
    observe(val);
  }
  var dep = new Dep();
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: false,
    get: function() {
      if (Dep.target) { // 判断是否需要添加订阅器
        dep.addSub(Dep.target); 
      }
      return val;
    },
    set: function(newVal) {
      if (val === newVal) return;
      val = newVal;
      dep.notify();
    }
  });
}
Dep.target = null;

function observe(data) {
  if (!data || typeof data !== "object") {
    return;
  }
  // 当data是对象时
  if (!Array.isArray(data)) {
    const keys = Object.keys(data);
    keys.forEach(key => {
      defineReactive(data, key, data[key]);
    });
  }
}

// 订阅器Dep
function Dep() {
  this.subs = [];
}

Dep.prototype = {
  addSub: function(sub) {
    this.subs.push(sub);
  },
  notify: function() {
    this.subs.forEach(function(sub) {
      sub.update();
    });
  }
};
