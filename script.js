
const categories=[
{name:"bald / später",info:"Wohnprojekt soll eher in 2 Jahren stattfinden – oder in 10 Jahren. Hier steht türkis, also rechts für eher bald und orange, also links, für eher später"},
{name:"München",info:"in, um oder nahe München wohnen"},
{name:"Stadt",info:"städtisch wohnen"},
{name:"Land",info:"ländlich wohnen"},
{name:"Garten",info:"mit Gartenfläche am Haus oder Kleingarten"},
{name:"Renovierungsbedürftig",info:"Ein Objekt, das stark renovierungsbedürftig ist bevor bezugsbereit."},
{name:"Raum für soziale/kulturelle Projekte",info:"Veranstaltungen, Werkstätten, etc..."},
{name:"Mehrgenerationenhaus",info:"Projekt, in dem Menschen aus unterschiedlichen Generationen zusammenleben, also Kinder, Jugendliche, Erwachsene, Alte Menschen."},
{name:"gemeinsamer Erwerb",info:"durch wirtschaftliches Projekt"},
{name:"geteilte Ökonomie",info:"gemeinsam verwaltetes Konto, Bedürfnis- und Kapazitätenorientierte gemeinsame Finanzen (...ausarbeiten?)"},
{name:"geteilter Wohnraum & -alltag",info:"Räume und Alltagsaufgaben werden gemeinsam genutzt und gestaltet, zB gemeinsame Küche, gemeinsames Wohnzimmer, gemeinsamer Kühlschrank, etc."},
{name:"einzelne Parteien",info:"mehrere Parteien in einem Wohnprojekt, zB in einem Wohnhaus"},
{name:'Wohnraum mit "Fremden"',info:"Menschen, die nicht Teil des Freundeskreises/Netzwerks sind, können potenziell in größere Wohnprojekte miteinbezogen sein und einziehen"},
{name:'viele / wenige Leute',info:"Wohnprojekt mit großer Gruppe an Leuten, ca 20, bzw eher wenigen, ca 5. hier steht links, türkis für Viele und rechts, orange, für wenige."}
]

const grid=document.getElementById("grid")
const labels=document.getElementById("labels")
const canvas=document.getElementById("flowCanvas")
const ctx=canvas.getContext("2d")
const tooltip=document.getElementById("tooltip")

let selections={}
let blobs={}

categories.forEach((cat,row)=>{

const label=document.createElement("div")
label.className="label"
label.innerText=(row+1)+". "+cat.name
labels.appendChild(label)

label.onmousemove=(e)=>{
tooltip.style.display="block"
tooltip.innerText=cat.info
tooltip.style.left=e.pageX+15+"px"
tooltip.style.top=e.pageY+1+"px"
}
label.onmouseleave=()=>tooltip.style.display="none"

selections[row]=[]

for(let col=0;col<6;col++){

const cell=document.createElement("div")
cell.className="cell"
cell.dataset.row=row
cell.dataset.col=col

cell.onclick=()=>selectCell(row,col)

grid.appendChild(cell)

}

})

function selectCell(row,col){

let selected=selections[row]

if(selected.includes(col)){
selected.splice(selected.indexOf(col),1)
}else{

if(selected.length>=3)return

if(selected.length>0){
let min=Math.min(...selected)
let max=Math.max(...selected)
if(col<min-1||col>max+1)return
}

selected.push(col)
}

updateRow(row)
drawFlow()
}

function updateRow(row){

const cells=[...document.querySelectorAll(`.cell[data-row='${row}']`)]

cells.forEach(c=>{
c.classList.remove("grey")
if(selections[row].length>0 && !selections[row].includes(parseInt(c.dataset.col))){
c.classList.add("grey")
}
})

drawBlob(row)
}

function drawBlob(row){

if(blobs[row]) blobs[row].remove()

let cols=selections[row]
if(cols.length==0)return

let min=Math.min(...cols)
let max=Math.max(...cols)

let blob=document.createElement("div")
blob.className="blob"

blob.style.left=(min*60+5)+"px"
blob.style.top=(row*54+7)+"px"
blob.style.width=((max-min+1)*60-10)+"px"

document.getElementById("gridWrapper").appendChild(blob)

blobs[row]=blob
}

function drawFlow(){

canvas.width=grid.offsetWidth
canvas.height=grid.offsetHeight

ctx.clearRect(0,0,canvas.width,canvas.height)

let points=[]

Object.keys(selections).forEach(r=>{

let cols=selections[r]
if(cols.length==0)return

let center=cols.reduce((a,b)=>a+b)/cols.length

points.push({
x:center*60+30,
y:r*54+27
})

})

if(points.length<2)return

ctx.beginPath()
ctx.moveTo(points[0].x,points[0].y)

for(let i=1;i<points.length;i++){
let prev=points[i-1]
let curr=points[i]
let cx=(prev.x+curr.x)/2
ctx.quadraticCurveTo(prev.x,prev.y,cx,(prev.y+curr.y)/2)
ctx.quadraticCurveTo(cx,(prev.y+curr.y)/2,curr.x,curr.y)
}

ctx.lineWidth=5
ctx.strokeStyle="black"
ctx.stroke()
}

document.getElementById("download").onclick=()=>{

html2canvas(document.querySelector("#capture"),{
scale:2,
backgroundColor:null
}).then(canvas=>{

const link=document.createElement("a")
link.download="wohnprojekt_praeferenzen.png"
link.href=canvas.toDataURL()
link.click()

})
}

const help=document.getElementById("helpModal")

document.getElementById("helpBtn").onclick=()=>help.style.display="flex"
document.getElementById("closeHelp").onclick=()=>help.style.display="none"
