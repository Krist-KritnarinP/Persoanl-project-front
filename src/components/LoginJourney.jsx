import TravelingDog from "./TravelingDog";

export default function LoginJourney() {
  return (
    <div className="login-journey" aria-hidden="true">
      <svg className="login-journey__landscape" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" fill="none" focusable="false">
        <circle cx="325" cy="280" r="108" className="login-journey__sun" />
        <g className="login-journey__clouds" fill="currentColor">
          <path d="M80 245c-40 0-40-42-8-45 5-48 76-51 87-11 38-9 58 52 17 56Z" />
          <path d="M760 160c-30 0-31-31-7-35 9-35 58-34 65-7 31-4 38 42 9 42Z" />
          <path d="M1120 318c-45 0-43-42-12-48 12-46 74-45 84-8 39-8 53 54 11 56Z" />
        </g>
        <path d="M-100 780 210 399l137 162 117-107 210 266 149-176 261 213 178-274 278 297Z" className="login-journey__mountains" />
        <path d="m163 459 47-60 71 84-45-13-24 17-24-33Zm254 38 47-43 57 73-38-15-20 9Z" fill="var(--color-base-100)" opacity=".8" />
        <path d="M-100 762C186 570 328 694 565 678S936 562 1530 756V960H-100Z" className="login-journey__hills" />
        <path d="M-90 868C201 666 482 887 803 765s519-60 727 50v145H-90Z" className="login-journey__foreground" />
        <path d="M-20 841c262-145 465 85 726-35s534-67 774 8" stroke="var(--color-base-100)" strokeWidth="42" strokeLinecap="round" opacity=".6" />
        <path d="M-20 841c262-145 465 85 726-35s534-67 774 8" stroke="currentColor" strokeWidth="2" strokeDasharray="4 12" opacity=".22" />
        <g className="login-journey__trees" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M88 727v69m-20-28 20-9 20 9m-16-23-4-30-28 48h56l-28-48" />
          <path d="M1280 746v69m-20-28 20-9 20 9m-16-23-4-30-28 48h56l-28-48" />
          <path d="M1124 723v49m-19-15h38l-19-36-19 36" />
        </g>
      </svg>
      <div className="login-journey__walkway">
        <div className="login-journey__traveler"><TravelingDog scenery={false} /></div>
      </div>
    </div>
  );
}
