// ==UserScript==
// @name        script1
// @namespace   com.dobydigital.userscripts
// @version     1.0.0
// @author      Trim21 <trim21me@gmail.com>
// @source      https://github.com/Trim21/webpack-userscript-template
// @match       http://www.example.com/*
// @grant       GM.xmlHttpRequest
// @connect     httpbin.org
// @run-at      document-end
// ==/UserScript==


/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

// UNUSED EXPORTS: Script1

;// CONCATENATED MODULE: ./src/script1/service/UserService.ts
class UserService {
    doStuff() {
        console.log('dostuff');
    }
}

;// CONCATENATED MODULE: ./src/script1/index.ts
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

class Script1 {
    main() {
        return __awaiter(this, void 0, void 0, function* () {
            new UserService().doStuff();
            console.log('Hello from script 1');
        });
    }
}
new Script1().main().catch(e => {
    console.log(e);
});

/******/ })()
;