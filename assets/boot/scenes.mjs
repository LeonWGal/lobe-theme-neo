// Procedural scenes shared with the offline gallery.
export const vertex = `#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`;
const header = `#version 300 es
precision highp float;
uniform vec2 size;uniform float time;uniform vec3 accent;
out vec4 pixel;`;

const noise = `float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float cloud(vec2 p){return .59*noise(p)+.26*noise(p*2.03+5.1)+.15*noise(p*4.08-6.4);}`;

const line = `float line(float d,float w){return exp(-abs(d)/w);}`;

const rotation = `mat2 rotation(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}`;

const box = `float box2(vec2 p,vec2 halfSize,float radius){
 vec2 v=abs(p)-halfSize+radius;
 return length(max(v,0.))+min(max(v.x,v.y),0.)-radius;
}`;

const glass = `vec3 lightField(vec2 p,float t){
 float wave=p.y+.11*sin(p.x*5.+t)+.095*cos(p.x*9.-t*.72);
 float curl=p.y-.22*sin(p.x*3.4-t*.72)-.09;
 float spots=exp(-dot(p-vec2(.29*sin(t),.17),p-vec2(.29*sin(t),.17))*12.);
 return vec3(.010,.015,.025)
   +accent*(line(wave,.048)*.63+line(wave+.12,.15)*.17)
   +mix(accent,vec3(.37,.24,1.),.67)*line(curl,.058)*.47
   +vec3(.32,.58,.89)*spots*.22;
}
vec3 glassSample(vec2 p,vec2 bend,float t,float dispersion){
 vec3 red=lightField(p+bend*(1.+dispersion),t);
 vec3 green=lightField(p+bend,t);
 vec3 blue=lightField(p+bend*(1.-dispersion),t);
 return vec3(red.r,green.g,blue.b);
}`;

const pane = `vec3 liquidMaterial(vec3 under,vec2 p,float d,float t,float thickness,float frost){
 // Screen-space normal, rounded bevel and separate samples for RGB transmission.
 vec2 gradient=vec2(dFdx(d),dFdy(d));
 vec2 n=gradient/max(length(gradient),.00004);
 float aa=max(fwidth(d),.001);
 float mask=1.-smoothstep(-aa,aa,d);
 float depth=clamp(-d/max(.024,thickness),0.,1.);
 float bevel=exp(-depth*4.);
 vec2 bend=n*thickness*(.08+.97*bevel);
 vec3 transmission=glassSample(p,bend,t,.30+.46*bevel);
 vec2 blur=vec2(.024,.018)*(1.+frost);
 vec3 mist=(lightField(p+bend+blur,t)+lightField(p+bend-blur,t))*.5;
 transmission=mix(transmission,mist,frost);
 float facing=clamp(.48+.52*dot(n,normalize(vec2(-.47,.88))),0.,1.);
 float sweep=.45+.55*pow(.5+.5*cos(t*1.4+dot(p,vec2(9.,5.))),3.);
 vec3 reflection=mix(accent,vec3(.94,.97,1.),.73);
 vec3 glass=transmission*(.80-.22*frost)+accent*(.065+depth*.07);
 glass+=reflection*(facing*bevel*.15+line(d+.004,.004)*facing*sweep*.57);
 glass+=accent*line(d+.023,.011)*(.11+.18*facing);
 return mix(under*(1.-.19*line(d-.011,.024)),glass,mask)
   +accent*line(d-.003,.022)*.055;
}
vec3 pane(vec3 under,vec2 p,vec2 local,vec2 dims,float angle,float t){
 float d=box2(local,dims,.062), aa=max(fwidth(d),.001);
 float mask=1.-smoothstep(-aa,aa,d);
 float rim=line(d,.010), bevel=exp(-abs(d)*42.);
 vec2 edge=abs(local/dims);
 vec2 normal=rotation(-angle)*normalize(local+vec2(.0001));
 vec2 offset=rotation(-angle)*vec2(.04,-.023)+normal*(.022+.09*bevel);
 vec3 through=glassSample(p,offset,t,.34);
 vec3 soft=lightField(p+offset+vec2(.04,.02),t)+lightField(p+offset-vec2(.04,.02),t);
 through=mix(through,soft*.5,.36);
 float shine=smoothstep(.05,.9,-local.x/dims.x+local.y/dims.y);
 vec3 surface=through*.82+accent*(.055+.09*bevel)
   +mix(accent,vec3(1.),.68)*rim*(.25+.48*shine);
 surface+=vec3(.18,.23,.31)*max(edge.x,edge.y)*.11;
 return mix(under*(1.-.24*line(d-.011,.04)),mix(surface,liquidMaterial(under,p,d,t,.078,.42),.44),mask);
}`;

