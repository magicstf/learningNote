function Watcher(vm, exp, cb) {
  this.vm = vm // vm 代表一个Vue实例
  this.exp = exp // exp 代表node节点上指令对应的值
  this.cb = cb // watcher绑定的更新函数
  this.value = this.get() // 将自己添加到订阅器
}

Watcher.prototype = {
  update: function() {
    this.run()
  },
  run: function() {
    var value = this.vm.data[this.exp]
    var oldVal = this.value
    if(value !== oldVal) {
      this.value = value
      this.cb.call(this.vm, value, oldVal)
    }
  },
  get: function() {
    Dep.target = this
    var value = this.vm.data[this.exp]
    Dep.target = null;
    return value
  }
}