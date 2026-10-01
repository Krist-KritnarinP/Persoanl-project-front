import {
  FiArrowRight, FiBell, FiCheck, FiCloudRain, FiCoffee, FiCompass,
  FiEdit3, FiEye, FiLink, FiLock, FiMapPin, FiMessageCircle, FiMoon,
  FiPlus, FiSun, FiZap,
} from "react-icons/fi";
import { QRCodeSVG } from "qrcode.react";
import { featureCopy } from "./featureCopy";
import "./feature-gallery.css";

function Icon({ icon: Glyph, x, y, size = 20, tone = "ink" }) {
  return <Glyph x={x} y={y} width={size} height={size} className={`lp-diagram__${tone}`} />;
}
function Label({ x, y, children, anchor = "start", small = false, muted = false }) {
  return <text x={x} y={y} textAnchor={anchor} className={`${small ? "lp-diagram__small" : "lp-diagram__label"} ${muted ? "lp-diagram__muted" : ""}`}>{children}</text>;
}
function Paper({ x, y, width, height, tint = false }) {
  return <rect x={x} y={y} width={width} height={height} rx="12" className={tint ? "lp-diagram__tint" : "lp-diagram__paper"} />;
}
function Avatar({ x, y, tone = "green" }) {
  return <g transform={`translate(${x} ${y})`}>
    <circle r="20" className={`lp-diagram__avatar lp-diagram__avatar--${tone}`} />
    <circle cy="-5" r="5" fill="currentColor" opacity=".8" />
    <path d="M-10 11c0-12 20-12 20 0" fill="currentColor" opacity=".65" />
  </g>;
}
function Diagram({ kind, c }) {
  return <svg viewBox="0 0 360 205" fill="none" className="lp-diagram" aria-hidden="true" focusable="false">
    {kind === "plan" && <>
      <Paper x={28} y={10} width={304} height={43} />
      <Icon icon={FiZap} x={43} y={22} tone="accent" />
      <Label x={72} y={37}>{c.draft}</Label>
      <Icon icon={FiArrowRight} x={174} y={23} size={17} />
      <Icon icon={FiEdit3} x={216} y={23} size={17} />
      <Label x={242} y={37} small>{c.edit}</Label>
      {[0,1,2].map(i=><g key={i}>
        <Paper x={28+i*104} y={67} width={96} height={120} tint={i===1} />
        <Label x={42+i*104} y={93} small>{c.day} {i+1}</Label>
        {[0,1,2].map(j=><g key={j}>
          <circle cx={44+i*104} cy={111+j*24} r="3" className="lp-diagram__dot" />
          <path d={`M55 ${111+j*24}h${j===1?40:48}`} transform={`translate(${i*104} 0)`} className="lp-diagram__line" />
        </g>)}
      </g>)}
      <Icon icon={FiCheck} x={285} y={164} size={15} tone="brand" />
    </>}
    {kind === "map" && <>
      <Paper x={20} y={12} width={320} height={177} tint />
      <path d="M22 60h314M22 116h314M75 14v174M170 14v174M265 14v174" className="lp-diagram__map-grid" />
      <path d="M46 143C90 110 99 48 141 72s25 89 97 53S270 52 310 35" className="lp-diagram__route" />
      <Icon icon={FiMapPin} x={39} y={123} size={27} tone="accent" />
      <Icon icon={FiMapPin} x={130} y={47} size={27} tone="brand" />
      <Icon icon={FiMapPin} x={300} y={19} size={27} tone="accent" />
      <Paper x={49} y={147} width={140} height={34} />
      <Label x={63} y={169} small>Google Maps</Label><Icon icon={FiArrowRight} x={161} y={156} size={15} />
      <g transform="translate(258 121)"><rect x="-7" y="-7" width="72" height="72" rx="9" fill="#fff" /><QRCodeSVG value="https://www.google.com/maps" size={58} fgColor="#24483b" /></g>
    </>}
    {kind === "nearby" && <>
      <circle cx="119" cy="100" r="79" className="lp-diagram__tint" />
      <circle cx="119" cy="100" r="53" className="lp-diagram__orbit" />
      <circle cx="119" cy="100" r="28" className="lp-diagram__orbit" />
      <Icon icon={FiMapPin} x={105} y={83} size={28} tone="brand" />
      <Paper x={59} y={29} width={38} height={38} /><Icon icon={FiCoffee} x={69} y={38} size={20} tone="accent" />
      <Paper x={151} y={108} width={38} height={38} /><Icon icon={FiCompass} x={160} y={117} size={20} tone="brand" />
      <Label x={119} y={199} anchor="middle" small>1–5 km</Label>
      <Paper x={221} y={44} width={123} height={54} /><Icon icon={FiCoffee} x={233} y={55} size={16} /><Label x={255} y={69} small>{c.coffee}</Label><Icon icon={FiPlus} x={317} y={75} size={14} tone="brand" />
      <Paper x={221} y={110} width={123} height={54} /><Icon icon={FiCompass} x={233} y={122} size={16} /><Label x={255} y={136} small>{c.view}</Label><Icon icon={FiPlus} x={317} y={140} size={14} tone="brand" />
      <path d="M193 91h19m-6-5 6 5-6 5" className="lp-diagram__route" />
    </>}
    {kind === "team" && <>
      <path d="M76 113 180 47l104 66M76 113h208" className="lp-diagram__orbit" />
      <Avatar x={180} y={43} /><Avatar x={74} y={111} tone="sand" /><Avatar x={286} y={111} tone="rose" />
      <Label x={180} y={79} anchor="middle" small>{c.owner}</Label>
      <Label x={74} y={151} anchor="middle" small>{c.editor}</Label>
      <Label x={286} y={151} anchor="middle" small>{c.viewer}</Label>
      <Paper x={114} y={162} width={132} height={33} /><Icon icon={FiPlus} x={128} y={171} size={16} /><Label x={153} y={183} small>{c.invite}</Label>
      <g transform="rotate(8 278 44)"><Paper x={259} y={21} width={59} height={46} /><Icon icon={FiBell} x={277} y={36} size={20} /><circle cx="304" cy="26" r="9" className="lp-diagram__notification" /><text x="304" y="30" textAnchor="middle" fill="white" fontSize="11">2</text></g>
    </>}
    {kind === "chat" && <>
      <Avatar x={37} y={45} tone="sand" /><Paper x={69} y={20} width={167} height={47} /><Label x={85} y={50}>{c.message}</Label>
      <Paper x={116} y={79} width={221} height={95} tint />
      <path d="m130 149 50-50 43 60 47-46 53 27" className="lp-diagram__route" /><Icon icon={FiMapPin} x={210} y={99} size={30} tone="accent" />
      <Paper x={233} y={143} width={94} height={29} /><Label x={280} y={163} anchor="middle" small>{c.duration}</Label>
      <Icon icon={FiLock} x={124} y={183} size={14} tone="brand" /><Label x={146} y={195} small>{c.consent}</Label>
      <circle cx="57" cy="151" r="25" className="lp-diagram__tint" /><Icon icon={FiMessageCircle} x={45} y={139} size={24} tone="brand" />
    </>}
    {kind === "bills" && <>
      <Paper x={24} y={17} width={149} height={172} />
      <Label x={42} y={44}>{c.bill}</Label><path d="M42 59h112M42 79h56m25 0h31M42 95h43m38 0h31M42 111h56m25 0h31" className="lp-diagram__line" />
      <path d="M42 127h112" className="lp-diagram__orbit" />
      <Label x={42} y={165}>฿900</Label>
      <path d="M183 101h24m-6-5 6 5-6 5" className="lp-diagram__route" />
      {[0,1,2].map((n)=><g key={n}><Avatar x={243} y={44+n*61} tone={['green','sand','rose'][n]} /><Label x={273} y={49+n*61}>฿300</Label><Icon icon={FiCheck} x={324} y={39+n*61} size={15} tone="brand" /></g>)}
    </>}
    {kind === "weather" && <>
      <Paper x={24} y={17} width={312} height={104} />
      {[FiSun,FiSun,FiCloudRain].map((Glyph,i)=><g key={i}><Icon icon={Glyph} x={60+i*104} y={35} size={34} tone={i===2?'brand':'ochre'} /><Label x={77+i*104} y={93} anchor="middle">{[28,26,22][i]} °C</Label></g>)}
      <Paper x={24} y={135} width={148} height={50} tint /><Icon icon={FiEdit3} x={38} y={151} size={20} /><Label x={66} y={166} small>{c.manual}</Label>
      <Paper x={184} y={135} width={152} height={50} /><Icon icon={FiZap} x={198} y={151} size={20} tone="accent" /><Label x={225} y={166} small>{c.forecast}</Label>
    </>}
    {kind === "overview" && <>
      <Paper x={20} y={16} width={174} height={173} />
      <Label x={37} y={43}>{c.calendar}</Label>
      {Array.from({length:28},(_,i)=><rect key={i} x={36+(i%7)*21} y={60+Math.floor(i/7)*27} width="15" height="19" rx="4" className={[8,9,10,18,19].includes(i)?'lp-diagram__marked':'lp-diagram__cell'} />)}
      <Paper x={209} y={16} width={131} height={92} tint /><path d="m222 85 23-45 38 45 28-53 19 20" className="lp-diagram__route" /><Icon icon={FiMapPin} x={268} y={51} size={25} tone="brand" />
      <Label x={212} y={136} small>{c.budget}</Label>
      {[44,28,51,37].map((h,i)=><rect key={i} x={215+i*31} y={191-h} width="19" height={h} rx="4" className={i%2?'lp-diagram__marked':'lp-diagram__cell'} />)}
    </>}
    {kind === "share" && <>
      <Paper x={24} y={27} width={178} height={113} /><Icon icon={FiLink} x={40} y={42} size={19} tone="brand" /><Label x={69} y={57}>{c.link}</Label>
      <path d="M43 76h126M43 92h76M43 108h106" className="lp-diagram__line" />
      <path d="M212 83h24m-6-5 6 5-6 5" className="lp-diagram__route" />
      <Paper x={247} y={16} width={89} height={139} tint /><path d="M279 29h24" className="lp-diagram__line" /><Icon icon={FiEye} x={275} y={59} size={33} tone="brand" /><Label x={291} y={120} small anchor="middle">{c.readonly}</Label>
      {['TH','EN','中文','한국어'].map((l,i)=><g key={l}><Paper x={26+i*64} y={165} width={56} height={29} /><Label x={54+i*64} y={184} small anchor="middle">{l}</Label></g>)}
      <Icon icon={FiSun} x={290} y={171} size={16} tone="ochre" /><Icon icon={FiMoon} x={316} y={171} size={16} tone="brand" />
    </>}
  </svg>;
}

export default function FeatureGallery({ lang }) {
  const c = featureCopy[lang] || featureCopy.th;
  return <>
    <div className="lp-infographic-grid">
      {c.features.map((feature, index)=><figure key={feature.id} className={`lp-infographic lp-infographic--${feature.id}`} data-feature={feature.id} aria-labelledby={`feature-${feature.id}`}>
        <div className="lp-infographic-art"><span className="lp-infographic-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><Diagram kind={feature.id} c={c} /></div>
        <figcaption><h3 id={`feature-${feature.id}`}>{feature.title}</h3><p>{feature.description}</p></figcaption>
      </figure>)}
    </div>
    <div className="lp-gallery-footnotes"><span><FiZap aria-hidden="true" />{c.aiNote}</span><span><FiMapPin aria-hidden="true" />{c.nearbyNote}</span></div>
    <p className="lp-gallery-preferences"><FiSun aria-hidden="true" /><FiMoon aria-hidden="true" />{c.preferences}</p>
  </>;
}
