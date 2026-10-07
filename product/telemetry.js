const allowed=new Set(['landing_view','full_journey_start','quick_start','demo_start','module_complete','digital_twin_enter','first_decision','simulation_complete','compare_scenario','report_view','report_export','feedback_submit']);
const counts=new Map();
/** Aggregate counts in memory only. Never include venture text, user identity or finances. */
export function track(name){if(!allowed.has(name))return;counts.set(name,(counts.get(name)||0)+1);globalThis.dispatchEvent(new CustomEvent('asnm:telemetry',{detail:{name,count:counts.get(name)}}));}
export const eventCounts=()=>Object.fromEntries(counts);
