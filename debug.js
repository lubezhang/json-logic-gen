var generator = require("./index");

var srcRules = `[
    {"leftChar":"(","fieldName":"ip","operation":"==","fieldValue":"1.1.1.1","rightChar":"","rowOperation":"and"},
    {"leftChar":"","fieldName":"ssid","operation":"==","fieldValue":"werwr","rightChar":"","rowOperation":"and"}
]`;
var jsonLogic = `{"and":[{"==":[{"var":"ip"},"1.1.1.1"]},{"==":[{"var":"ssid"},"werwr"]}]}`;

var jsonLogicRules = generator.generatorRules(srcRules);