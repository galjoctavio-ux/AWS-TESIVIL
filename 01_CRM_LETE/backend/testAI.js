"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const aiService_1 = require("./src/services/aiService");
const runTest = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Probando cerebro...');
    console.log('Hola ->', yield (0, aiService_1.analyzeIntent)('Hola, buenas tardes'));
    console.log('Falla ->', yield (0, aiService_1.analyzeIntent)('Tengo un corto en la cocina, huele a quemado'));
    console.log('Proyecto ->', yield (0, aiService_1.analyzeIntent)('Cuanto cobran por poner un ventilador de techo?'));
    console.log('Confuso ->', yield (0, aiService_1.analyzeIntent)('El perro ladra mucho'));
});
runTest();
