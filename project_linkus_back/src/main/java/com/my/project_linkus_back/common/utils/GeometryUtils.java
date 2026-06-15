package com.my.project_linkus_back.common.utils;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

public class GeometryUtils {
    // 4326은 전 세계 GPS에서 사용하는 표준 좌표계(WGS84) 코드입니다.
    private static final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    public static Point createPoint(double longitude, double latitude) {
        // 주의: JTS Point 역시 내부적으로 (X, Y) 순서이므로 (경도, 위도)로 넣어야 합니다.
        return geometryFactory.createPoint(new Coordinate(longitude, latitude));
    }
}