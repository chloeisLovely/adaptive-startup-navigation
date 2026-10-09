/** Local, explainable routing. No model call or financial state mutation. */
export function routeQuestion(value){
 const text=String(value).normalize('NFKC').trim().toLowerCase().slice(0,600);
 const rules=[
  ['m4',[/채용|런웨이|자금|현금|가격|투자|마케팅\s*(비|예산)|예산|디지털\s*트윈|다른\s*선택|이번\s*달|의사결정|무엇부터|결정.*(실험|시뮬)/,/\b(hir\w*|runway|cash|budget|pric\w*|fund\w*|invest\w*|decision|digital twin|what if)\b/]],
  ['m2',[/의사결정\s*스타일|창업자|성향|성격|편향|나의\s*(강점|스타일)|내가.*(맞|적합)|나에게.*맞|dna/,/\b(founder|personality|bias|strengths?|decision style)\b/]],
  ['m1',[/고객|시장|수요|트렌드|경쟁사|인터뷰|고충/,/\b(customer\w*|market|demand|trend\w*|competitor\w*|interview\w*|pain)\b/]],
  ['m3a',[/사업.*(검증|위험|리스크|가정|평가)|아이디어.*(평가|검증)|사업\s*모델|비즈니스|시뮬레이터/,/\b(validat\w*|risk\w*|assumption\w*|business model|simulator)\b/]]
 ];
 const matched=rules.filter(([,patterns])=>patterns.some(re=>re.test(text))).map(([id])=>id);
 // Explicit decision experiments and founder fit are more specific than a general market mention.
 if(matched.includes('m2')&&/의사결정\s*스타일|decision style/.test(text))return 'm2';
 if(matched.includes('m4'))return 'm4';
 return matched.length===1?matched[0]:null;
}