const turn = `mat2 turn(float a){return mat2(cos(a),sin(a),-sin(a),cos(a));}`;

const stars = `float stars(vec2 p){
 vec2 grid=p*160.,cell=floor(grid);
 vec2 offset=vec2(hash(cell),hash(cell+7.))*.72+.14;
 vec2 d=fract(grid)-offset;
 return exp(-dot(d,d)*88.)*smoothstep(.978,1.,hash(cell+19.));
}`;

const aurora = `vec3 aurora(vec2 p,float t){
 const int mode=0;
 vec3 c=vec3(.57,.71,.95)*stars(p)*.34;
 float k=float(mode);
 vec2 q=p;
 if(mode==2) q=turn(-.37)*p;
 if(mode==4) q=turn(.28)*p;
 for(int i=0;i<4;i++){
  float layer=float(i),x=q.x;
  float phase=x*(3.4+.58*k)+layer*1.52+t*(.59+.09*layer);
  float ripple=sin(phase)*(.11+.014*k)+sin(phase*2.3-t)*.037;
  if(mode==3) ripple+=(cloud(vec2(x*3.5+t*.17,layer+t*.14))-.5)*.23;
  if(mode==4) ripple+=(length(vec2(x,q.y*.7))-.44)*.21;
  float y=q.y-(.06+layer*.066+ripple);
  float folds=.40+.60*pow(.5+.5*sin(phase*(mode==0?7.1:4.9)+2.*cos(phase)),2.1);
  float rim=line(y,mode==1?.031:.012);
  float veil=exp(-max(y,0.)*(mode==4?4.7:8.3))*smoothstep(-.04,.018,y);
  vec3 tip=mode==4?vec3(.31,.46,1.):vec3(.54,.30,.88);
  c+=mix(accent,tip,smoothstep(0.,.25,y))*(rim*.34+veil*.41)*folds/(1.+layer*.42);
 }
 if(mode==0||mode==4){
  float ridge=-.32+(cloud(vec2(p.x*5.,1.3))-.5)*.18;
  c*=mix(.22,1.,smoothstep(ridge-.012,ridge+.003,p.y));
 }
 return c;
}`;

const blackHole = `vec3 blackHole(vec2 p,float t){
 const int mode=HOLE_MODE;
 vec2 q=p-vec2(-.075,.035);
 float r=length(q),angle=atan(q.y,q.x);
 float boundary=.179;
 if(mode==9)boundary=.267+.027*(cloud(q*13.+t*.32)-.5);
 float d=r-boundary;
 float clear=smoothstep(-.0025,.0035,d);
 float band=.51+.49*sin(angle*(mode==9?3.:2.)+t*.92+sin(angle*3.)*.72);
 vec3 hot=mix(accent,vec3(1.,.96,.86),.56);
 vec2 bent=q-q*.014/max(.05,r*r);
 vec3 c=(vec3(.68,.78,1.)*stars(bent)*.36)*clear;
 c+=mix(accent,hot,band)*line(d,mode==9?.013:.006)*(.35+band*.48);
 c+=accent*exp(-max(d,0.)*(mode==9?14.:26.))*clear*(.06+band*.24);
 if(mode==5||mode==9){
  float cloudiness=cloud(q*(mode==9?13.:19.)+vec2(t*.26,-t*.17));
  c+=accent*cloudiness*cloudiness*line(d-.04,mode==9?.073:.041)*clear*.46;
 }else{
  float roll=mode==6?-.20:mode==7?.26:-.065;
  vec2 v=turn(roll)*q;
  float tilt=mode==8?6.6:mode==7?3.8:4.9;
  float disk=length(v*vec2(1.,tilt));
  float filaments=.52+.48*sin(disk*(mode==7?195.:118.)-t*2.6+sin(v.x*22.)*1.8);
  float envelope=smoothstep(.131,.24,disk)*exp(-max(disk-.24,0.)*5.2);
  float front=1.-smoothstep(-.008,.006,v.y);
  float boost=.42+.80*smoothstep(-.34,.19,-v.x);
  c+=mix(accent,hot,filaments)*envelope*(.23+.49*filaments)*boost*max(front,clear);
  float farArc=abs(length(vec2(v.x,v.y*(mode==8?1.16:1.09)))-.231);
  c+=hot*line(farArc,.013)*smoothstep(-.015,.13,v.y)*boost*.48;
  if(mode==7){
   float plume=exp(-abs(v.x-v.y*.20)*28.)*smoothstep(.19,.30,abs(v.y))*exp(-abs(v.y)*3.3);
   c+=accent*plume*.39;
  }
 }
 return c;
}`;

