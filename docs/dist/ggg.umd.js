var dt=Object.defineProperty;var vt=(c,y,N)=>y in c?dt(c,y,{enumerable:!0,configurable:!0,writable:!0,value:N}):c[y]=N;var $=(c,y,N)=>(vt(c,typeof y!="symbol"?y+"":y,N),N);(function(c,y){typeof exports=="object"&&typeof module!="undefined"?y(exports):typeof define=="function"&&define.amd?define(["exports"],y):(c=typeof globalThis!="undefined"?globalThis:c||self,y(c.ggg={}))})(this,function(c){"use strict";var y={Note:"Note",Rest:"Rest",Octave:"Octave",OctaveShift:"OctaveShift",NoteLength:"NoteLength",NoteVelocity:"NoteVelocity",NoteQuantize:"NoteQuantize",Tempo:"Tempo",InfiniteLoop:"InfiniteLoop",LoopBegin:"LoopBegin",LoopExit:"LoopExit",LoopEnd:"LoopEnd"},N={tempo:120,octave:4,length:4,velocity:100,quantize:75,loopCount:2},we=function(){function e(i,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(i,r.key,r)}}return function(i,t,n){return t&&e(i.prototype,t),n&&e(i,n),i}}();function xe(e,i){if(!(e instanceof i))throw new TypeError("Cannot call a class as a function")}var be=function(){function e(i){xe(this,e),this.source=i,this.index=0}return we(e,[{key:"hasNext",value:function(){return this.index<this.source.length}},{key:"peek",value:function(){return this.source.charAt(this.index)||""}},{key:"next",value:function(){return this.source.charAt(this.index++)||""}},{key:"forward",value:function(){for(;this.hasNext()&&this.match(/\s/);)this.index+=1}},{key:"match",value:function(t){return t instanceof RegExp?t.test(this.peek()):this.peek()===t}},{key:"expect",value:function(t){this.match(t)||this.throwUnexpectedToken(),this.index+=1}},{key:"scan",value:function(t){var n=this.source.substr(this.index),r=null;if(t instanceof RegExp){var o=t.exec(n);o&&o.index===0&&(r=o[0])}else n.substr(0,t.length)===t&&(r=t);return r&&(this.index+=r.length),r}},{key:"throwUnexpectedToken",value:function(){var t=this.peek()||"ILLEGAL";throw new SyntaxError("Unexpected token: "+t)}}]),e}(),ke=be,qe=function(){function e(i,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(i,r.key,r)}}return function(i,t,n){return t&&e(i.prototype,t),n&&e(i,n),i}}();function Se(e,i){if(!(e instanceof i))throw new TypeError("Cannot call a class as a function")}var g=y,Me=ke,Ne={c:0,d:2,e:4,f:5,g:7,a:9,b:11},Le=function(){function e(i){Se(this,e),this.scanner=new Me(i)}return qe(e,[{key:"parse",value:function(){var t=this,n=[];return this._readUntil(";",function(){n=n.concat(t.advance())}),n}},{key:"advance",value:function(){switch(this.scanner.peek()){case"c":case"d":case"e":case"f":case"g":case"a":case"b":return this.readNote();case"[":return this.readChord();case"r":return this.readRest();case"o":return this.readOctave();case">":return this.readOctaveShift(1);case"<":return this.readOctaveShift(-1);case"l":return this.readNoteLength();case"q":return this.readNoteQuantize();case"v":return this.readNoteVelocity();case"t":return this.readTempo();case"$":return this.readInfiniteLoop();case"/":return this.readLoop()}this.scanner.throwUnexpectedToken()}},{key:"readNote",value:function(){return{type:g.Note,noteNumbers:[this._readNoteNumber(0)],noteLength:this._readLength()}}},{key:"readChord",value:function(){var t=this;this.scanner.expect("[");var n=[],r=0;return this._readUntil("]",function(){switch(t.scanner.peek()){case"c":case"d":case"e":case"f":case"g":case"a":case"b":n.push(t._readNoteNumber(r));break;case">":t.scanner.next(),r+=12;break;case"<":t.scanner.next(),r-=12;break;default:t.scanner.throwUnexpectedToken()}}),this.scanner.expect("]"),{type:g.Note,noteNumbers:n,noteLength:this._readLength()}}},{key:"readRest",value:function(){return this.scanner.expect("r"),{type:g.Rest,noteLength:this._readLength()}}},{key:"readOctave",value:function(){return this.scanner.expect("o"),{type:g.Octave,value:this._readArgument(/\d+/)}}},{key:"readOctaveShift",value:function(t){return this.scanner.expect(/<|>/),{type:g.OctaveShift,direction:t|0,value:this._readArgument(/\d+/)}}},{key:"readNoteLength",value:function(){return this.scanner.expect("l"),{type:g.NoteLength,noteLength:this._readLength()}}},{key:"readNoteQuantize",value:function(){return this.scanner.expect("q"),{type:g.NoteQuantize,value:this._readArgument(/\d+/)}}},{key:"readNoteVelocity",value:function(){return this.scanner.expect("v"),{type:g.NoteVelocity,value:this._readArgument(/\d+/)}}},{key:"readTempo",value:function(){return this.scanner.expect("t"),{type:g.Tempo,value:this._readArgument(/\d+(\.\d+)?/)}}},{key:"readInfiniteLoop",value:function(){return this.scanner.expect("$"),{type:g.InfiniteLoop}}},{key:"readLoop",value:function(){var t=this;this.scanner.expect("/"),this.scanner.expect(":");var n={type:g.LoopBegin},r={type:g.LoopEnd},o=[];return o=o.concat(n),this._readUntil(/[|:]/,function(){o=o.concat(t.advance())}),o=o.concat(this._readLoopExit()),this.scanner.expect(":"),this.scanner.expect("/"),n.value=this._readArgument(/\d+/)||null,o=o.concat(r),o}},{key:"_readUntil",value:function(t,n){for(;this.scanner.hasNext()&&(this.scanner.forward(),!(!this.scanner.hasNext()||this.scanner.match(t)));)n()}},{key:"_readArgument",value:function(t){var n=this.scanner.scan(t);return n!==null?+n:null}},{key:"_readNoteNumber",value:function(t){var n=Ne[this.scanner.next()];return n+this._readAccidental()+t}},{key:"_readAccidental",value:function(){return this.scanner.match("+")?1*this.scanner.scan(/\++/).length:this.scanner.match("-")?-1*this.scanner.scan(/\-+/).length:0}},{key:"_readDot",value:function(){for(var t=(this.scanner.scan(/\.+/)||"").length,n=new Array(t),r=0;r<t;r++)n[r]=0;return n}},{key:"_readLength",value:function(){var t=[];t=t.concat(this._readArgument(/\d+/)),t=t.concat(this._readDot());var n=this._readTie();return n&&(t=t.concat(n)),t}},{key:"_readTie",value:function(){return this.scanner.forward(),this.scanner.match("^")?(this.scanner.next(),this._readLength()):null}},{key:"_readLoopExit",value:function(){var t=this,n=[];if(this.scanner.match("|")){this.scanner.next();var r={type:g.LoopExit};n=n.concat(r),this._readUntil(":",function(){n=n.concat(t.advance())})}return n}}]),e}(),Ie=Le,Te=function(){function e(i,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(i,r.key,r)}}return function(i,t,n){return t&&e(i.prototype,t),n&&e(i,n),i}}();function Ee(e,i){if(!(e instanceof i))throw new TypeError("Cannot call a class as a function")}var m=y,w=N,Oe=Ie,Ce=typeof Symbol!="undefined"?Symbol.iterator:"@@iterator",Re=function(){function e(i){Ee(this,e),this.source=i,this._commands=new Oe(i).parse(),this._commandIndex=0,this._processedTime=0,this._iterator=null,this._octave=w.octave,this._noteLength=[w.length],this._velocity=w.velocity,this._quantize=w.quantize,this._tempo=w.tempo,this._infiniteLoopIndex=-1,this._loopStack=[],this._done=!1}return Te(e,[{key:"hasNext",value:function(){return this._commandIndex<this._commands.length}},{key:"next",value:function(){if(this._done)return{done:!0,value:null};if(this._iterator){var t=this._iterator.next();if(!t.done)return t}var n=this._forward(!0);if(ne(n))this._iterator=this[n.type](n);else return this._done=!0,{done:!1,value:{type:"end",time:this._processedTime}};return this.next()}},{key:Ce,value:function(){return this}},{key:"_forward",value:function(t){for(;this.hasNext()&&!ne(this._commands[this._commandIndex]);){var n=this._commands[this._commandIndex++];this[n.type](n)}return t&&!this.hasNext()&&this._infiniteLoopIndex!==-1?(this._commandIndex=this._infiniteLoopIndex,this._forward(!1)):this._commands[this._commandIndex++]||{}}},{key:"_calcDuration",value:function(t){var n=this;t[0]===null&&(t=this._noteLength.concat(t.slice(1)));var r=null,o=0;return t=t.map(function(h){switch(h){case null:h=r;break;case 0:h=o*=2;break;default:r=o=h;break}var p=h!==null?h:w.length;return 60/n._tempo*(4/p)}),t.reduce(function(h,p){return h+p},0)}},{key:"_calcNoteNumber",value:function(t){return t+this._octave*12+12}},{key:m.Note,value:function(t){var n=this,r="note",o=this._processedTime,h=this._calcDuration(t.noteLength),p=t.noteNumbers.map(function(f){return n._calcNoteNumber(f)}),l=this._quantize,u=this._velocity;return this._processedTime=this._processedTime+h,ze(p.map(function(f){return{type:r,time:o,duration:h,noteNumber:f,velocity:u,quantize:l}}))}},{key:m.Rest,value:function(t){var n=this._calcDuration(t.noteLength);this._processedTime=this._processedTime+n}},{key:m.Octave,value:function(t){this._octave=t.value!==null?t.value:w.octave}},{key:m.OctaveShift,value:function(t){var n=t.value!==null?t.value:1;this._octave+=n*t.direction}},{key:m.NoteLength,value:function(t){var n=t.noteLength.map(function(r){return r!==null?r:w.length});this._noteLength=n}},{key:m.NoteVelocity,value:function(t){this._velocity=t.value!==null?t.value:w.velocity}},{key:m.NoteQuantize,value:function(t){this._quantize=t.value!==null?t.value:w.quantize}},{key:m.Tempo,value:function(t){this._tempo=t.value!==null?t.value:w.tempo}},{key:m.InfiniteLoop,value:function(){this._infiniteLoopIndex=this._commandIndex}},{key:m.LoopBegin,value:function(t){var n=t.value!==null?t.value:w.loopCount,r=this._commandIndex,o=-1;this._loopStack.push({loopCount:n,loopTopIndex:r,loopOutIndex:o})}},{key:m.LoopExit,value:function(){var t=this._loopStack[this._loopStack.length-1],n=this._commandIndex;t.loopCount<=1&&t.loopOutIndex!==-1&&(n=t.loopOutIndex),this._commandIndex=n}},{key:m.LoopEnd,value:function(){var t=this._loopStack[this._loopStack.length-1],n=this._commandIndex;t.loopOutIndex===-1&&(t.loopOutIndex=this._commandIndex),t.loopCount-=1,0<t.loopCount?n=t.loopTopIndex:this._loopStack.pop(),this._commandIndex=n}}]),e}();function ze(e){var i=0;return{next:function(){return i<e.length?{done:!1,value:e[i++]}:{done:!0}}}}function ne(e){return e.type===m.Note||e.type===m.Rest}var Ae=Re,Pe=Ae;let x,ae,W,re,se=!1;function $e(e=void 0){x=e==null?new(window.AudioContext||window.webkitAudioContext):e,oe(),he()}function Be(){se||(se=!0,x.resume(),Ue())}function oe(e=150){ae=e,W=60/ae}function he(e=8){re=4/e}function X(e){const i=W*re;return i>0?Math.ceil(e/i)*i:e}function Ue(){const e=x.createBufferSource();e.start=e.start||e.noteOn,e.connect(x.destination),e.start()}let L=Math.random();function De(e){L=e}var R=0,z=1,B=2,U=3,Fe=1,D=8;function d(){this.oldParams=!0,this.wave_type=R,this.p_env_attack=0,this.p_env_sustain=.3,this.p_env_punch=0,this.p_env_decay=.4,this.p_base_freq=.3,this.p_freq_limit=0,this.p_freq_ramp=0,this.p_freq_dramp=0,this.p_vib_strength=0,this.p_vib_speed=0,this.p_arp_mod=0,this.p_arp_speed=0,this.p_duty=0,this.p_duty_ramp=0,this.p_repeat_speed=0,this.p_pha_offset=0,this.p_pha_ramp=0,this.p_lpf_freq=1,this.p_lpf_ramp=0,this.p_lpf_resonance=0,this.p_hpf_freq=0,this.p_hpf_ramp=0,this.sound_vol=.5,this.sample_rate=44100,this.sample_size=8}function F(e){return e*e}function pe(e){return e*e*e}var Qe=Math.pow;function a(e){return L()*e}function I(e,i){return L()*(i-e)+e}function s(e){return Math.floor(L()*(e+1))}function Q(e,i,t){return e<<31|i<<23|t}function Ve(e){if(isNaN(e))return Q(0,255,4919);var i=e<0?1:0;if(e=Math.abs(e),e==0)return Q(i,0,0);var t=Math.floor(Math.log(e)/Math.LN2);if(t>127||t<-126)return Q(i,255,0);var n=e/Math.pow(2,t);return Q(i,t+127,n*Math.pow(2,23)&8388607)}function je(e){var i=e&2147483648?-1:1,t=(e>>23&255)-127,n=e&~(-1<<23);if(t==128)return i*(n?Number.NaN:Number.POSITIVE_INFINITY);if(t==-127){if(n==0)return i*0;t=-126,n/=1<<22}else n=(n|1<<23)/(1<<23);return i*n*Math.pow(2,t)}var fe="123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",V=["wave_type","p_env_attack","p_env_sustain","p_env_punch","p_env_decay","p_base_freq","p_freq_limit","p_freq_ramp","p_freq_dramp","p_vib_strength","p_vib_speed","p_arp_mod","p_arp_speed","p_duty","p_duty_ramp","p_repeat_speed","p_pha_offset","p_pha_ramp","p_lpf_freq","p_lpf_ramp","p_lpf_resonance","p_hpf_freq","p_hpf_ramp"];d.prototype.toB58=function(){var e=[];for(var i in V){var t=V[i];if(t=="wave_type")e.push(this[t]);else if(t.indexOf("p_")==0){var n=this[t];n=Ve(n),e.push(255&n),e.push(255&n>>8),e.push(255&n>>16),e.push(255&n>>24)}}return function(r,o){var h=[],p="",l,u,f,v;for(l in r)for(u=0,f=r[l],p+=f||p.length^l?"":1;u in h||f;)v=h[u],v=v?v*256+f:f,f=v/58|0,h[u]=v%58,u++;for(;u--;)p+=o[h[u]];return p}(e,fe)},d.prototype.fromB58=function(e){return this.fromJSON(T.b58decode(e)),this},d.prototype.fromJSON=function(e){for(var i in e)e.hasOwnProperty(i)&&(this[i]=e[i]);return this},d.prototype.pickupCoin=function(){return this.wave_type=z,this.p_base_freq=.4+a(.5),this.p_env_attack=0,this.p_env_sustain=a(.1),this.p_env_decay=.1+a(.4),this.p_env_punch=.3+a(.3),s(1)&&(this.p_arp_speed=.5+a(.2),this.p_arp_mod=.2+a(.4)),this},d.prototype.laserShoot=function(){return this.wave_type=s(2),this.wave_type===B&&s(1)&&(this.wave_type=s(1)),s(2)===0?(this.p_base_freq=.3+a(.6),this.p_freq_limit=a(.1),this.p_freq_ramp=-.35-a(.3)):(this.p_base_freq=.5+a(.5),this.p_freq_limit=this.p_base_freq-.2-a(.6),this.p_freq_limit<.2&&(this.p_freq_limit=.2),this.p_freq_ramp=-.15-a(.2)),this.wave_type===z&&(this.p_duty=1),s(1)?(this.p_duty=a(.5),this.p_duty_ramp=a(.2)):(this.p_duty=.4+a(.5),this.p_duty_ramp=-a(.7)),this.p_env_attack=0,this.p_env_sustain=.1+a(.2),this.p_env_decay=a(.4),s(1)&&(this.p_env_punch=a(.3)),s(2)===0&&(this.p_pha_offset=a(.2),this.p_pha_ramp=-a(.2)),this.p_hpf_freq=a(.3),this},d.prototype.explosion=function(){return this.wave_type=U,s(1)?(this.p_base_freq=F(.1+a(.4)),this.p_freq_ramp=-.1+a(.4)):(this.p_base_freq=F(.2+a(.7)),this.p_freq_ramp=-.2-a(.2)),s(4)===0&&(this.p_freq_ramp=0),s(2)===0&&(this.p_repeat_speed=.3+a(.5)),this.p_env_attack=0,this.p_env_sustain=.1+a(.3),this.p_env_decay=a(.5),s(1)&&(this.p_pha_offset=-.3+a(.9),this.p_pha_ramp=-a(.3)),this.p_env_punch=.2+a(.6),s(1)&&(this.p_vib_strength=a(.7),this.p_vib_speed=a(.6)),s(2)===0&&(this.p_arp_speed=.6+a(.3),this.p_arp_mod=.8-a(1.6)),this},d.prototype.powerUp=function(){return s(1)?(this.wave_type=z,this.p_duty=1):this.p_duty=a(.6),this.p_base_freq=.2+a(.3),s(1)?(this.p_freq_ramp=.1+a(.4),this.p_repeat_speed=.4+a(.4)):(this.p_freq_ramp=.05+a(.2),s(1)&&(this.p_vib_strength=a(.7),this.p_vib_speed=a(.6))),this.p_env_attack=0,this.p_env_sustain=a(.4),this.p_env_decay=.1+a(.4),this},d.prototype.hitHurt=function(){return this.wave_type=s(2),this.wave_type===B&&(this.wave_type=U),this.wave_type===R&&(this.p_duty=a(.6)),this.wave_type===z&&(this.p_duty=1),this.p_base_freq=.2+a(.6),this.p_freq_ramp=-.3-a(.4),this.p_env_attack=0,this.p_env_sustain=a(.1),this.p_env_decay=.1+a(.2),s(1)&&(this.p_hpf_freq=a(.3)),this},d.prototype.jump=function(){return this.wave_type=R,this.p_duty=a(.6),this.p_base_freq=.3+a(.3),this.p_freq_ramp=.1+a(.2),this.p_env_attack=0,this.p_env_sustain=.1+a(.3),this.p_env_decay=.1+a(.2),s(1)&&(this.p_hpf_freq=a(.3)),s(1)&&(this.p_lpf_freq=1-a(.6)),this},d.prototype.blipSelect=function(){return this.wave_type=s(1),this.wave_type===R?this.p_duty=a(.6):this.p_duty=1,this.p_base_freq=.2+a(.4),this.p_env_attack=0,this.p_env_sustain=.1+a(.1),this.p_env_decay=a(.2),this.p_hpf_freq=.1,this},d.prototype.synth=function(){return this.wave_type=s(1),this.p_base_freq=[.2723171360931539,.19255692561524382,.13615778746815113][s(2)],this.p_env_attack=s(4)>3?a(.5):0,this.p_env_sustain=a(1),this.p_env_punch=a(1),this.p_env_decay=a(.9)+.1,this.p_arp_mod=[0,0,0,0,-.3162,.7454,.7454][s(6)],this.p_arp_speed=a(.5)+.4,this.p_duty=a(1),this.p_duty_ramp=s(2)==2?a(1):0,this.p_lpf_freq=[1,a(1)*a(1)][s(1)],this.p_lpf_ramp=I(-1,1),this.p_lpf_resonance=a(1),this.p_hpf_freq=s(3)==3?a(1):0,this.p_hpf_ramp=s(3)==3?a(1):0,this},d.prototype.tone=function(){return this.wave_type=B,this.p_base_freq=.35173364,this.p_env_attack=0,this.p_env_sustain=.6641,this.p_env_decay=0,this.p_env_punch=0,this},d.prototype.click=function(){const e=["explosion","hitHurt"][s(1)];return this[e](),s(1)&&(this.p_freq_ramp=-.5+a(1)),s(1)&&(this.p_env_sustain=(a(.4)+.2)*this.p_env_sustain,this.p_env_decay=(a(.4)+.2)*this.p_env_decay),s(3)==0&&(this.p_env_attack=a(.3)),this.p_base_freq=1-a(.25),this.p_hpf_freq=1-a(.1),this},d.prototype.random=function(){return this.wave_type=s(3),s(1)?this.p_base_freq=pe(a(2)-1)+.5:this.p_base_freq=F(a(1)),this.p_freq_limit=0,this.p_freq_ramp=Math.pow(a(2)-1,5),this.p_base_freq>.7&&this.p_freq_ramp>.2&&(this.p_freq_ramp=-this.p_freq_ramp),this.p_base_freq<.2&&this.p_freq_ramp<-.05&&(this.p_freq_ramp=-this.p_freq_ramp),this.p_freq_dramp=Math.pow(a(2)-1,3),this.p_duty=a(2)-1,this.p_duty_ramp=Math.pow(a(2)-1,3),this.p_vib_strength=Math.pow(a(2)-1,3),this.p_vib_speed=I(-1,1),this.p_env_attack=pe(I(-1,1)),this.p_env_sustain=F(I(-1,1)),this.p_env_decay=I(-1,1),this.p_env_punch=Math.pow(a(.8),2),this.p_env_attack+this.p_env_sustain+this.p_env_decay<.2&&(this.p_env_sustain+=.2+a(.3),this.p_env_decay+=.2+a(.3)),this.p_lpf_resonance=I(-1,1),this.p_lpf_freq=1-Math.pow(a(1),3),this.p_lpf_ramp=Math.pow(a(2)-1,3),this.p_lpf_freq<.1&&this.p_lpf_ramp<-.05&&(this.p_lpf_ramp=-this.p_lpf_ramp),this.p_hpf_freq=Math.pow(a(1),5),this.p_hpf_ramp=Math.pow(a(2)-1,5),this.p_pha_offset=Math.pow(a(2)-1,3),this.p_pha_ramp=Math.pow(a(2)-1,3),this.p_repeat_speed=a(2)-1,this.p_arp_speed=a(2)-1,this.p_arp_mod=a(2)-1,this},d.prototype.mutate=function(){return s(1)&&(this.p_base_freq+=a(.1)-.05),s(1)&&(this.p_freq_ramp+=a(.1)-.05),s(1)&&(this.p_freq_dramp+=a(.1)-.05),s(1)&&(this.p_duty+=a(.1)-.05),s(1)&&(this.p_duty_ramp+=a(.1)-.05),s(1)&&(this.p_vib_strength+=a(.1)-.05),s(1)&&(this.p_vib_speed+=a(.1)-.05),s(1)&&(this.p_vib_delay+=a(.1)-.05),s(1)&&(this.p_env_attack+=a(.1)-.05),s(1)&&(this.p_env_sustain+=a(.1)-.05),s(1)&&(this.p_env_decay+=a(.1)-.05),s(1)&&(this.p_env_punch+=a(.1)-.05),s(1)&&(this.p_lpf_resonance+=a(.1)-.05),s(1)&&(this.p_lpf_freq+=a(.1)-.05),s(1)&&(this.p_lpf_ramp+=a(.1)-.05),s(1)&&(this.p_hpf_freq+=a(.1)-.05),s(1)&&(this.p_hpf_ramp+=a(.1)-.05),s(1)&&(this.p_pha_offset+=a(.1)-.05),s(1)&&(this.p_pha_ramp+=a(.1)-.05),s(1)&&(this.p_repeat_speed+=a(.1)-.05),s(1)&&(this.p_arp_speed+=a(.1)-.05),s(1)&&(this.p_arp_mod+=a(.1)-.05),this};const T={};T.toBuffer=function(e){return new S(e).getRawBuffer().buffer},T.toWebAudio=function(e,i){var t=new S(e),n=ue(t.getRawBuffer().buffer,t.bitsPerChannel);if(i){for(var r=i.createBuffer(1,n.length,t.sampleRate),o=r.getChannelData(0),h=0;h<n.length;h++)o[h]=n[h];var p=i.createBufferSource();return p.buffer=r,p}},T.toWave=function(e){return new S(e).generate()},T.toAudio=function(e){return new S(e).generate().getAudio()},T.b58decode=function(e){var i=function(p,l){var u=[],f=[],v,b,q,M;for(v in p){if(b=0,q=l.indexOf(p[v]),q<0)return;for(q||f.length^v||f.push(0);b in u||q;)M=u[b],M=M?M*58+q:q,q=M>>8,u[b]=M%256,b++}for(;b--;)f.push(u[b]);return new Uint8Array(f)}(e,fe),t={};for(var n in V){var r=V[n],o=(n-1)*4+1;if(r=="wave_type")t[r]=i[0];else{var h=i[o]|i[o+1]<<8|i[o+2]<<16|i[o+3]<<24;t[r]=je(h)}}return t};function S(e){if(typeof e=="string"){var i=new d;e.indexOf("#")==0&&(e=e.slice(1)),e=i.fromB58(e)}this.init(e)}S.prototype.init=function(e){this.parameters=e,this.initForRepeat(),this.waveShape=parseInt(e.wave_type),this.fltw=Math.pow(e.p_lpf_freq,3)*.1,this.enableLowPassFilter=e.p_lpf_freq!=1,this.fltw_d=1+e.p_lpf_ramp*1e-4,this.fltdmp=5/(1+Math.pow(e.p_lpf_resonance,2)*20)*(.01+this.fltw),this.fltdmp>.8&&(this.fltdmp=.8),this.flthp=Math.pow(e.p_hpf_freq,2)*.1,this.flthp_d=1+e.p_hpf_ramp*3e-4,this.vibratoSpeed=Math.pow(e.p_vib_speed,2)*.01,this.vibratoAmplitude=e.p_vib_strength*.5,this.envelopeLength=[Math.floor(e.p_env_attack*e.p_env_attack*1e5),Math.floor(e.p_env_sustain*e.p_env_sustain*1e5),Math.floor(e.p_env_decay*e.p_env_decay*1e5)],this.envelopePunch=e.p_env_punch,this.flangerOffset=Math.pow(e.p_pha_offset,2)*1020,e.p_pha_offset<0&&(this.flangerOffset=-this.flangerOffset),this.flangerOffsetSlide=Math.pow(e.p_pha_ramp,2)*1,e.p_pha_ramp<0&&(this.flangerOffsetSlide=-this.flangerOffsetSlide),this.repeatTime=Math.floor(Math.pow(1-e.p_repeat_speed,2)*2e4+32),e.p_repeat_speed===0&&(this.repeatTime=0),this.gain=Math.exp(e.sound_vol)-1,this.sampleRate=e.sample_rate,this.bitsPerChannel=e.sample_size},S.prototype.initForRepeat=function(){var e=this.parameters;this.elapsedSinceRepeat=0,this.period=100/(e.p_base_freq*e.p_base_freq+.001),this.periodMax=100/(e.p_freq_limit*e.p_freq_limit+.001),this.enableFrequencyCutoff=e.p_freq_limit>0,this.periodMult=1-Math.pow(e.p_freq_ramp,3)*.01,this.periodMultSlide=-Math.pow(e.p_freq_dramp,3)*1e-6,this.dutyCycle=.5-e.p_duty*.5,this.dutyCycleSlide=-e.p_duty_ramp*5e-5,e.p_arp_mod>=0?this.arpeggioMultiplier=1-Math.pow(e.p_arp_mod,2)*.9:this.arpeggioMultiplier=1+Math.pow(e.p_arp_mod,2)*10,this.arpeggioTime=Math.floor(Math.pow(1-e.p_arp_speed,2)*2e4+32),e.p_arp_speed===1&&(this.arpeggioTime=0)},S.prototype.getRawBuffer=function(){for(var e=0,i=0,t=0,n=Array(32),r=0;r<32;++r)n[r]=L()*2-1;for(var o=0,h=0,p=0,l=0,u=0,f=Array(1024),r=0;r<1024;++r)f[r]=0;for(var v=0,b=[],q=0,M=0,ve=Math.floor(44100/this.sampleRate),ye=0;this.repeatTime!=0&&++this.elapsedSinceRepeat>=this.repeatTime&&this.initForRepeat(),this.arpeggioTime!=0&&ye>=this.arpeggioTime&&(this.arpeggioTime=0,this.period*=this.arpeggioMultiplier),this.periodMult+=this.periodMultSlide,this.period*=this.periodMult,!(this.period>this.periodMax&&(this.period=this.periodMax,this.enableFrequencyCutoff));++ye){var me=this.period;this.vibratoAmplitude>0&&(p+=this.vibratoSpeed,me=this.period*(1+Math.sin(p)*this.vibratoAmplitude));var C=Math.floor(me);if(C<D&&(C=D),this.dutyCycle+=this.dutyCycleSlide,this.dutyCycle<0&&(this.dutyCycle=0),this.dutyCycle>.5&&(this.dutyCycle=.5),++h>this.envelopeLength[o]&&(h=0,++o>2))break;var G,te=h/this.envelopeLength[o];o===0?G=te:o===1?G=1+(1-te)*2*this.envelopePunch:G=1-te,this.flangerOffset+=this.flangerOffsetSlide;var ie=Math.abs(Math.floor(this.flangerOffset));ie>1023&&(ie=1023),this.flthp_d!=0&&(this.flthp*=this.flthp_d,this.flthp<1e-5&&(this.flthp=1e-5),this.flthp>.1&&(this.flthp=.1));for(var _=0,ge=0;ge<D;++ge){var k=0;if(l++,l>=C&&(l%=C,this.waveShape===U))for(var r=0;r<32;++r)n[r]=L()*2-1;var P=l/C;if(this.waveShape===R)P<this.dutyCycle?k=.5:k=-.5;else if(this.waveShape===z)P<this.dutyCycle?k=-1+2*P/this.dutyCycle:k=1-2*(P-this.dutyCycle)/(1-this.dutyCycle);else if(this.waveShape===B)k=Math.sin(P*2*Math.PI);else if(this.waveShape===U)k=n[Math.floor(l*32/C)];else throw"ERROR: Bad wave type: "+this.waveShape;var lt=e;this.fltw*=this.fltw_d,this.fltw<0&&(this.fltw=0),this.fltw>.1&&(this.fltw=.1),this.enableLowPassFilter?(i+=(k-e)*this.fltw,i-=i*this.fltdmp):(e=k,i=0),e+=i,t+=e-lt,t-=t*this.flthp,k=t,f[u&1023]=k,k+=f[u-ie+1024&1023],u=u+1&1023,_+=k*G}if(q+=_,++M>=ve)M=0,_=q/ve,q=0;else continue;_=_/D*Fe,_*=this.gain,this.bitsPerChannel===8?(_=Math.floor((_+1)*128),_>255?(_=255,++v):_<0&&(_=0,++v),b.push(_)):(_=Math.floor(_*(1<<15)),_>=1<<15?(_=(1<<15)-1,++v):_<-(1<<15)&&(_=-(1<<15),++v),b.push(_&255),b.push(_>>8&255))}return{buffer:b,clipped:v}},S.prototype.generate=function(){var e=this.getRawBuffer(),i=ue(e.buffer,this.bitsPerChannel);return{sampleRate:this.sampleRate,bitsPerChannel:this.bitsPerChannel,buffer:i,clipped:e.clipped}};var ue=function(e,i){for(var t=new Float32Array(e.length),n=0;n<e.length;n++)t[n]=2*e[n]/Qe(2,i)-1;return t};class Je{constructor(i=null){$(this,"x");$(this,"y");$(this,"z");$(this,"w");this.setSeed(i)}get(i=1,t){return t==null&&(t=i,i=0),this.next()/4294967295*(t-i)+i}getInt(i,t){t==null&&(t=i,i=0);const n=Math.floor(i),r=Math.floor(t);return r===n?n:this.next()%(r-n)+n}getPlusOrMinus(){return this.getInt(2)*2-1}select(i){return i[this.getInt(i.length)]}setSeed(i,t=123456789,n=362436069,r=521288629,o=32){this.w=i!=null?i>>>0:Math.floor(Math.random()*4294967295)>>>0,this.x=t>>>0,this.y=n>>>0,this.z=r>>>0;for(let h=0;h<o;h++)this.next();return this}getState(){return{x:this.x,y:this.y,z:this.z,w:this.w}}next(){const i=this.x^this.x<<11;return this.x=this.y,this.y=this.z,this.z=this.w,this.w=(this.w^this.w>>>19^(i^i>>>8))>>>0,this.w}}const _e=new Je;function Ge(e,i){let t=[];for(let n=0;n<e;n++)t.push(i(n));return t}const We={coin:"pickupCoin",laser:"laserShoot",explosion:"explosion",powerUp:"powerUp",hit:"hitHurt",jump:"jump",select:"blipSelect",synth:"synth",tone:"tone",click:"click",random:"random"};let Y;function Xe(){Y=[],De(()=>_e.get())}function Ye(e){et(e)}function He(){const e=x.currentTime;Y.forEach(i=>{tt(i,e)})}function Ke(e,i,t=2,n=.1,r=void 0,o=1,h=1){const p=Ge(t,u=>{_e.setSeed(i+u*1063);let f=new d;return f[We[e]](),r!=null&&(f.p_base_freq=r),f.p_env_attack*=o,f.p_env_sustain*=h,f}),l=ce({type:e,params:p,volume:n});return Y.push(l),l}function Ze(e,i){e.gainNode.gain.value=i}function et(e){e.isPlaying=!0}function tt(e,i){if(!e.isPlaying)return;e.isPlaying=!1;const t=X(i);(e.playedTime==null||t>e.playedTime)&&(H(e,t),e.playedTime=t)}function H(e,i,t=void 0){e.bufferSourceNodes=[],e.buffers.forEach(n=>{const r=x.createBufferSource();if(r.buffer=n,t!=null&&r.playbackRate!=null){const o=Math.pow(2,1/12);r.playbackRate.value=Math.pow(o,t)}r.start=r.start||r.noteOn,r.connect(e.gainNode),r.start(i),e.bufferSourceNodes.push(r)})}function K(e,i=void 0){e.bufferSourceNodes!=null&&(e.bufferSourceNodes.forEach(t=>{i==null?t.stop():t.stop(i)}),e.bufferSourceNodes=void 0)}function ce(e){const i=e.type,t=e.params,n=e.volume,r=t.map(h=>{const p=new S(h).generate();if(p.buffer.length===0)return x.createBuffer(1,1,p.sampleRate);const l=x.createBuffer(1,p.buffer.length,p.sampleRate);var u=l.getChannelData(0);return u.set(p.buffer),l}),o=x.createGain();return o.gain.value=n,o.connect(x.destination),{type:i,params:t,volume:n,buffers:r,bufferSource:void 0,gainNode:o,isPlaying:!1,playedTime:void 0}}function it(e,i,t,n,r){return{mml:e,sequence:i,soundEffect:t,isDrum:n,noteIndex:0,endStep:-1,visualizer:r}}function nt(e,i){return{mml:e.mml,sequence:i(e.mml,A),soundEffect:ce(e.soundEffect),isDrum:e.isDrum,noteIndex:0,endStep:-1}}let j,A,E,Z,O,ee=!1;function at(e,i){j=e,A=i,E=0,Z=W/2,O=X(x.currentTime)-Z,j.forEach(t=>{t.noteIndex=0}),ee=!0}function rt(){ee=!1,j.forEach(e=>{K(e.soundEffect)})}function st(){if(!ee)return;const e=x.currentTime;e<O||(O+=Z,O<e&&(O=X(e)),j.forEach(i=>{ot(i,O)}),E++,E>=A&&(E=0))}function ot(e,i){const t=e.sequence.notes[e.noteIndex];t!=null&&((e.soundEffect.type==="synth"||e.soundEffect.type==="tone")&&e.endStep===E&&K(e.soundEffect,i),t.quantizedStartStep===E&&((e.soundEffect.type==="synth"||e.soundEffect.type==="tone")&&K(e.soundEffect),e.isDrum?H(e.soundEffect,i):H(e.soundEffect,i,t.pitch-69),e.visualizer!=null&&e.visualizer.redraw(t),e.endStep=t.quantizedEndStep,e.endStep>=A&&(e.endStep-=A),e.noteIndex++,e.noteIndex>=e.sequence.notes.length&&(e.noteIndex=0)))}const le=.125;let de,J;function ht(e,i=.1){const t=e.parts.map(n=>{const r=nt(n,ct);return Ze(r.soundEffect,r.soundEffect.volume*i/.2),it(r.mml,r.sequence,r.soundEffect,r.isDrum)});at(t,e.notesStepsCount)}function pt(){rt()}function ft(e,i=void 0,t=2,n=.1,r=void 0){const o=`${e}_${i}_${t}_${n}_${r}`;J[o]==null&&(J[o]=Ke(e,i==null?de:i,t,n,r)),Ye(J[o])}function ut(){st(),He()}function _t(e=1,i=void 0){de=e,$e(i),Xe(),J={}}function ct(e,i){const t=[],n=new Pe(e);for(let r of n)if(r.type==="note"){let o=Math.floor(r.time+r.duration/le);o>=i&&(o-=i),t.push({pitch:r.noteNumber,quantizedStartStep:Math.floor(r.time/le),endStep:o})}return{notes:t}}c.init=_t,c.playMml=ht,c.playSoundEffect=ft,c.setQuantize=he,c.setTempo=oe,c.startAudio=Be,c.stopMml=pt,c.update=ut,Object.defineProperty(c,"__esModule",{value:!0}),c[Symbol.toStringTag]="Module"});
