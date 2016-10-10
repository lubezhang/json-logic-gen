var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var generator = require("../index");

describe('检查 jsonLogic规则生成器是否正常', function () {

    before(function () {

    });

    after(function () {

    });

    it('检查 规则生成器的边界检查逻辑', function () {
        generator.should.to.not.undefined;

        // 原始规则数据为空
        var jsonLogicRules = generator.generatorRules();
        expect(jsonLogicRules).to.undefined;

        jsonLogicRules = generator.generatorRules(null);
        expect(jsonLogicRules).to.undefined;

        jsonLogicRules = generator.generatorRules(undefined);
        expect(jsonLogicRules).to.undefined;
    });

    it('基本运算符，只有一个规则条件，没有括号', function () {
        var srcRules = `[
            {"leftChar":"","fieldName":"ip","operation":"==","fieldValue":"1.1.1.1","rightChar":"","rowOperation":"and"}
        ]`;
        var jsonLogic = `{"==":[{"var":"ip"},"1.1.1.1"]}`;

        var jsonLogicRules = generator.generatorRules(srcRules);
        jsonLogicRules.should.to.be.equal(jsonLogic)
        
    });

    it('基本运算符，只有一个规则条件，有括号', function () {
        var srcRules = `[
            {"leftChar":"(","fieldName":"ip","operation":"==","fieldValue":"1.1.1.1","rightChar":")","rowOperation":"and"}
        ]`;
        var jsonLogic = `{"==":[{"var":"ip"},"1.1.1.1"]}`;

        var jsonLogicRules = generator.generatorRules(srcRules);
        jsonLogicRules.should.to.be.equal(jsonLogic)
        
    });

    it('基本运算符，有多个规则条件', function () {
        var srcRules = `[
            {"leftChar":"","fieldName":"ip","operation":"==","fieldValue":"1.1.1.1","rightChar":"","rowOperation":"and"},
            {"leftChar":"(","fieldName":"ssid","operation":">","fieldValue":"werwr","rightChar":"","rowOperation":"or"},
            {"leftChar":"","fieldName":"ssid","operation":">","fieldValue":"werwr","rightChar":")","rowOperation":"and"}
        ]`;
        var jsonLogic = `{"and":[{"==":[{"var":"ip"},"1.1.1.1"]},{"or":[{">":[{"var":"ssid"},"werwr"]},{">":[{"var":"ssid"},"werwr"]}]}]}`;

        var jsonLogicRules = generator.generatorRules(srcRules);
        jsonLogicRules.should.to.be.equal(jsonLogic)
    });
});