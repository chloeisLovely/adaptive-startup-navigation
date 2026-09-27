/** Only derives visual flags from engine outputs. Never writes simulation state. */
export function worldPresentation(s,log){
 return {financeWarning:s.venture.runway!==null&&s.venture.runway<6,customerWarning:s.venture.retention<60,offer:!!s.operations.offer,product:s.venture.productProgress/100,teamShown:Math.min(6,Math.max(0,s.venture.teamSize-1)),teamActual:s.venture.teamSize,revenue:s.venture.mrr,revenueHistory:log?[log.stateBefore.venture.mrr,s.venture.mrr]:[s.venture.mrr],event:log?.event||null};
}
