
/**
formeo - https://formeo.io
Version: 3.1.1
Author: Draggable https://draggable.io
*/

import{C as e,m as t,a as r}from"./demo.min.js";const a=Array.from(Array(5).keys()).slice(1).map((e=>`h${e}`)),o="controls.html.header";const i=[class extends e{constructor(){super({tag:a[0],attrs:{tag:a.map(((e,t)=>({label:e.toUpperCase(),value:e,selected:!t}))),className:""},config:{label:t.get(o),hideLabel:!0,editableContent:!0},meta:{group:"html",icon:"header",id:"html.header"},content:t.get(o),action:{}})}static get definition(){return{i18n:{"en-US":{header:"Custom English Header"}}}}get content(){return super.i18n(o)}},class extends e{constructor(){super({tag:"p",attrs:{className:""},config:{label:t.get("controls.html.paragraph"),hideLabel:!0,editableContent:!0},meta:{group:"html",icon:"paragraph",id:"paragraph"},content:"Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition. Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment."})}},class extends e{constructor(){super({tag:"hr",config:{label:t.get("controls.html.divider"),hideLabel:!0},meta:{group:"html",icon:"divider",id:"divider"}})}},class extends e{constructor(e){super(r({tag:"textarea",config:{label:"WYSIWYG",editableContent:!0},meta:{group:"html",icon:"rich-text",id:"tinymce"},attrs:{required:!1},dependencies:{js:"https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.9.11/tinymce.min.js"},action:{onRender:e=>{const t=`#${e.id}`;window.tinymce.remove(t),window.tinymce.init({selector:t})}},controlAction:{click:()=>{},onRender:()=>{}}},e))}}];export{i as default};