const wave = `vec3 wavePalette(float hue,float saturation,float value){
 vec3 phase=fract(hue+vec3(0.,2./3.,1./3.))*6.;
 return value*mix(vec3(1.),clamp(abs(phase-3.)-1.,0.,1.),saturation);
}
vec3 threeColorWave(vec2 p,float t){
 float peak=max(accent.r,max(accent.g,accent.b));
 float range=peak-min(accent.r,min(accent.g,accent.b));
 float hue=.60;
 if(range>.065){
   hue=(peak==accent.r?(accent.g-accent.b)/range:
     peak==accent.g?2.+(accent.b-accent.r)/range:4.+(accent.r-accent.g)/range)/6.;
 }
 float saturation=range/max(peak,.01);
 vec3 dusk=wavePalette(hue+.095,clamp(saturation*.75,.28,.82),max(.48,peak*.74));
 vec3 crest=wavePalette(hue-.083,clamp(saturation*.55,.20,.68),min(1.,max(.66,peak*1.12)));
 vec3 light=vec3(0.);
 for(int i=0;i<7;i++){
   float k=float(i),spread=(k-3.)*.030;
   float main=sin(p.x*3.45+t*.87+k*.23)*(.115+k*.008);
   float fold=sin(p.x*6.4-t*.54+k*.39)*(.034+.014*cos(k));
   float distance=p.y-main-fold-spread-.025;
   vec3 color=i<2?dusk:i<5?accent:crest;
   float width=.006+.004*sin(k*.47+t*.34)*sin(k*.47+t*.34);
   light+=color*(line(distance,width)*.23+line(distance,.028+k*.002)*.085);
 }
 return light;
}`;

const glassStart = ` vec2 q=p-vec2(-.08,.03);
 vec3 c=lightField(p,t)*.27;
 vec3 glint=mix(accent,vec3(1.),.68);`;

const modernStart = ` vec2 q=p-vec2(-.09,.04);
 float r=length(q);
 vec3 c=vec3(0.);
 vec3 hot=mix(accent,vec3(.94,.97,1.),.52);`;

const glassScenes = {
  11: `for(int i=0;i<4;i++){
     float k=float(i),angle=-.23+.17*k+.055*sin(t+k);
     vec2 local=rotation(angle)*(q-vec2((k-1.5)*.112,.09*cos(k*1.22+t)));
     c=pane(c,p,local,vec2(.27,.185),angle,t+k*.17);
   }`,
  12: `for(int i=0;i<3;i++){
     float k=float(i),a=t*.55+k*2.094;
     vec2 v=q-vec2(cos(a)*.19,sin(a)*.115);
     float rad=.215-k*.026,d=length(v)-rad;
     float depth=sqrt(max(0.,1.-dot(v,v)/(rad*rad)));
     vec3 lens=glassSample(p,v*(.44+.26*depth),t,.72);
     float rim=line(d,.008)*(.28+.70*smoothstep(-.18,.13,v.y-v.x*.4));
     c=mix(c,lens*.96+glint*rim+accent*depth*.09,1.-smoothstep(-.003,.003,d));
     c+=accent*line(d,.022)*.12;
   }`,
  13: `vec2 v=rotation(-.28)*q;
   float rib=sin(v.x*74.+sin(v.y*7.+t)*2.);
   float curve=sin(v.x*3.+t)*.20;
   float fold=v.y-curve;
   vec2 bend=vec2(.048*rib,.07*sin(v.x*8.+t)+rib*.019);
   float silk=exp(-abs(fold)*4.6);
   c+=glassSample(p,bend,t,.43)*(.25+.71*silk);
   c+=glint*pow(.5+.5*rib,16.)*silk*.31;
   c+=accent*line(fold,.033)*.30;`,
};

