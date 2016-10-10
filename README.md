# json-logic-gen
生成[json logic](http://jsonlogic.com/)格式的规则字符串。 

# 格式转换
原格式：
~~~
[
    {"leftChar":"","fieldName":"ip","operation":"==","fieldValue":"1.1.1.1","rightChar":"","rowOperation":"and"},
    {"leftChar":"(","fieldName":"ssid","operation":">","fieldValue":"werwr","rightChar":"","rowOperation":"or"},
    {"leftChar":"","fieldName":"ssid","operation":">","fieldValue":"werwr","rightChar":")","rowOperation":"and"}
]
~~~

json logic格式
~~~
{
    "and":[
        {
            "==":[
                {"var":"ip"},"1.1.1.1"]},
                {"or":[{">":[{"var":"ssid"},"werwr"]},
                {">":[{"var":"ssid"},"werwr"]}
            ]
        }
    ]
}
~~~