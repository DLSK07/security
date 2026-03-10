import{u as z,r as o,j as e,B as m,a as E,I as y,d as c}from"./index-DWhUufoB.js";import{T as L,X as F,C as $,l as v}from"./activityLogger-D6KyeVU7.js";import{D as V,d as O,U as G,P as M,a as P,p as q}from"./csvUtils-Ca2nrqcx.js";import{S as H,F as J}from"./search-BGSjMrOk.js";const W={Approved:"success",Blacklisted:"danger","Under Review":"warning"},_=()=>{const{isAdmin:X,canEditInventory:u,user:l}=z(),[w,A]=o.useState([]),[p,i]=o.useState(!0),[x,k]=o.useState(""),[f,I]=o.useState("All"),[D,b]=o.useState(!1),[d,j]=o.useState(null),[s,n]=o.useState({name:"",vendor:"",version:"",scope:"Global",status:"Under Review",justification:"",ticket:""}),S=["name","vendor","version","scope","status","justification","ticket"],h=async()=>{i(!0);try{const a=await c.getTable("software");A(a)}catch(a){console.error("Error loading data:",a)}i(!1)};o.useEffect(()=>{h()},[]);const N=(a=null)=>{a?(j(a),n(a)):(j(null),n({name:"",vendor:"",version:"",scope:"Global",status:"Under Review",justification:"",ticket:""})),b(!0)},g=()=>{b(!1),j(null)},R=async a=>{a.preventDefault(),i(!0);const t={...s,addedBy:d?d.addedBy:"currentUser",dateAdded:d?d.dateAdded:new Date().toISOString().split("T")[0]};try{d?(await c.updateRow("software",d.id,t),await v(l,"Inventory","Update",`Updated software: ${t.name} ${t.version}`)):(await c.addRow("software",t),await v(l,"Inventory","Add",`Added software: ${t.name} ${t.version}`)),await h(),g()}catch(r){console.error("Save error:",r)}i(!1)},B=async a=>{if(window.confirm("Are you sure you want to delete this specific entry?")){i(!0);const t=w.find(r=>r.id===a);await c.deleteRow("software",a),await v(l,"Inventory","Delete",`Deleted software: ${(t==null?void 0:t.name)||a}`),await h()}},C=w.filter(a=>{const t=a.name.toLowerCase().includes(x.toLowerCase())||a.vendor.toLowerCase().includes(x.toLowerCase()),r=f==="All"||a.status===f;return t&&r}),U=async a=>{const t=a.target.files[0];if(t){i(!0);try{const r=await q(t,S);for(const T of r)await c.addRow("software",{...T,addedBy:(l==null?void 0:l.name)||"currentUser",dateAdded:new Date().toISOString().split("T")[0]});await v(l,"Inventory","Import",`Imported ${r.length} records into Software Inventory`),alert(`Successfully imported ${r.length} records.`),await h()}catch(r){alert("CSV Import Error: "+r.message)}i(!1),a.target.value=null}};return e.jsxs("div",{className:"module-container animate-fade-in",children:[e.jsxs("div",{className:"module-header flex-between",children:[e.jsxs("div",{children:[e.jsx("h1",{style:{fontSize:"1.875rem",marginBottom:"0.25rem"},children:"Software Inventory"}),e.jsx("p",{style:{color:"var(--text-secondary)"},children:"Track and manage approved and restricted software assets."})]}),u&&e.jsxs("div",{style:{display:"flex",gap:"0.5rem"},children:[e.jsx(m,{variant:"secondary",icon:V,onClick:()=>O(S,"software"),children:"Template"}),e.jsxs("label",{className:"btn btn-secondary",style:{cursor:"pointer"},children:[e.jsx(G,{size:16,style:{marginRight:"0.5rem"}})," Import CSV",e.jsx("input",{type:"file",accept:".csv",style:{display:"none"},onChange:U})]}),e.jsx(m,{icon:M,onClick:()=>N(),children:"Add Software"})]})]}),e.jsxs("div",{className:"controls-bar glass-card",children:[e.jsxs("div",{className:"search-group",children:[e.jsx(H,{size:18,className:"search-icon"}),e.jsx("input",{type:"text",placeholder:"Search software or vendor...",className:"input-base search-input",value:x,onChange:a=>k(a.target.value)})]}),e.jsxs("div",{className:"filter-group",children:[e.jsx(J,{size:18,className:"filter-icon"}),e.jsxs("select",{className:"input-base filter-select",value:f,onChange:a=>I(a.target.value),children:[e.jsx("option",{value:"All",children:"All Statuses"}),e.jsx("option",{value:"Approved",children:"Approved"}),e.jsx("option",{value:"Blacklisted",children:"Blacklisted"}),e.jsx("option",{value:"Under Review",children:"Under Review"})]})]})]}),e.jsxs("div",{className:"table-container glass-panel",children:[p&&e.jsx("div",{className:"loading-state",children:"Loading inventory data..."}),!p&&e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Software & Vendor"}),e.jsx("th",{children:"Version"}),e.jsx("th",{children:"Scope"}),e.jsx("th",{children:"Status"}),e.jsx("th",{children:"Ticket "}),e.jsx("th",{children:"Date Added"}),u&&e.jsx("th",{style:{textAlign:"right"},children:"Actions"})]})}),e.jsx("tbody",{children:C.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:u?7:6,className:"empty-state",children:"No software records found."})}):C.map(a=>e.jsxs("tr",{children:[e.jsxs("td",{children:[e.jsx("div",{style:{fontWeight:600,color:"var(--text-primary)"},children:a.name}),e.jsx("div",{style:{fontSize:"0.75rem",color:"var(--text-tertiary)"},children:a.vendor})]}),e.jsx("td",{children:a.version}),e.jsx("td",{children:a.scope}),e.jsx("td",{children:e.jsx(E,{variant:W[a.status]||"neutral",children:a.status})}),e.jsx("td",{children:a.ticket?e.jsx("span",{style:{fontFamily:"monospace",fontSize:"0.75rem",background:"rgba(255,255,255,0.1)",padding:"0.1rem 0.4rem",borderRadius:"4px"},children:a.ticket}):"-"}),e.jsx("td",{style:{color:"var(--text-secondary)",fontSize:"0.8rem"},children:a.dateAdded}),u&&e.jsx("td",{style:{textAlign:"right"},children:e.jsxs("div",{className:"action-buttons",children:[e.jsx(y,{icon:P,onClick:()=>N(a)}),e.jsx(y,{icon:L,onClick:()=>B(a.id),className:"danger-icon"})]})})]},a.id))})]})]}),D&&e.jsx("div",{className:"modal-overlay",children:e.jsxs("div",{className:"modal-content",children:[e.jsxs("div",{className:"modal-header",children:[e.jsx("h2",{children:d?"Edit Software":"Add Software"}),e.jsx(y,{icon:F,onClick:g})]}),e.jsxs("form",{onSubmit:R,className:"form-grid",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Software Name*"}),e.jsx("input",{required:!0,className:"input-base",value:s.name,onChange:a=>n({...s,name:a.target.value})})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Vendor*"}),e.jsx("input",{required:!0,className:"input-base",value:s.vendor,onChange:a=>n({...s,vendor:a.target.value})})]}),e.jsxs("div",{className:"form-row",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Version"}),e.jsx("input",{className:"input-base",value:s.version,onChange:a=>n({...s,version:a.target.value})})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Scope"}),e.jsxs("select",{className:"input-base",value:s.scope,onChange:a=>n({...s,scope:a.target.value}),children:[e.jsx("option",{value:"Global",children:"Global"}),e.jsx("option",{value:"Department",children:"Department"}),e.jsx("option",{value:"Local",children:"Local"})]})]})]}),e.jsxs("div",{className:"form-row",children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Status"}),e.jsxs("select",{className:"input-base",value:s.status,onChange:a=>n({...s,status:a.target.value}),children:[e.jsx("option",{value:"Approved",children:"Approved"}),e.jsx("option",{value:"Under Review",children:"Under Review"}),e.jsx("option",{value:"Blacklisted",children:"Blacklisted"})]})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"Ticket Reference"}),e.jsx("input",{className:"input-base",placeholder:"e.g. SEC-1234",value:s.ticket,onChange:a=>n({...s,ticket:a.target.value})})]})]}),e.jsxs("div",{className:"form-group",style:{gridColumn:"1 / -1"},children:[e.jsx("label",{children:"Justification / Notes"}),e.jsx("textarea",{className:"input-base",rows:3,value:s.justification,onChange:a=>n({...s,justification:a.target.value}),placeholder:"Provide context for this software approval or restriction..."})]}),e.jsxs("div",{className:"modal-actions",children:[e.jsx(m,{variant:"secondary",type:"button",onClick:g,children:"Cancel"}),e.jsx(m,{variant:"primary",type:"submit",icon:$,disabled:p,children:p?"Saving...":"Save Software"})]})]})]})}),e.jsx("style",{jsx:"true",children:`
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
      `})]})};export{_ as default};
