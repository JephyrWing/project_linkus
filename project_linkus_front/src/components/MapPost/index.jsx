import { Map, MapMarker } from "react-kakao-maps-sdk";
import { useKakaoLoader } from "react-kakao-maps-sdk";
import React from "react";
export default function MapPost() {
  useKakaoLoader();
  return (
    <>
      <Map // 지도를 표시할 Container
        id="map"
        center={{
          // 지도의 중심좌표
          lat: 37.2772455336538,
          lng: 127.028007118842,
        }}
        style={{
          // 지도의 크기
          marginLeft: "auto",
          marginRight: "auto",
          width: "1200px",
          height: "700px",
        }}
        level={3} // 지도의 확대 레벨
      >
        <MapMarker // 마커를 생성합니다
          position={{
            // 마커가 표시될 위치입니다
            lat: 37.2772455336538,
            lng: 127.028007118842,
          }}
        />
      </Map>
    </>
  );
}
