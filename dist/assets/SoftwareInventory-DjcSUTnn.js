import{u as T,r as n,j as e,B as h,a as U,I as j,d}from"./index-Bn9TfphC.js";import{D as z,d as L,U as E,P as F,a as V,p as O}from"./csvUtils-I1Y7GVyQ.js";import{S as G,F as M,T as P,X as q,C as H}from"./x-r86qIjwK.js";const J={Approved:"success",Blacklisted:"danger","Under Review":"warning"},K=()=>{const{isAdmin:c}=T(),[S,N]=n.useState([]),[u,l]=n.useState(!0),[m,C]=n.useState(""),[x,k]=n.useState("All"),[A,g]=n.useState(!1),[o,v]=n.useState(null),[s,t]=n.useState({name:"",vendor:"",version:"",scope:"Global",status:"Under Review",justification:"",ticket:""}),y=["name","vendor","version","scope","status","justification","ticket"],p=async()=>{l(!0);try{const a=await d.getTable("software");N(a)}catch(a){console.error("Error loading data:",a)}l(!1)};n.useEffect(()=>{p()},[]);const w=(a=null)=>{a?(v(a),t(a)):(v(null),t({name:"",vendor:"",version:"",scope:"Global",status:"Under Review",justification:"",ticket:""})),g(!0)},f=()=>{g(!1),v(null)},D=async a=>{a.preventDefault(),l(!0);const i={...s,addedBy:o?o.addedBy:"currentUser",dateAdded:o?o.dateAdded:new Date().toISOString().split("T")[0]};try{o?await d.updateRow("software",o.id,i):await d.addRow("software",i),await p(),f()}catch(r){console.error("Save error:",r)}l(!1)},R=async a=>{window.confirm("Are you sure you want to delete this specific entry?")&&(l(!0),await d.deleteRow("software",a),await p())},b=S.filter(a=>{const i=a.name.toLowerCase().includes(m.toLowerCase())||a.vendor.toLowerCase().includes(m.toLowerCase()),r=x==="All"||a.status===x;return i&&r}),B=async a=>{const i=a.target.files[0];if(i){l(!0);try{const r=await O(i,y);for(const I of r)await d.addRow("software",{...I,addedBy:(currentUser==null?void 0:currentUser.name)||"currentUser",dateAdded:new Date().toISOString().split("T")[0]});alert(`Successfully imported ${r.length} records.`),await p()}catch(r){alert("CSV Import Error: "+r.message)}l(!1),a.target.value=null}};return e.jsxs("div",{className:"module-container animate-fade-in",children:[e.jsxs("div",{className:"module-header flex-between",children:[e.jsxs("div",{children:[e.jsx("h1",{style:{fontSize:"1.875rem",marginBottom:"0.25rem"},children:"Software Inventory"}),e.jsx("p",{style:{color:"var(--text-secondary)"},children:"Track and manage approved and restricted software assets."})]}),c&&e.jsxs("div",{style:{display:"flex",gap:"0.5rem"},children:[e.jsx(h,{variant:"secondary",icon:z,onClick:()=>L(y,"software"),children:"Template"}),e.jsxs("label",{className:"btn btn-secondary",style:{cursor:"pointer"},children:[e.jsx(E,{size:16,style:{marginRight:"0.5rem"}})," Import CSV",e.jsx("input",{type:"file",accept:".csv",style:{display:"none"},onChange:B})]}),e.jsx(h,{icon:F,onClick:()=>w(),children:"Add Software"})]})]}),e.jsxs("div",{className:"controls-bar glass-card",children:[e.jsxs("div",{className:"search-group",children:[e.jsx(G,{size:18,className:"search-icon"}),e.jsx("input",{type:"text",placeholder:"Search software or vendor...",className:"input-base search-input",value:m,onChange:a=>C(a.target.value)})]}),e.jsxs("div",{className:"filter-group",children:[e.jsx(M,{size:18,className:"filter-icon"}),e.jsxs("select",{className:"input-base filter-select",value:x,onChange:a=>k(a.target.value),children:[e.jsx("option",{value:"All",children:"All Statuses"}),e.jsx("option",{value:"Approved",children:"Approved"}),e.jsx("option",{value:"Blacklisted",children:"Blacklisted"}),e.jsx("option",{value:"Under Review",children:"Under Review"})]})]})]}),e.jsxs("div",{className:"table-container glass-panel",children:[u&&e.jsx("div",{className:"loading-state",children:"Loading inventory data..."}),!u&&e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Software & Vendor"}),e.jsx("th",{children:"Version"}),e.jsx("th",{children:"Scope"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Ticket "}),e.jsx("th",{children:"Date Added"}),c&&e.jsx("th",{style:{textAlign:"right"},children:"Actions"})]})}),e.jsx("tbody",{children:b.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:c?7:6,className:"empty-state",children:"No software records found."})}):b.map(a=>e.jsxs("tr",{children:[e.jsxs("td",{children:[e.jsx("div",{style:{fontWeight:600,color:"var(--text-primary)"},children:a.name}),e.jsx("div",{style:{fontSize:"0.75rem",color:"var(--text-tertiary)"},children:a.vendor})]}),e.jsx("td",{children:a.version}),e.jsx("td",{children:a.scope}),e.jsx("td",{children:e.jsx(U,{variant:J[a.status]||"neutral",children:a.status})}),e.jsx("td",{children:a.ticket?e.jsx("span",{style:{fontFamily:"monospace",fontSize:"0.75rem",background:"rgba(255,255,255,0.1)",padding:"0.1rem 0.4rem",borderRadius:"4px"},children:a.ticket}):"-"}),e.jsx("td",{style:{color:"var(--text-secondary)",fontSize:"0.8rem"},children:a.dateAdded}),c&&e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("div",{className:"action-buttons",children:[e.jsx(j,{icon:V,onClick:()=>w(a)}),e.jsx(j,{icon:P,onClick:()=>R(a.id),className:"danger-icon"})]})})]},a.id))})]})]}),A&&e.jsx("div",{className:"modal-overlay",children:e.jsxs("div",{className:"modal-content",children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h2",{children:o?"Edit Software":"Add Software"}),e.jsx(j,{icon:q,onClick:f})]}),e.jsxs("form",{onSubmit:D,className:"form-grid",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Software Name*"}),e.jsx("input",{required:!0,className:"input-base",value:s.name,onChange:a=>t({...s,name:a.target.value})})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Vendor*"}),e.jsx("input",{required:!0,className:"input-base",value:s.vendor,onChange:a=>t({...s,vendor:a.target.value})})]}),e.jsxs("div",{className:"form-row",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Version"}),e.jsx("input",{className:"input-base",value:s.version,onChange:a=>t({...s,version:a.target.value})})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Scope"}),e.jsxs("select",{className:"input-base",value:s.scope,onChange:a=>t({...s,scope:a.target.value}),children:[e.jsx("option",{value:"Global",children:"Global"}),e.jsx("option",{value:"Department",children:"Department"}),e.jsx("option",{value:"Local",children:"Local"})]})]})]}),e.jsxs("div",{className:"form-row",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Status"}),e.jsxs("select",{className:"input-base",value:s.status,onChange:a=>t({...s,status:a.target.value}),children:[e.jsx("option",{value:"Approved",children:"Approved"}),e.jsx("option",{value:"Under Review",children:"Under Review"}),e.jsx("option",{value:"Blacklisted",children:"Blacklisted"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Ticket Reference"}),e.jsx("input",{className:"input-base",placeholder:"e.g. SEC-1234",value:s.ticket,onChange:a=>t({...s,ticket:a.target.value})})]})]}),e.jsxs("div",{className:"form-group",style:{gridColumn:"1 / -1"},children:[e.jsx("label",{children:"Justification / Notes"}),e.jsx("textarea",{className:"input-base",rows:3,value:s.justification,onChange:a=>t({...s,justification:a.target.value}),placeholder:"Provide context for this software approval or restriction..."})]}),e.jsxs("div",{className:"modal-actions",children:[e.jsx(h,{variant:"secondary",type:"button",onClick:f,children:"Cancel"}),e.jsx(h,{variant:"primary",type:"submit",icon:H,disabled:u,children:u?"Saving...":"Save Software"})]})]})]})}),e.jsx("style",{jsx:"true",children:`
        .module-header {
          margin-bottom: 2rem;
        }

        .controls-bar {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          align-items: center;
        }

        .search-group, .filter-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-group {
          flex: 1;
        }

        .search-icon, .filter-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .search-input, .filter-select {
          padding-left: 2.5rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .danger-icon:hover {
          color: var(--danger-color);
          background-color: var(--danger-bg);
        }

        .loading-state, .empty-state {
          padding: 3rem;
          text-align: center;
          color: var(--text-secondary);
        }

        /* Form Layout */
        .form-grid {
          display: grid;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        textarea.input-base {
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
      `})]})};export{K as default};
