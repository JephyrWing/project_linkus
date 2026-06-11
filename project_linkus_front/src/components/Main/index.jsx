import MapPost from "../MapPost";
import "./main.css";

function Main() {
  return (
    <div>
      <MapPost />
    </div>
  );
}
export default Main;

// import React, { useEffect, useRef } from "react";
// import "./main.css";

// function Main() {
//   const mapRef = useRef(null);

//   useEffect(() => {
//     const script = document.createElement("script");

//     script.src =
//       "//dapi.kakao.com/v2/maps/sdk.js?appkey=fd4857cf577b47641a96729b10b82de3&autoload=false";
//     script.async = true;

//     script.onload = () => {
//       window.kakao.maps.load(() => {
//         const container = mapRef.current;

//         const options = {
//           center: new window.kakao.maps.LatLng(33.450701, 126.570667),
//           level: 3,
//         };

//         const map = new window.kakao.maps.Map(container, options);

//         const markerPosition = new window.kakao.maps.LatLng(
//           33.450701,
//           126.570667
//         );

//         const marker = new window.kakao.maps.Marker({
//           position: markerPosition,
//         });

//         marker.setMap(map);
//       });
//     };

//     document.head.appendChild(script);
//   }, []);

//   return (
//     <div className="main">
//       <div ref={mapRef} className="map" />
//     </div>
//   );
// }

// export default Main;