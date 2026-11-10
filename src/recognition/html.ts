import labels from './imagenet-labels.json';
import bundledModel from './model-bundle.json';
export type Prediction = { className: string; probability: number };
export type RecognitionEvent = { source: 'cat-atlas-engine'; jobId: string; type: 'progress' | 'result' | 'error'; message?: string; predictions?: Prediction[] };
export function recognitionHTML(image: string, jobId: string) {
  const payload = JSON.stringify({ image, jobId }).replace(/</g, '\\u003c');
  const modelPayload = JSON.stringify({modelTopology:bundledModel.modelTopology,weightSpecs:bundledModel.weightSpecs,weightDataBase64:bundledModel.weightDataBase64}).replace(/</g,'\\u003c');
  const localScript = bundledModel.tfScript.replace(/<\/script/gi,'<\\/script');
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"></head><body><img id="photo" width="224" height="224" alt="" style="object-fit:contain"><script>${localScript}</script><script>
    const payload=${payload};
    const labels=${JSON.stringify(labels)};
    const bundle=${modelPayload};
    let finished=false;
    function emit(type,rest){const value=JSON.stringify(Object.assign({source:'cat-atlas-engine',jobId:payload.jobId,type},rest||{}));if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(value);else window.parent.postMessage(value,'*');}
    function fail(message){if(!finished){finished=true;emit('error',{message});}}
    window.onerror=function(){fail('模型暂时无法运行，请重新打开识别页面后重试');};
    const timeout=setTimeout(()=>fail('识别时间较长，请更换照片或稍后重试'),45000);
    (async function(){try{
      emit('progress',{message:'正在准备本设备内的识别模型…'});
      try{if(!await tf.setBackend('webgl'))await tf.setBackend('cpu');await tf.ready();}catch(e){await tf.setBackend('cpu');await tf.ready();}
      const decoded=atob(bundle.weightDataBase64);const weights=new Uint8Array(decoded.length);for(let i=0;i<decoded.length;i++)weights[i]=decoded.charCodeAt(i);
      const model=await tf.loadLayersModel(tf.io.fromMemory({modelTopology:bundle.modelTopology,weightSpecs:bundle.weightSpecs,weightData:weights.buffer}));
      if(finished){model.dispose();return;}
      emit('progress',{message:'正在本设备内分析照片…'});
      const photo=document.getElementById('photo');await new Promise((resolve,reject)=>{photo.onload=resolve;photo.onerror=reject;photo.src=payload.image;});
      const input=tf.tidy(()=>tf.image.resizeBilinear(tf.browser.fromPixels(photo),[224,224]).toFloat().div(127.5).sub(1).expandDims(0));
      const output=model.predict(input);const scores=await output.data();
      const predictions=Array.from(scores,(probability,index)=>({className:labels[index],probability})).sort((a,b)=>b.probability-a.probability).slice(0,8);
      input.dispose();output.dispose();
      if(!finished){finished=true;clearTimeout(timeout);emit('result',{predictions});}model.dispose();
    }catch(e){console.error('CatAtlas model error:',e.message||String(e));clearTimeout(timeout);fail('暂时无法完成识别，请更换照片或重新打开页面后重试');}})();
  </script></body></html>`;
}
