// Họa tiết nền. Mỗi nhóm có class riêng để CSS bật/tắt theo theme:
//   .deco-logo   -> 6 mảnh hình thoi lấy từ logo BK (mọi theme trừ "Phật pháp")
//   .deco-dharma -> bánh xe Pháp luân + hoa sen (chỉ theme "Phật pháp")

const FACES = [
  { pts: '302,175 605,0 605,348 302,522', light: false },
  { pts: '605,0 906,175 906,522 605,348', light: true },
  { pts: '0,696 302,522 302,870 0,1043', light: true },
  { pts: '0,1043 302,870 605,1045 302,1219', light: false },
  { pts: '906,522 1207,698 1207,1045 906,870', light: false },
  { pts: '605,1045 906,870 1207,1045 906,1219', light: true }
];

export function LogoShapes({ className = '', swap = false }) {
  return (
    <svg className={`deco-logo ${className}`} aria-hidden="true" viewBox="0 0 1207 1220">
      {FACES.map((f) => (
        <polygon key={f.pts} points={f.pts} className={f.light !== swap ? 'fill-s' : 'fill-p'} />
      ))}
    </svg>
  );
}

const SPOKES = [0, 45, 90, 135, 180, 225, 270, 315];

export function Wheel({ className = '' }) {
  return (
    <svg className={`deco-dharma ${className}`} aria-hidden="true" viewBox="0 0 200 200">
      <g fill="none" className="stroke-s" strokeWidth="3">
        <circle cx="100" cy="100" r="94" />
        <circle cx="100" cy="100" r="80" />
        <circle cx="100" cy="100" r="24" />
        <circle cx="100" cy="100" r="10" />
        <g strokeWidth="5" strokeLinecap="round">
          {SPOKES.map((a) => (
            <line key={a} x1="100" y1="76" x2="100" y2="22" transform={`rotate(${a} 100 100)`} />
          ))}
        </g>
      </g>
      <g className="fill-s">
        {SPOKES.map((a) => (
          <circle key={a} cx="100" cy="13" r="4" transform={`rotate(${a} 100 100)`} />
        ))}
      </g>
    </svg>
  );
}

const PETAL = 'M150 172 C120 132 120 62 150 12 C180 62 180 132 150 172Z';
const petal = (angle, scale) => `translate(150 172) rotate(${angle}) scale(${scale}) translate(-150 -172)`;

export function Lotus({ className = '' }) {
  return (
    <svg className={`deco-dharma ${className}`} aria-hidden="true" viewBox="0 0 300 190">
      <ellipse cx="150" cy="178" rx="140" ry="9" className="fill-p" opacity=".7" />
      <g stroke="#fff" strokeOpacity=".7" strokeWidth="1.5">
        <path d={PETAL} transform={petal(-64, 0.78)} fill="#ff9ec2" fillOpacity=".55" />
        <path d={PETAL} transform={petal(64, 0.78)} fill="#ff9ec2" fillOpacity=".55" />
        <path d={PETAL} transform={petal(-34, 0.92)} fill="#ffb3cf" fillOpacity=".7" />
        <path d={PETAL} transform={petal(34, 0.92)} fill="#ffb3cf" fillOpacity=".7" />
        <path d={PETAL} fill="#ffd0e2" fillOpacity=".9" />
      </g>
    </svg>
  );
}

export default function Backdrop() {
  return (
    <>
      <LogoShapes className="deco deco--a" />
      <LogoShapes className="deco deco--b" swap />
      <LogoShapes className="deco deco--c" />
      <Wheel className="deco deco--wheel-a spin" />
      <Lotus className="deco deco--lotus-b" />
      <Wheel className="deco deco--wheel-c spin" />
    </>
  );
}
