
/**
formeo - https://formeo.io
Version: 3.1.3
Author: Draggable https://draggable.io
*/

import{C as e,m as t,t as o}from"./demo.min.js";const a=(e,a=3)=>Array.from({length:a},((e,t)=>t+1)).map((a=>{const r="checkbox"===e?"checked":"selected";return{label:t.get("labelCount",{label:o(e),count:a}),value:`${e}-${a}`,[r]:!a}}));const r=[class extends e{constructor(){super({tag:"button",attrs:{className:[{label:"grouped",value:"f-btn-group"},{label:"ungrouped",value:"f-field-group"}]},config:{label:t.get("controls.form.button"),hideLabel:!0},meta:{group:"common",icon:"button",id:"button"},options:[{label:t.get("button"),type:["button","submit","reset"].map((e=>({label:e,type:e}))),className:[{label:"default",value:"",selected:!0},{label:"primary",value:"primary"},{label:"danger",value:"error"},{label:"success",value:"success"},{label:"warning",value:"warning"}]}]})}},class extends e{constructor(){super({tag:"input",attrs:{type:"date",required:!1,className:""},config:{label:t.get("controls.form.input.date")},meta:{group:"common",icon:"calendar",id:"date-input"}})}},class extends e{constructor(){super({tag:"input",attrs:{type:"hidden",value:""},config:{label:t.get("hidden"),hideLabel:!0},meta:{group:"common",icon:"hidden",id:"hidden"}})}},class extends e{constructor(){super({tag:"input",attrs:{type:"number",required:!1,className:""},config:{label:t.get("number")},meta:{group:"common",icon:"hash",id:"number"}})}},class extends e{constructor(){super({tag:"textarea",config:{label:t.get("controls.form.textarea")},meta:{group:"common",icon:"textarea",id:"textarea"},attrs:{required:!1}})}},class extends e{constructor(){super({tag:"input",attrs:{required:!1,type:"text",className:""},config:{label:t.get("controls.form.input.text")},meta:{group:"common",icon:"text-input",id:"text-input"}})}},class extends e{constructor(){super({tag:"input",attrs:{type:"file",required:!1},config:{label:t.get("fileUpload")},meta:{group:"common",icon:"upload",id:"upload"}})}},class extends e{constructor(){super({tag:"select",config:{label:t.get("controls.form.select")},attrs:{required:!1,className:""},meta:{group:"common",icon:"select",id:"select"},options:a("option")})}},class extends e{constructor(){super({tag:"input",attrs:{type:"checkbox",required:!1},config:{label:t.get("controls.form.checkbox-group"),disabledAttrs:["type"]},meta:{group:"common",icon:"checkbox",id:"checkbox"},options:a("checkbox",1)})}},class extends e{constructor(){super({tag:"input",attrs:{type:"radio",required:!1},config:{label:t.get("controls.form.radio-group"),disabledAttrs:["type"]},meta:{group:"common",icon:"radio-group",id:"radio"},options:a("radio")})}}];export{r as default};