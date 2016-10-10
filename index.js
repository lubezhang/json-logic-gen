;(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.jsonLogicGen = factory();
  }

}(this, function () {
    'use strict';
    
    var jsonLogicGen = {};

    jsonLogicGen.ruleUnit = function(ruleData) {
        var data = {}
        data[ruleData.operation] = [
            {"var": ruleData.fieldName},
            ruleData.fieldValue
        ]
        return data;
    }

    /**
     * 获取规则序列中是OR关键字的索引
     * 
     * @return {Array} [description]
     */
    jsonLogicGen.getOrIndex = function(arrayItem) {
        if(!arrayItem) {
            return false;
        }

        var orIndexPosition = [];
        for (var i = 0, len = arrayItem.length; i < len; i++) {
            if(arrayItem[i] === "or") {
                orIndexPosition.push(i);
            }
        }

        return orIndexPosition;
    }

    /**
     * 提出规则序列中，可以正确匹配的括号索引，并放入对列中
     * 
     * @param  {[type]} ruleList [description]
     * @return {[type]}          [description]
     */
    jsonLogicGen.getBracketsIndex = function(ruleList) {
        if(!ruleList) {
            return false;
        }

        var leftBracketsStack = [];
        var bracketsList = [];
        for (var i = 0, len = ruleList.length; i < len; i++) {
            if("(" === ruleList[i]) {
                leftBracketsStack.push(i);
            }
            if(")" === ruleList[i]) {
                if(leftBracketsStack.length === 0) {
                    throw new Error("括号不匹配"); 
                }
                bracketsList.push({
                    left: leftBracketsStack.pop(),
                    right: i
                })
            }
        }
        if(leftBracketsStack.length !== 0) {
            throw new Error("括号不匹配"); 
        }
        return bracketsList;
    }

    /**
     * 规则序列中是否存在括号
     * 
     * @return {Boolean} [description]
     */
    jsonLogicGen.isExistBrackets = function(arrayItem) {
        if(!arrayItem) {
            return false;
        }

        return arrayItem.some(function(item, index) {
            return item === "(";
        })
    }

    /**
     * 将数组序列转成规则对象
     * 
     * @param  {Array} arrayRule   规则序列
     * @param  {Boolean} operation 逻辑运算符。默认：and
     * @return {JSON}  返回一个jsonlogic对象
     */
    jsonLogicGen.generatorSingleRuleItem = function(arrayRule, operation) {
        if(!arrayRule) {
            return false;
        }
        operation = operation || "and";

        var rule = {}, ruleList = [];
        if(arrayRule.length === 1) {
            if( "fieldName" in arrayRule[0]) {
                rule = this.ruleUnit(arrayRule[0])
            } else {
                rule = arrayRule[0];
            }
        } else {
            var that = this;
            arrayRule.forEach(function(item, index) {
                if (typeof item === "object") {
                    if( "fieldName" in item) {
                        ruleList.push(that.ruleUnit(item));
                    } else {
                        ruleList.push(item);
                    }
                }
            });
            rule[operation] = ruleList;
        }
        return rule;
    }

    jsonLogicGen.generatorRuleItem = function(ruleItemList) {
        if(!ruleItemList) {
            return false;
        }
        var rules = {};
        var orList = this.getOrIndex(ruleItemList);
        var operation = orList.length === 0 ? "and" : "or";
        // 全部选择and，或者全部选择or
        if (orList.length === 0 || (ruleItemList.length / orList.length < 2.2)) {
            rules = this.generatorSingleRuleItem(ruleItemList, operation);
        } else {
            // 部分选择or
            var ruleList = [];
            for (var i = 0, len = orList.length; i < len; i++) {
                if(i === 0) {
                    ruleList.push(this.generatorSingleRuleItem(ruleItemList.slice(0, orList[i])));
                }
                var nextIndex = i === len ? ruleItemList.length : orList[i+1];
                ruleList.push(this.generatorSingleRuleItem(ruleItemList.slice(orList[i]+1, nextIndex)));
            }
            rules[operation] = ruleList;
        }

        return rules;
    }

    /**
     * 按照优先级处理规则序列中，所有包含在括号内的规则
     * 
     * @param  {[type]} ruleList [description]
     * @return {[type]}          [description]
     */
    jsonLogicGen.generatorRuleInBracket = function(allRuleList) {
        var bracketsList = this.getBracketsIndex(allRuleList);
        var ruleList = [];

        if(bracketsList.length !== 0) {
            var bracketsIndex = bracketsList[0];
            var tmp = this.generatorRuleItem(allRuleList.slice(bracketsIndex.left + 1, bracketsIndex.right));
            allRuleList[bracketsIndex.left] = tmp;
            allRuleList.splice(bracketsIndex.left + 1, (bracketsIndex.right - bracketsIndex.left));
            this.generatorRuleInBracket(allRuleList)
        }
    }

    /**
     * 将字符串格式的json，转成方面后续处理的数据结构
     * 
     * @param {any} srcRules
     * @returns
     */
    jsonLogicGen.transformRule = function(srcRules) {
        if(typeof srcRules === "string") {
            srcRules = JSON.parse(srcRules);
        }

        var ruleResouseList = [];
        for (var i = 0, len = srcRules.length; i < len; i++) {
            var ruleData = srcRules[i];
            // var ruleData = getRuleData($rule);

            ruleData.leftChar && ruleResouseList.push(ruleData.leftChar);
            ruleResouseList.push({
                fieldName: ruleData.fieldName,
                operation: ruleData.operation,
                fieldValue: ruleData.fieldValue 
            });
            ruleData.rightChar && ruleResouseList.push(ruleData.rightChar);
            ruleData.rowOperation && ruleResouseList.push(ruleData.rowOperation);
        }
        ruleResouseList.length !== 0 && ruleResouseList.splice(ruleResouseList.length - 1, 1)
        return ruleResouseList;
    }

    jsonLogicGen.generatorRules = function(srcRules) {
        if(!srcRules) {
            return;
        }

        if(typeof srcRules === "string") {
            srcRules = this.transformRule(srcRules);
        }
        
        var jsonLogicRules = {};

        if(this.isExistBrackets(srcRules)) {
            this.generatorRuleInBracket(srcRules)
            jsonLogicRules = this.generatorRuleItem(srcRules);
        } else {
            jsonLogicRules = this.generatorRuleItem(srcRules);
        }
        return JSON.stringify(jsonLogicRules);
    }

    return jsonLogicGen;
}));