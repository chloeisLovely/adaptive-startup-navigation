import test from 'node:test';import assert from 'node:assert/strict';import {routeQuestion} from '../question-router.js';
test('free-text routes market, founder, business assumptions and decision experiments in both languages',()=>{
 for(const [question,id] of [['어떤 고객부터 만나야 할까요?','m1'],['내가 이 사업에 맞는 창업자인가요?','m2'],['사업 모델의 가정과 리스크를 점검하고 싶어요','m3a'],['가격을 올릴까요?','m4'],['개발자를 채용하면 자금이 얼마나 버틸까요?','m4'],['나는 어떤 의사결정 스타일인가요?','m2'],['Which customers should I interview?','m1'],['What are my founder strengths?','m2'],['Test my business model assumptions','m3a'],['Should I hire a developer?','m4'],['What is my decision style?','m2']])assert.equal(routeQuestion(question),id,question);
 for(const question of ['', '   ','안녕하세요','Help me','고객과 창업자의 성향을 모두 알고 싶어요'])assert.equal(routeQuestion(question),null,question);
});