const modernScenes = {
  34: `float y=-q.y+.045;
   float depth=.32/max(.026,y);
   vec2 projected=vec2(q.x*depth,depth+t*.85);
   vec2 g=abs(fract(projected)-.5);
   float mesh=max(line(.5-g.x,.024),line(.5-g.y,.023));
   c+=accent*mesh*smoothstep(.036,.19,y)*(.21+.22*clamp(y,0.,1.));
   c+=hot*line(y-.035,.020)*.32+vec3(.66,.74,1.)*stars(p)*.24;`,
  37: `vec2 v=turn(.43+t*.24)*q;
   float diamond=abs(v.x)+abs(v.y)-.39;
   float phase=sin(v.x*37.+sin(v.y*16.+t*2.2)*2.2);
   vec3 prism=glassSample(p,vec2(phase*.086,v.y*.17),t,.57);
   c+=prism*(1.-smoothstep(-.005,.005,diamond))*.82;
   c+=hot*line(diamond,.006)*.70+accent*line(diamond,.023)*.16;`,
  42: `float y=-q.y+.035, horizon=smoothstep(.008,.065,y);
   float depth=.28/max(y,.021);
   float wave=sin(depth*5.6-t*2.1+sin(q.x*8.+depth)*.76);
   float glimmer=pow(.5+.5*wave,12.)*exp(-abs(q.x+.14)*3.);
   c+=accent*horizon*(.055+glimmer*.65)*smoothstep(0.,.13,y);
   c+=hot*line(y,.008)*.24+vec3(.62,.74,1.)*stars(p)*(1.-horizon)*.32;`,
  49: `vec2 v=q*8.;
   float warp=sin(v.x+t)+cos(v.y-t*.53);
   float veins=sin(v.y*2.9+warp*1.7)+sin(v.x*2.4-warp*1.9);
   float junction=pow(.5+.5*sin(v.x*3.1+v.y*2.8-t),8.);
   c+=accent*line(veins,.10)*(.23+.41*junction)*exp(-r*r*.95);
   c+=hot*line(veins,.027)*junction*.36;`,
};

const flutedGlass = `vec2 v=q;float rib=sin(v.x*108.);
   v.x+=rib*.024;v.y+=rib*.019;
   float d=v.y-sin(v.x*4.9+t)*.18;
   c+=accent*line(d,.105)*(.28+.17*rib)+b*line(d+.045,.018)*.52;`;

export function fragmentForScene(scene) {
  let helpers = line;
  let body;
  if (scene === 1) {
    helpers += wave;
    body = "vec3 c=threeColorWave(p,t);";
  } else if (scene === 5) {
    body = `vec3 c=vec3(0.); vec2 q=p-vec2(-.08,.025); vec3 b=mix(accent,vec3(1.),.42); ${flutedGlass}`;
  } else if (Object.hasOwn(glassScenes, scene)) {
    helpers += glass;
    if (scene === 11) helpers += rotation + box + pane;
    if (scene === 13) helpers += rotation;
    body = glassStart + glassScenes[scene];
  } else if (scene === 20) {
    helpers += noise + turn + stars + aurora;
    body = "vec3 c=aurora(p,t);";
  } else if (scene === 21 || scene === 22) {
    helpers += noise + turn + stars + blackHole.replace("HOLE_MODE", scene === 21 ? "6" : "7");
    body = "vec3 c=blackHole(p,t);";
  } else if (Object.hasOwn(modernScenes, scene)) {
    if (scene === 34 || scene === 42) helpers += noise + stars;
    if (scene === 37) helpers += turn + glass;
    body = modernStart + modernScenes[scene];
  } else {
    throw new RangeError("Unknown splash scene: " + scene);
  }

  return `${header}
${helpers}
void main(){
 vec2 p=(gl_FragCoord.xy-size*.5)/size.y;
 float t=time*.42;
 ${body}
 c*=1.-.59*smoothstep(.28,1.14,length(p));
 c*=1.-.52*smoothstep(.08,.9,p.x)*smoothstep(.02,.45,-p.y);
 pixel=vec4(clamp(max(c,vec3(.020,.020,.027)),0.,1.),1.);
}`;
}
