import {el,money,fmt} from './dom.js';
import {standaloneDefaults,fromStandalone} from '../state/StandaloneAdapter.js';

/** Entry presentation only; both inputs ultimately create the same ASNMState. */
export function createEntry({host,lang,onStandalone,onModule3,onEnter,onReview,onResume,hasSession,readSource}) {
  const t=(ko,en)=>lang==='ko'?ko:en;
  const heading=text=>el('h1',{tabindex:'-1',text});
  function display(...nodes) {host.hidden=false;host.replaceChildren(...nodes.filter(node=>node!=null));host.querySelector('h1')?.focus();}
  const back=()=>el('button',{type:'button',text:t('진입 화면으로','Back to entry'),onclick:hub});
  function hub() {
    let source=null;try{source=readSource();}catch{/* Source is optional. */}
    display(el('div',{class:'eyebrow',text:'VENTURE DIGITAL TWIN · MODULE 04'}),heading(t('다음 결정을, 나의 Venture World에서.','Your next decision starts here.')),
      el('p',{class:'entry-lead',text:t('사람과 공간을 오가며 스타트업의 다음 한 달을 실험하세요.','Meet your team, explore the campus and experiment with your venture’s next month.')}),
      el('div',{class:'entry-options'},
        el('article',{class:'entry-card'},el('span',{class:'entry-number',text:'01'}),el('h2',{text:t('Module 3에서 이어서','Continue from Module 3')}),el('p',{text:source?t(`${source.venture.ventureName}의 결과를 이어받습니다.`,`Continue with ${source.venture.ventureName}.`):t('먼저 Venture Simulator를 완료해주세요.','Complete the Venture Simulator first.')}),el('button',{id:'entry-module3',class:'primary',disabled:!source,text:t('Module 3에서 이어서','Continue from Module 3'),onclick:onModule3})),
        el('article',{class:'entry-card'},el('span',{class:'entry-number',text:'02'}),el('h2',{text:t('새로운 Venture World','A new Venture World')}),el('p',{text:t('이름, 팀, 시장, 기대를 직접 설정합니다. Module 3 없이 시작할 수 있습니다.','Define your venture, team, market and expectations. No Module 3 result is needed.')}),el('button',{id:'entry-standalone',class:'primary',text:t('새 Venture World 만들기','Create New Venture World'),onclick:onStandalone}))),
      hasSession()?el('button',{id:'entry-resume',text:t('기존 Venture World 이어가기','Resume existing Venture World'),onclick:onResume}):null);
  }
  function wizard() {
    const draft=standaloneDefaults();let step=0;
    const titles=[t('나의 벤처','Your venture'),t('팀과 제품','Your team & product'),t('나의 시장','Your market'),t('창업자의 기대','Your expectations')];
    const n=(name,ko,en,min,max,optional=false)=>({name,label:t(ko,en),type:'number',min,max,optional});
    const groups=[
      [{name:'ventureName',label:t('벤처 이름','Venture name')},{name:'industry',label:t('산업 / 분야','Industry / sector')},{name:'stage',label:t('단계','Stage'),options:[['Idea',t('아이디어','Idea')],['MVP','MVP'],['Early revenue',t('초기 매출','Early revenue')],['Growth',t('성장','Growth')]]},{name:'currency',label:t('통화','Currency'),options:[['USD','USD'],['KRW','KRW']]},n('capital','초기 자본','Starting capital',0,1e15)],
      [n('teamSize','팀 규모 (창업자 포함)','Team size (including founder)',1,100),n('monthlyBurn','월 총비용','Monthly burn',0,1e13),n('mrr','현재 월 반복매출 (MRR)','Current MRR',0,1e13),n('productProgress','제품 완성도 (0–100)','Product progress (0–100)',0,100),n('teamCapacity','팀 실행역량 (0–100)','Team capacity (0–100)',0,100)],
      [n('demand','시장 수요 (0–100)','Market demand (0–100)',0,100),n('marketGrowth','연 시장성장률 (%)','Annual market growth (%)',-100,100),n('competition','경쟁강도 (0–100)','Competition (0–100)',0,100),n('uncertainty','시장 불확실성 (0–100)','Market uncertainty (0–100)',0,100),n('cac','고객획득비 (CAC)','CAC',1,1e10),n('retention','월 고객유지율 (%)','Monthly retention (%)',0,100)],
      [n('expectedSurvival','예상 생존 가능성 (%) · 선택','Expected survival (%) · optional',0,100,true),n('expectedGrowth','예상 연 시장성장률 (%) · 선택','Expected annual market growth (%) · optional',-100,100,true),n('expectedDemand','예상 수요 (0–100) · 선택','Expected demand (0–100) · optional',0,100,true),n('seed','시뮬레이션 Seed','Simulation seed',0,4294967295)]
    ];
    function draw() {
      const form=el('form',{id:'standalone-form'}),grid=el('div',{class:'wizard-grid'}),error=el('p',{class:'error',role:'alert'});
      for(const field of groups[step]) {
        const input=field.options?el('select',{name:field.name},...field.options.map(([value,text])=>el('option',{value,text}))):el('input',{name:field.name,type:field.type||'text',required:!field.optional,min:field.min,max:field.max,maxlength:120,step:['seed','teamSize'].includes(field.name)?1:'any'});
        input.value=draft[field.name];
        input.addEventListener('input',()=>{draft[field.name]=input.value;});
        grid.append(el('label',{},field.label,input));
      }
      form.append(grid,error,el('div',{class:'entry-actions'},el('button',{type:'button',text:t('이전','Back'),onclick:()=>{if(step){step--;draw();}else hub();}}),el('button',{class:'primary',type:'submit',id:step===3?'create-venture':'wizard-next',text:step===3?t('나의 Venture World 만들기','Create My Venture World'):t('다음 단계 →','Next step →')})));
      form.addEventListener('submit',event=>{event.preventDefault();if(step<3){step++;draw();return;}try{onEnter(fromStandalone(draft),false);}catch(e){error.textContent=e.message;}});
      display(el('div',{class:'eyebrow',text:`SETUP · ${step+1} / 4`}),heading(titles[step]),el('div',{class:'wizard-progress'},...titles.map((title,i)=>el('span',{class:i===step?'active':'',text:`${i+1} ${title}`}))),el('p',{class:'notice',text:t(`금액 단위: ${draft.currency}. 기본 숫자는 수정 가능한 연구용 가정입니다. 통화를 바꿔도 입력 금액은 환산되지 않으므로 직접 검토하세요. 기대값은 선택 사항이며 모델의 시장 가정과 별개입니다.`,`Amounts: ${draft.currency}. Prefilled numbers are editable research assumptions. Changing currency does not convert amounts: review them explicitly. Optional expectations are separate from model market assumptions.`)}),form);
    }
    draw();
  }
  function welcome(state) {
    const m3=state.provenance?.source==='module3',raw=state.provenance?.module3;
    const missing=t('입력되지 않음','Not provided');
    const value=(v,suffix='')=>v===undefined||v===null||v===''?missing:`${v}${suffix}`;
    const list=v=>Array.isArray(v)&&v.length?v.join(' · '):missing;
    const rows=[
      [t('현재 자본','Starting capital'),money(state.venture.cash,state.currency,lang)],
      [t('창업자의 생존 기대','Founder’s survival expectation'),value(state.assumptions.expectedSurvival,'%')],
      [t('예상 연 시장성장률','Expected annual market growth'),value(state.assumptions.expectedGrowth,'% / year')],
      [t('첫 매출 예상','Expected first revenue'),value(raw?.barl?.months,t('개월',' months'))],
      [t('팀 계획','Team plan'),m3?list(raw?.company?.talent):`${state.venture.teamSize}${t('명',' people')}`],
      [t('기술','Technology'),list(raw?.company?.tech)]
    ];
    display(el('div',{class:'eyebrow',text:m3?'MODULE 03 → VENTURE WORLD':'YOUR NEW VENTURE WORLD'}),heading(t(`${state.venture.ventureName}의 Venture World가 준비되었습니다.`,`${state.venture.ventureName}: your Venture World is ready.`)),
      el('p',{class:'entry-lead',text:m3?t('Module 3에서 입력한 내용으로 초기 상태를 구성했습니다.','Your Module 3 inputs have been carried into the initial state.'):t('직접 설정한 가정으로 새로운 시나리오를 시작합니다.','Start a new scenario using the assumptions you defined.')}),
      el('dl',{class:'welcome-grid'},...rows.map(([label,text])=>el('div',{},el('dt',{text:label}),el('dd',{text})))),
      el('details',{class:'source-notes'},el('summary',{text:t('운영·시장 가정 확인','Review operating & market assumptions')}),el('p',{text:`${t('월 총비용','Monthly burn')}: ${money(state.venture.monthlyBurn,state.currency,lang)} · MRR: ${money(state.venture.mrr,state.currency,lang)} · ${t('시장 수요','Demand')}: ${fmt(state.market.demand)} · ${t('연 시장성장률','Annual market growth')}: ${fmt(state.market.marketGrowth)}%`}),el('ul',{},...(state.provenance?.notes||[]).map(text=>el('li',{text})))),
      el('p',{class:'notice',text:t('생존 기대는 창업자의 입력값이며 실제 생존확률 예측이 아닙니다. 미입력 운영·시장 값은 모델의 가정으로 채워집니다. 입장하면 초기 상태가 확정됩니다.','Survival expectation is your belief, not a forecast of real survival. Uncollected operating and market values use model assumptions. Entering commits the initial state.')}),
      el('div',{class:'entry-actions'},back(),el('button',{id:'review-assumptions',text:t('가정 수정','Edit assumptions'),onclick:()=>onReview(state)}),el('button',{id:'enter-world',class:'primary',text:t('Venture World 입장하기','Enter Venture World'),onclick:()=>onEnter(state,true)})));
  }
  return {hub,wizard,welcome,hide(){host.hidden=true;}};
}
