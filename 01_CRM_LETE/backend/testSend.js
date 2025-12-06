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
const whatsappService_1 = require("./src/services/whatsappService");
// Reemplaza esto con TU número real (con código de país, ej: 52133...)
// OJO: Debe ser el número al que le quieres enviar el mensaje, NO el del bot.
const MY_NUMBER = '5213310043159';
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Probando envío...');
    yield (0, whatsappService_1.sendText)(MY_NUMBER, '¡Hola! Soy el sistema Luz en tu Espacio. Ya puedo hablar. 🤖💡');
});
run();
