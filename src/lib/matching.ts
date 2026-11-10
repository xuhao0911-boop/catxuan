import type { Breed } from '../data/catalog';
export type MatchKey = 'size' | 'activity' | 'grooming' | 'shedding' | 'social';
export type MatchAnswers = Record<MatchKey, string>;
export const matchStorageKey = '@catxuan/match-v1';
export const matchQuestions: {key:MatchKey;title:string;hint:string;options:{id:string;label:string;hint:string}[]}[] = [
 {key:'size',title:'喜欢多大的猫咪？',hint:'体型是参考，个体和性别也会有差异。',options:[{id:'small',label:'小型',hint:'偏爱小巧的身形'},{id:'medium',label:'中型',hint:'体型适中'},{id:'large',label:'大型',hint:'能准备更宽敞的生活设施'},{id:'any',label:'都可以',hint:'体型不是首要条件'}]},
 {key:'activity',title:'你喜欢怎样的相处节奏？',hint:'猫咪也需要每日游戏和丰富的生活环境。',options:[{id:'calm',label:'安静相伴',hint:'更喜欢较安静的生活节奏'},{id:'playful',label:'每天一起玩',hint:'愿意安排规律的互动游戏'},{id:'active',label:'喜欢活跃的猫',hint:'能提供更多攀爬、探索与互动'}]},
 {key:'grooming',title:'愿意花多少精力打理？',hint:'长毛、卷毛和无毛都各有照护需求。',options:[{id:'easy',label:'尽量省事',hint:'偏好梳理需求较低的被毛'},{id:'regular',label:'定期打理',hint:'愿意规律梳毛与检查打结'},{id:'frequent',label:'细心打理也可以',hint:'能投入更多被毛或皮肤护理'}]},
 {key:'shedding',title:'能接受多少掉毛？',hint:'少毛、卷毛或无毛都不保证不会过敏。',options:[{id:'low',label:'希望少一些',hint:'更在意浮毛清理'},{id:'normal',label:'能接受',hint:'可以规律清洁'},{id:'any',label:'不太介意',hint:'愿意应对较多浮毛'}]},
 {key:'social',title:'你偏爱怎样的互动？',hint:'独立的猫咪也需要关心和每日陪伴。',options:[{id:'independent',label:'彼此保留空间',hint:'偏爱较独立、安静陪伴的描述'},{id:'companion',label:'喜欢黏人的猫',hint:'愿意回应较多互动和陪伴需求'},{id:'any',label:'都可以',hint:'愿意尊重不同的相处方式'}]},
];
export function validMatchAnswers(value:unknown):value is MatchAnswers {if(!value||typeof value!=='object')return false;return matchQuestions.every(question=>question.options.some(option=>option.id===(value as Record<string,unknown>)[question.key]));}
export function cleanMatchDraft(value:unknown):Partial<MatchAnswers> {if(!value||typeof value!=='object')return {};const cleaned:Partial<MatchAnswers>={};for(const question of matchQuestions){const answer=(value as Record<string,unknown>)[question.key];if(question.options.some(option=>option.id===answer))cleaned[question.key]=answer as string;}return cleaned;}
export type MatchResult={breedId:string;formId?:string;name:string;size:string;reasons:string[];considerations:string[]};
export function matchBreeds(answers:MatchAnswers,catalog:Breed[],limit=3):MatchResult[]{
 if(!validMatchAnswers(answers))return [];
 const desiredSize:Record<string,string>={small:'小型',medium:'中型',large:'大型',any:''};
 const activity:Record<string,number>={'较低':1,'适中':2,'较高':3},grooming:Record<string,number>={'较低':1,'常规':2,'较高':3},shedding:Record<string,number>={'较少':1,'正常':2,'较多':3};
 const activityCap:Record<string,number>={calm:1,playful:2,active:3},groomingCap:Record<string,number>={easy:1,regular:2,frequent:3},sheddingCap:Record<string,number>={low:1,normal:2,any:3};
 return catalog.flatMap(breed=>{
  if(!breed.matchEligible||!activity[breed.activity]||!grooming[breed.groomingLevel]||!shedding[breed.sheddingLevel])return [];
  if((desiredSize[answers.size]&&breed.size!==desiredSize[answers.size])||activity[breed.activity]>activityCap[answers.activity]||grooming[breed.groomingLevel]>groomingCap[answers.grooming]||shedding[breed.sheddingLevel]>sheddingCap[answers.shedding])return [];
  if(answers.social==='independent'&&!['较独立','随和'].includes(breed.social))return [];
  if(answers.social==='companion'&&!['亲人','需陪伴'].includes(breed.social))return [];
  const reasons=[...(answers.size!=='any'?['体型符合你的偏好']:[]),'活跃程度在你选择的范围内',...(answers.grooming!=='frequent'?['梳理需求符合你的安排']:[]),...(answers.shedding!=='any'?['掉毛描述符合你的选择']:[]),...(answers.social!=='any'?['相处方式与你的偏好接近']:[])];
  const considerations=[...(breed.activity==='较高'?['需要较多游戏和探索空间']:[]),...(breed.groomingLevel==='较高'?['被毛或皮肤护理需要更多时间']:[]),...(breed.social==='需陪伴'?['需要稳定的互动和陪伴']:[])];
  const result:MatchResult={breedId:breed.id,formId:breed.forms[0]?.id,name:breed.name,size:breed.size,reasons,considerations};
  const distance=(activityCap[answers.activity]-activity[breed.activity])+grooming[breed.groomingLevel]*.2+shedding[breed.sheddingLevel]*.2;
  return [{result,distance}];
 }).sort((a,b)=>a.distance-b.distance||a.result.breedId.localeCompare(b.result.breedId)).slice(0,Math.max(0,Math.min(10,limit))).map(item=>item.result);
}
