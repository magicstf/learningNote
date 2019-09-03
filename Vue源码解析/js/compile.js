// 用法 new Compile(el,vm)
class Compile {
  constructor(el, vm) {
    this.$el = document.querySelector(el);
    this.$vm = vm;
    // 编译
    if (this.$el) {
      // 转换内部的内容为片段Fragment
      this.$fragment = this.node2Fragment(this.$el);
      // 执行编译
      this.compile(this.$fragment);
      // 将编译完的html结果添加到$el中
      this.$el.appendChild(this.$fragment);
    }
  }
  // 将宿主元素中代码片段拿出来遍历，这样做比较高效
  node2Fragment(el) {
    const frag = document.createDocumentFragment();
    // 将el中所有子元素移动到frag中
    let child;
    while ((child = el.firstChild)) {
      frag.appendChild(child);
    }
    return frag;
  }
  // 编译过程
  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach(node => {
      // 类型判断
      if (this.isElement(node)) {
        // 元素
        // 查找s-，@，：开头的
        const nodeAttrs = node.attributes;
        Array.from(nodeAttrs).forEach(attr => {
          const attrName = attr.name;
          const exp = attr.value;

          if (this.isDirective(attrName)) {
            // k-text
            const dir = attrName.substring(2);
            // 执行指令
            this[dir] && this[dir](node, this.$vm, exp);
          }
          if (this.isEvent(attrName)) {
            // @click
            const dir = attrName.substring(1);
            this.eventHander(node, this.$vm, exp, dir);
          }
        });
      } else if (this.isInterpolation(node)) {
        // 插值文本
        this.compileText(node);
      }
      // 递归子节点
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }
  // {{ }}
  compileText(node) {
    this.update(node, this.$vm, this.trim(RegExp.$1), "text");
  }
  // 通用更新函数
  update(node, vm, exp, dir) {
    const updaterFn = this[dir + "Updater"];
    // 初始化
    updaterFn && updaterFn(node, vm[exp]);
    // 依赖收集
    new Watcher(vm, exp, function(value) {
      updaterFn && updaterFn(node, value);
    });
  }

  // v-text
  text(node, vm, exp) {
    this.update(node, vm, exp, "text");
  }

  textUpdater(node, value) {
    node.textContent = value;
  }
  // 事件处理器
  eventHander(node, vm, exp, dir) {
    let fn = vm.$options.methods && vm.$options.methods[exp];
    if (dir && fn) {
      node.addEventListener(dir, fn.bind(vm));
    }
  }
  // 双向绑定
  model(node, vm, exp) {
    // 设置input的value属性 模型到视图的绑定 M->V
    this.update(node, vm, exp, "model");
    // 视图到模型的绑定 V->M
    node.addEventListener("input", e => {
      vm[exp] = e.target.value;
    });
  }
  modelUpdater(node, value) {
    node.value = value;
  }

  // html
  html(node, vm, exp) {
    this.update(node, vm, exp, "html");
  }

  htmlUpdater(node, value) {
    node.innerHTML = value;
  }
  // 判断是否是指令
  isDirective(attr) {
    return attr.indexOf("s-") == 0;
  }
  // 判断是否是事件
  isEvent(attr) {
    return attr.indexOf("@") == 0;
  }
  // 判断节点是元素
  isElement(node) {
    return node.nodeType === 1;
  }
  // 判断是插值文本
  isInterpolation(node) {
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
  }
  // 去除字符串首尾空格
  trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  }
}
