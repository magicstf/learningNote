// Watcher
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm;
    this.key = key;
    this.cb = cb;
    // 将当前watcher实例指定到Dep静态属性target()
    Dep.target = this;
    this.vm[this.key]; // 触发get, 添加依赖
    Dep.target = null;
  }
  update() {
    console.log("属性更新了");
    this.cb.call(this.vm, this.vm[this.key]);
  }
}
