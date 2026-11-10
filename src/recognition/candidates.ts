import {byId} from '../data/catalog';
import type {Prediction} from './html';
const labels:Record<string,{id:string;name?:string}>={
 'tabby, tabby cat':{id:'domestic-shorthair',name:'虎斑家猫外观'},
 'tiger cat':{id:'domestic-shorthair',name:'条纹家猫外观'},
 'Persian cat':{id:'persian'},'Siamese cat, Siamese':{id:'siamese'},'Egyptian cat':{id:'egyptian-mau',name:'埃及猫相近外观'},
};
export function catPredictions(predictions:Prediction[]){
 const lookup=(name:string)=>Object.entries(labels).find(([key])=>key.toLowerCase()===name.toLowerCase())?.[1];
 const candidates=predictions.filter(item=>!!lookup(item.className));
 if(!predictions.length||!lookup(predictions[0].className)||!candidates.length||candidates[0].probability<.18||candidates.reduce((sum,item)=>sum+item.probability,0)<.35)return [];
 const used=new Set<string>();
 return candidates.filter(item=>{const id=lookup(item.className)!.id;if(item.probability<.03||used.has(id))return false;used.add(id);return true;}).slice(0,3).map(item=>{const match=lookup(item.className)!;return {...item,breed:byId[match.id],name:match.name||byId[match.id].name};});
}
