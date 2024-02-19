# threejsShader
threejs 官方着色器 部分汇总

yarn

yarn dev


https://thebookofshaders.com/?lan=ch



https://www.shadertoy.com/

Step 阈值函数 step(edge,x)  如果 x 小于等于 edge，则结果为 0。如果 x 大于 edge，则结果为 1  返回 [0,1]


smoothstep() 函数是一个常用的插值函数 smoothstep(edge0,edge1,x)  x<edge0 结果0 x>edge1结果1 介于之间 结果三项多项式运算

log 以基数2.71828 的对数   exp(x)以基数2.71828 的平方 互为逆函数

sin cos [-1,1]  x 坐标（cos）和 y 坐标（sin）      给 sin(x)（注意不是 sin 里的 x）加 1.0。观察曲线是如何向上移动的，值域 [0.0 ,2.0]   计算 sin(x) 的绝对值（abs()）。现在它看起来就像一个弹力球的轨迹。

取 sin(x) 的小数部分（fract()）

ceil(3.14) 的结果是 4。

ceil(-3.14) 的结果是 -3

floor(3.14) 的结果是 3。

floor(-3.14) 的结果是 -4。

y = mod(x,0.5);  返回 x 对 0.5 取模的值            y = fract(x); 仅仅返回数的小数部分    y = ceil(x); 向正无穷取整

y = floor(x); 向负无穷取整                         y = sign(x);  提取 x 的正负号         y = abs(x); 返回 x 的绝对值

y = clamp(x,0.0,1.0); 把 x 的值限制在 0.0 到 1.0    y = min(0.0,x) 返回 x 和 0.0 中的较小值

y = max(0.0,x); 返回 x 和 0.0 中的较大值  

.x, .y, .z也可以被写作.r, .g, .b 和 .s, .t, .p 
vec4 vector;   vector[0] = vector.r = vector.x = vector.s;   

vector[1] = vector.g = vector.y = vector.t;   

vector[2] = vector.b = vector.z = vector.p;   

vector[3] = vector.a = vector.w = vector.q;
![image](https://github.com/msfm2018/threejsShader/assets/43517405/b8596cf9-f207-43a5-ade4-1780e636f190)

mix线性插值 mix(x, y, a) 如果 a 为 0，则结果为 x  如果 a 为 1，则结果为 y。 如果 a 在 0 到 1 之间，则结果将在 x 和 y 之间进行线性插值，权重为 a
![image](https://github.com/msfm2018/threejsShader/assets/43517405/5b3f1704-585c-495b-a011-af7489d6f7e9)
在Three.js中，内积（也称为点积）通常是使用dot()方法来计算的![image](https://github.com/msfm2018/threejsShader/assets/43517405/e9489d0c-fcfc-4697-afd0-2850dc3668c0)
![image](https://github.com/msfm2018/threejsShader/assets/43517405/9db7feff-9f11-4ee9-98ed-975dea8bfed9)![image](https://github.com/msfm2018/threejsShader/assets/43517405/45e67a37-87aa-4f86-9032-6f7d64716e38)

