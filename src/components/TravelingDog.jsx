import "./TravelingDog.css";

/** The shared traveling dog, with optional scenery. Decorative only. */
export default function TravelingDog({ scenery = true }) {
  return (
        <svg className="traveling-dog" viewBox={scenery ? "0 0 360 250" : "75 60 205 155"} fill="none" focusable="false" aria-hidden="true">
          {scenery && <>
          <circle cx="180" cy="126" r="108" fill="currentColor" opacity=".055" />
          <circle cx="272" cy="57" r="18" fill="#efbd6b" opacity=".8" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".22">
            <path d="m40 173 43-48 32 34 46-66 50 66 37-40 69 54" />
            <path d="m144 118 17 7 11-16M72 137l11 7 9-9" />
          </g>
          <g className="journey-loading__cloud" fill="currentColor" opacity=".1">
            <path d="M64 76c-12 0-12-16 0-16 2-16 27-16 29 0 15-4 21 16 6 16Z" />
            <path d="M223 96c-10 0-10-12 0-13 3-14 22-14 25-1 14-2 16 14 4 14Z" />
          </g>
          <path d="M46 208h268" stroke="currentColor" strokeWidth="2" opacity=".15" strokeLinecap="round" />
          <path className="journey-loading__trail" d="M70 224h220" stroke="currentColor" strokeWidth="3" strokeDasharray="3 16" strokeLinecap="round" opacity=".28" />
          <ellipse className="journey-loading__shadow" cx="177" cy="205" rx="64" ry="7" fill="currentColor" opacity=".09" />
          </>}
          <g className="journey-loading__dog" stroke="#704b34" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            <g className="journey-loading__tail">
              <path d="M119 159c-30-2-39-20-28-31 8-8 17 0 13 7-4 8 8 10 19 10" fill="#d79958" />
              <path d="M91 128c8-8 17 0 13 7" stroke="#fff1d6" strokeWidth="8" />
            </g>
            <g className="journey-loading__leg journey-loading__leg--back" fill="#b87a44">
              <path d="M138 170v26c-9 0-12 9-4 9h16l6-34Z" />
              <path d="M192 170v26c-8 0-10 9-3 9h16l5-35Z" />
            </g>
            <path d="M113 146c5-15 32-18 56-14l37 7 11 28c-10 17-77 21-95 4-7-6-11-14-9-25Z" fill="#e6ab68" />
            <path d="M166 176c17 4 38-1 44-11l-8-15-22 6Z" fill="#fff1d6" stroke="none" />
            <g className="journey-loading__leg journey-loading__leg--front" fill="#e6ab68">
              <path d="m124 164 3 32c-8 1-10 9-2 9h16l5-31" />
              <path d="m186 168 4 28c-8 1-10 9-2 9h16l6-38" />
              <path d="M125 199h15M188 199h15" stroke="#fff1d6" strokeWidth="7" />
            </g>
            <path d="m198 145 13-4 8 18-17 5Z" fill="#d96954" />
            <path d="m193 105 1-34c1-6 7-7 11-1l17 29m-2 6 21-30c4-5 9-3 8 4l-2 40" fill="#e6ab68" />
            <path d="m199 96 1-16 11 17m22 3 10-15-1 20" stroke="#d58d76" strokeWidth="5" />
            <path d="M186 117c0-26 49-34 61-5l7 12c18-1 23 10 16 20-8 12-42 17-63 9-15-6-21-20-21-36Z" fill="#e6ab68" />
            <path d="M228 103c-2 17-2 27-14 33-1 19 36 20 54 7 8-8 0-18-14-19l-8-13Z" fill="#fff1d6" stroke="none" />
            <path d="M252 127c4-4 14-3 15 1 0 5-8 8-11 5Z" fill="#49372e" stroke="none" />
            <path d="M236 118q5-6 9 0m-6 24q8 5 14-1" stroke="#49372e" />
            <ellipse cx="224" cy="132" rx="6" ry="3" fill="#df9577" stroke="none" />
            <g className="journey-loading__pack">
              <path d="M148 124v-8c0-8 13-8 13 0v7" stroke="#357969" strokeWidth="4" />
              <rect x="129" y="119" width="45" height="47" rx="12" fill="#448e78" />
              <path d="M133 123h37v13c-8 7-28 7-37 0Z" fill="#65ab90" />
              <rect x="140" y="146" width="23" height="15" rx="5" fill="#357969" />
              <path d="M152 135v9" stroke="#ffe1a4" strokeWidth="5" />
              <rect x="125" y="110" width="52" height="12" rx="6" fill="#efd5a0" />
              <path d="M137 110v12m28-12v12" stroke="#b58c57" />
            </g>
          </g>
          {scenery && <g transform="translate(292 158)" stroke="currentColor" strokeWidth="2" opacity=".6">
            <path d="M0 0v47" strokeLinecap="round" />
            <path d="M0 0h23l8 8-8 8H0Z" fill="var(--color-base-100)" />
            <path d="M8 8h12m-4-4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </g>}
        </svg>
  );
}
