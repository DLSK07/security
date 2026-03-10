import{c as l}from"./index-DWhUufoB.js";/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=l("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=l("Pen",[["path",{d:"M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z",key:"5qss01"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=l("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.300.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const x=l("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]),C=(a,o)=>{const i=a.join(",")+`
`,n=new Blob([i],{type:"text/csv;charset=utf-8;"}),s=URL.createObjectURL(n),t=document.createElement("a");t.setAttribute("href",s),t.setAttribute("download",`${o}_template.csv`),document.body.appendChild(t),t.click(),document.body.removeChild(t)},E=(a,o)=>new Promise((i,n)=>{if(!a){n(new Error("No file provided"));return}const s=new FileReader;s.onload=t=>{try{const r=t.target.result.split(`
`).map(e=>e.trim()).filter(e=>e);if(r.length===0)throw new Error("File is empty.");const m=r[0].split(",").map(e=>e.trim());if(!o.every(e=>m.some(d=>d.toLowerCase()===e.toLowerCase())))throw new Error(`Invalid CSV format. Expected headers: ${o.join(", ")}`);const h=[];for(let e=1;e<r.length;e++){const d=r[e].split(",").map(c=>c.trim()),y={};o.forEach((c,v)=>{y[c]=d[v]||""}),h.push(y)}i(h)}catch(p){n(p)}},s.onerror=()=>{n(new Error("Failed to read the file"))},s.readAsText(a)});export{k as D,f as P,x as U,b as a,C as d,E as p};
