var vung;
var duong;
var diem;
$(document).ready(function() {
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');
    var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */({
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250
        }
    }));
    closer.onclick = function () {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };
    var format = 'image/png';
    var bounds = [535969.875,2514978.5,537084.125,2515875.5];
    var vung = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/dc3/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.0',
                STYLES: '',
                LAYERS: 'dc3:thuadat',
            }
        })
    });

    var duong = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/dc3/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.0',
                STYLES: '',
                LAYERS: 'dc3:rgtd',
            }
        })
    });

    var diem = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/dc3/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.0',
                STYLES: '',
                LAYERS: 'dc3:xudong',
            }
        })
    });

    var projection = new ol.proj.Projection({
        code: 'EPSG:3405',
        units: 'm',
        axisOrientation: 'neu'
    });
    var view = new ol.View({
        projection: projection
    });
    var map = new ol.Map({
        target: 'map',
        layers: [vung, duong, diem],
        overlays: [overlay],
        view: view
    });
    var styles = {
        'MultiPolygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 3
            })
        })
    };
    var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };
    var vectorLayer = new ol.layer.Vector({
        style: styleFunction
    });
    map.addLayer(vectorLayer);
    map.getView().fit(bounds, map.getSize());
    $("#chkvung").change(function () {
        if($("#chkvung").is(":checked"))
        {
            vung.setVisible(true);
        }
        else
        {
            vung.setVisible(false);
        }
    });
    $("#chkduong").change(function () {
        if($("#chkduong").is(":checked"))
        {
            duong.setVisible(true);
        }
        else
        {
            duong.setVisible(false);
        }
    });
    $("#chkdiem").change(function () {
        if($("#chkdiem").is(":checked"))
        {
            diem.setVisible(true);
        }
        else
        {
            diem.setVisible(false);
        }
    });
map.on('singleclick', function (evt) {
    document.getElementById('info').innerHTML = "Loading... please wait...";
    var view = map.getView();
    var viewResolution = view.getResolution();
    var source = vung.getSource();
    var url = source.getFeatureInfoUrl  (
        evt.coordinate, viewResolution, view.getProjection(),
        { 'INFO_FORMAT': 'application/json', 'FEATURE_COUNT': 50 }
    );
    if (url) {
        $.ajax({
            type: "POST",
            url: url,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function (n) {
                var content = "<table>";
                for (var i = 0; i < n.features.length; i++) {
                    var feature = n.features[i];
                    var featureAttr = feature.properties;
                    content += "</td><td>xudong\n" + featureAttr["xudong"]
                        + "</td><td>thuadat:\n" + featureAttr["thuadat"]
                        + "</td></tr>";
                }
                content += "</table>";
                $("#info").html(content);
                $("#popup-content").html(content);
                overlay.setPosition(evt.coordinate);
                var vectorSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(n)
                });
                vectorLayer.setSource(vectorSource);

            }
        });
    }
});

        });