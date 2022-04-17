```
Created by baidm in 2021/7/17 on 16:40 
```
```text
1、setup 组件选项

在setup中应该避免使用 this ，因为它找不到组件实例。
setup的调用发生在 data、computed、methods 被解析之前，所以它们无法在 setup 中获取。
执行 setup 时，组件实例尚未被创建，只能访问：props、attrs、slots、emit，无法访问：data、computed、methods

setup 选项是一个接收 props 和 context 的函数，setup 返回的所有内容都会暴露给组件的其余部分（computed、methods、生命周期钩子等）。

setup 函数中的 props 是响应式的，当传入新的 prop 时，它将被更新。
因为 props 是响应式的，你不能使用 ES6 解构，它会消除 prop 的响应性。如果需要解构 prop，可以在 setup 函数中使用 toRefs 或 toRef 函数来完成此操作。

context 是一个普通的 JavaScript 对象，它不是响应式的，它暴露组件的三个 property：attrs, slots, emit
attrs 和 slots 是有状态的对象，它们总是会随组件本身的更新而更新。
attrs 和 slots 是非响应式的。如果你打算根据 attrs 或 slots 更改应用副作用，那么应该在 onUpdated 生命周期钩子中执行此操作。

如果 setup 返回一个对象，那么该对象的 property 以及传递给 setup 的 props 参数中的 property 就都可以在模板中访问到。
从 setup 返回的 refs 在模板中访问时是被自动浅解包的，因此不应在模板中使用 .value
setup 还可以返回一个渲染函数，该函数可以直接使用在同一作用域中声明的响应式状态

2、带 ref 的响应式变量

可以通过一个新的 ref 函数使任何响应式变量在任何地方起作用

ref 接收参数并将其包裹在一个带有 value property 的对象中返回，然后可以使用该 property 访问或更改响应式变量的值

即：ref 为我们的值创建了一个响应式引用

3、在 setup 内注册生命周期钩子

组合式 API 上的生命周期钩子与选项式 API 的名称相同，但前缀为 on：即 mounted 看起来会像 onMounted。

这些函数接受一个回调，当钩子被组件调用时，该回调将被执行。

4、watch 响应式更改

接受 3 个参数：
    ①、一个想要侦听的响应式引用或 getter 函数
    ②、一个回调
    ③、可选的配置选项

5、独立的 computed 属性

computed 函数第一个参数，它是一个类似 getter 的回调函数，输出的是一个只读的响应式引用

6、

```