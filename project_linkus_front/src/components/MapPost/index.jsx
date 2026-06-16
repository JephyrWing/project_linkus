import { Map } from "react-kakao-maps-sdk";
import useKakaoLoader from "../../utils/Kakao/UseKakaoLoader";
import React, { useEffect, useState } from "react";
import LiveChat from "../LiveChat";
import "./mappost.css";

export default function MapPost() {
  useKakaoLoader();

  const defaultPosition = {
    lat: 37.2772455336538,
    lng: 127.028007118842,
  };

  const [mapCenter, setMapCenter] = useState(defaultPosition);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setMapCenter(currentPosition);
      },
      (err) => {
        console.log("현재 위치 실패, 기본값 사용", err);
      }
    );
  }, []);

  return (
    <div className="map-wrapper">
      <Map
        id="map"
        center={mapCenter}
        style={{
          width: "1200px",
          height: "700px",
        }}
        level={3}
      />

      {/* mappost에서만 보이는 실시간 채팅창 */}
      <LiveChat />
    </div>
  );
}