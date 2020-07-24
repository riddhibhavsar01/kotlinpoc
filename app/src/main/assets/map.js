var map, drawSource, drawLayer;
var drawnFeatures = new ol.Collection();
var nc = new Object();
var wktFormat = new ol.format.WKT();
var Styles = {
    location: new ol.style.Style({
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'rgba(21,101,192,1)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(255,255,255,1)',
                width: 3
            })
        })
    }),
    draw: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(21,101,192,.2)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(21,101,192,1)',
            width: 3
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'rgba(21,101,192,1)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(255,255,255,1)',
                width: 3
            })
        })
    }),
edit: [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(72, 153, 255, 1)',
                width: 3
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.1)'
            })
        }),
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: 'orange'
                })
            }),
            geometry: function (feature) {
                let coordinates = [];
                let geomType = feature.getGeometry().getType();
                switch (geomType) {
		    case 'Point':
		    case 'MultiPoint':
				return feature.getGeometry();
			break;
                    case 'LineString':
                        coordinates = feature.getGeometry().getCoordinates();
                        break;
                    case 'MultiLineString':
                        for (let coords of feature.getGeometry().getCoordinates()) {
                            coordinates = coordinates.concat(coords[0]);
                        }
                        //coordinates = feature.getGeometry().getCoordinates()[0];
                        break;
                    case 'Polygon':
                        coordinates = feature.getGeometry().getCoordinates()[0];
                        break;
                    case 'MultiPolygon':
                        for (let coords of feature.getGeometry().getCoordinates()) {
                            coordinates = coordinates.concat(coords[0]);
                        }
                        //coordinates = feature.getGeometry().getCoordinates()[0][0];
                        break;
                }
                return new ol.geom.MultiPoint(coordinates);
            }
        })
    ],
    delete: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(244,67,54,.2)'
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(244,67,54,1)',
            width: 3
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: 'rgba(244,67,54,1)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(255,255,255,1)',
                width: 3
            })
        })
    })
}
// Initialize map
map = new ol.Map({
    target: 'map',
    controls: ol.control.defaults({
        attribution: false,
        zoom: true,
    }),
    layers: [
        /* new ol.layer.Tile({
            source: new ol.source.OSM()
        }), */
        new ol.layer.Tile({
            title: 'MapTiler',
            type: 'base',
            source: new ol.source.XYZ({
                url: 'https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=yojPzwQEOH8iqSgsLc9b',
                crossOrigin: 'anonymous'
            }),
        })
    ],
    view: new ol.View({
        center: [8079743.750418867, 2635272.784953302],
        zoom: 12
    })
});
drawSource = new ol.source.Vector({
    format: new ol.format.GeoJSON()
});
drawLayer = new ol.layer.Vector({
    source: drawSource,
    map: map,
    style: null//Styles.draw
});
locationLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: Styles.location
});
drawSource.on(['addfeature', 'removefeature'], function (e) {
    try {
        switch (e.type) {
            case 'addfeature':
                if (!e.feature.getId()) {
                    e.feature.setId(tempId());
                    drawnFeatures.push(e.feature);
                    // For Android
                    if (window.appInterface) {
                        window.appInterface.setInActive('Edit');
                        window.appInterface.setInActive('Delete');
                    }
                    // For iOS
                    if (window.webkit && window.webkit.messageHandlers) {
                        window.webkit.messageHandlers.setInActive.postMessage('Edit');
                        window.webkit.messageHandlers.setInActive.postMessage('Delete');
                    }
                }
                break;
            case 'removefeature':
                drawnFeatures.remove(e.feature);
                if (!drawSource.getFeatures().length) {
                    // For Android
                    if (window.appInterface) {
                        window.appInterface.setDisable('Edit');
                        window.appInterface.setDisable('Delete');
                        return true;
                    }
                    // For iOS
                    if (window.webkit && window.webkit.messageHandlers) {
                        window.webkit.messageHandlers.setDisable.postMessage('Edit');
                        window.webkit.messageHandlers.setDisable.postMessage('Delete');
                        return true;
                    }
                }
                break;
        }
    }
    catch (err) {
        console.log(err);
    }
});
nc.selectInteraction = new ol.interaction.Select({
    layers: function (layer) {
        if (layer == drawLayer) {
            return true;
        }
    },
    style: function () {
        if (nc.edit && nc.edit.active) {
            return Styles.edit;
        }
        if (nc.delete && nc.delete.active) {
            return Styles.delete;
        }
        return Styles.draw;
    },
    hitTolerance: 5
});
nc.selectListener = nc.selectInteraction.getFeatures().on(['add', 'remove'], function (e) {
    try {
        let lid, fid, wkt;
        if (nc.edit && nc.edit.active) {
            if (e.type == 'add') {
                nc.edit.oldGeometry = e.element.getGeometry().clone();
                // For Android
                if (window.appInterface) {
                    window.appInterface.setInActive('Stop');
                }
                // For iOS
                if (window.webkit && window.webkit.messageHandlers) {
                    window.webkit.messageHandlers.setInActive.postMessage('Stop');
                }
            } else {
                // For Android
                if (window.appInterface) {
                    window.appInterface.setDisable('Stop');
                }
                // For iOS
                if (window.webkit && window.webkit.messageHandlers) {
                    window.webkit.messageHandlers.setDisable.postMessage('Stop');
                }
                if (parseInt(e.element.getId())) {
                    lid = parseInt(e.element.get('lid'));
                    fid = parseInt(e.element.getId());
                    wkt = wktFormat.writeGeometry(e.element.getGeometry());
                    // For Android
                    if (window.appInterface) {
                        window.appInterface.saveEdit(lid, fid, wkt);
                    }
                    // For iOS
                    if (window.webkit && window.webkit.messageHandlers) {
                        window.webkit.messageHandlers.saveEdit.postMessage({ fid: fid, lid: lid, wkt: wkt });
                    }
                }
            }
        }
        else if (nc.delete && nc.delete.active) {
            if (!e.element) {
                return;
            }
            if (e.type == 'add') {
                fid = e.element.getId();
                lid = parseInt(e.element.get('lid'));
                // For Android
                if (window.appInterface) {
                    window.appInterface.confirmDelete(lid, fid);
                }
                // For iOS
                if (window.webkit && window.webkit.messageHandlers) {
                    window.webkit.messageHandlers.confirmDelete.postMessage({ lid: lid, fid: fid });
                }
            }
        }
        else {
            if (!e.element) {
                return;
            }
            if (e.type == 'add') {
                fid = e.element.getId();
                lid = parseInt(e.element.get('lid'));
                // For Android
                if (window.appInterface) {
                    window.appInterface.showFeatureSelected(fid, lid);
                }
                // For iOS
                if (window.webkit && window.webkit.messageHandlers) {
                    window.webkit.messageHandlers.showFeatureSelected.postMessage({ fid: fid, lid: lid });
                }
            }
        }
    }
    catch (e) {
        console.log(e);
    }
});
map.addInteraction(nc.selectInteraction);

function alertDialogMap(){

 console.log("fid", "lid");
   alert("sometext");
    if (window.appInterface) {
               window.appInterface.setMapExtent("wkt");
           }
   }
function startDraw(geomType, drawType) {
    try {
        if (nc.draw && !nc.draw.isMulti) {
            resetDraw();
        }

        if (nc.edit && nc.edit.active) {
            resetEdit();
        }

        if (nc.delete && nc.delete.active) {
            resetDelete();
        }

        // Create draw object
        nc.draw = new Object();
        nc.draw.type = drawType;

        if (['MultiPoint', 'MultiLineString', 'MultiPolygon'].indexOf(geomType) != -1) {
            nc.draw.isMulti = true;
            nc.draw.geomType = geomType.replace('Multi', '');
        } else {
            nc.draw.geomType = geomType;
        }

        nc.drawInteraction = new ol.interaction.Draw({
            source: drawSource,
            type: nc.draw.geomType,
            style: Styles.draw,
            stopClick: true,
            condition: function (e) {
                return drawType != 'automatic';
            },
            updateWhileInteracting: true
        })

        map.addInteraction(nc.drawInteraction);

        // Check if geometry is of type multi
        if (nc.draw.isMulti) {
            nc.drawInteraction.on('drawstart', function (e) { nc.draw.active = true });
            nc.drawInteraction.on('drawend', function (e) { nc.draw.active = false });
        } else {
            nc.drawInteraction.once('drawstart', function (e) { nc.draw.active = true });
            nc.drawInteraction.once('drawend', function (e) { nc.draw.active = false });
            drawSource.once('addfeature', function (e) { endDraw(e.feature) });
        }

        nc.drawInteraction.once('drawstart', function (e) { handleUndoRedoState() });
        nc.drawInteraction.once('drawend', function (e) { handleUndoRedoState() });

        // For Android
        if (window.appInterface) {
            window.appInterface.setInActive('Stop');
        }

        // For iOS
        if (window.webkit && window.webkit.messageHandlers) {
            window.webkit.messageHandlers.setInActive.postMessage('Stop');
        }

        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

function autoDraw(lat, lon) {
    try {
        let coords = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
        if (!nc.drawInteraction.sketchFeature_) {
            let evt = new CustomEvent('click');
            evt = Object.assign(evt, { map: map, coordinate: coords });
            nc.drawInteraction.startDrawing_(evt);
            map.getView().setCenter(coords);
            map.getView().setZoom(15);
        } else {
            nc.drawInteraction.appendCoordinates([coords]);
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

function finishDraw() {
    try {
        // Finish drawing if active
        nc.drawInteraction.finishDrawing();
        nc.draw.active = false;
    } catch (e) {
        console.log(e);
    }
}

function endDraw() {
    try {
        if (nc.drawInteraction) {
            finishDraw();
            map.removeInteraction(nc.drawInteraction);
        }

        if (nc.edit && nc.edit.active) {
            deselectFeatures();
        }

        // For Android
        if (window.appInterface) {
            window.appInterface.setDisable('Stop');
            window.appInterface.setDisable('Undo');
            window.appInterface.setDisable('Redo');
        }

        // For iOS
        if (window.webkit && window.webkit.messageHandlers) {
            window.webkit.messageHandlers.setDisable.postMessage('Stop');
            window.webkit.messageHandlers.setDisable.postMessage('Undo');
            window.webkit.messageHandlers.setDisable.postMessage('Redo');
        }
    } catch (e) {
        console.log(e);
    }
}

function resetDraw() {
    try {
        // Clear drawn features
        drawnFeatures.forEach(function (ft) {
            drawSource.removeFeature(ft);
        });
        // Remove Interaction
        map.removeInteraction(nc.drawInteraction);
    } catch (e) {
        console.log(e);
        return false;
    }
}

function toggleEdit() {
    try {
        if (nc.draw) {
            endDraw();
        }
        if (nc.delete && nc.delete.active) {
            resetDelete();
        }
        if (nc.edit && nc.edit.active) {
            resetEdit();
            return;
        }
        // Create draw object
        nc.edit = new Object();
        nc.modifyInteraction = new ol.interaction.Modify({
            features: nc.selectInteraction.getFeatures()
        });
        //map.addInteraction(nc.selectInteraction);
        map.addInteraction(nc.modifyInteraction);
        // For Android
        if (window.appInterface) {
            //window.appInterface.setDisable('Add');
            window.appInterface.setEnable('Edit');
        }
        // For iOS
        if (window.webkit && window.webkit.messageHandlers) {
            //window.webkit.messageHandlers.setDisable.postMessage('Add');
            window.webkit.messageHandlers.setEnable.postMessage('Edit');
        }
        nc.edit.active = true;
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

function resetEdit() {
    try {
        map.removeInteraction(nc.modifyInteraction);
        nc.edit.active = false;
        nc.modifyInteraction = null;
        nc.selectInteraction.getFeatures().clear();
        // For Android
        if (window.appInterface) {
            //window.appInterface.setInActive('Add');
            window.appInterface.setInActive('Edit');
        }
        // For iOS
        if (window.webkit && window.webkit.messageHandlers) {
            //window.webkit.messageHandlers.setInActive.postMessage('Add');
            window.webkit.messageHandlers.setInActive.postMessage('Edit');
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

function undoEdit(fid) {
    try {
        let feature = drawSource.getFeatureById(fid);
        feature.setGeometry(nc.edit.oldGeometry);
    }
    catch (e) {
        console.log(e);
    }
}

function toggleDelete() {
    try {
        if (nc.draw) {
            endDraw();
        }
        if (nc.edit && nc.edit.active) {
            resetEdit();
        }
        if (nc.delete && nc.delete.active) {
            resetDelete();
            return;
        }
        nc.delete = new Object();
        nc.delete.active = true;
        // For Android
        if (window.appInterface) {
            window.appInterface.setEnable('Delete');
        }
        // For iOS
        if (window.webkit && window.webkit.messageHandlers) {
            window.webkit.messageHandlers.setEnable.postMessage('Delete');
        }
    } catch (e) {
        console.log(e);
        return false;
    }
}

function resetDelete() {
    try {
        nc.delete.active = false;
        nc.selectInteraction.getFeatures().clear();
        // For Android
        if (window.appInterface) {
            window.appInterface.setInActive('Delete');
        }
        // For iOS
        if (window.webkit && window.webkit.messageHandlers) {
            window.webkit.messageHandlers.setInActive.postMessage('Delete');
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

function undo() {
    try {
        if (nc.draw.geomType && nc.draw.geomType == 'Point') {
            return;
        }
        if (!nc.sketchHistory) {
            nc.sketchHistory = [];
        }
        let coords, sketchGeom;
        if (nc.draw.geomType == 'LineString' || nc.draw.geomType == 'MultiLineString') {
            coords = nc.drawInteraction.sketchCoords_;
        } else if (nc.draw.geomType == 'Polygon' || nc.draw.geomType == 'MultiPolygon') {
            coords = nc.drawInteraction.sketchCoords_[0];
        }
        if (coords.length == 2) {
            nc.drawInteraction.abortDrawing_();
            nc.sketchHistory = [];
        }
        else {
            nc.sketchHistory.push(coords[coords.length - 2]);
            nc.drawInteraction.removeLastPoint();
            nc.drawInteraction.sketchPoint_.setGeometry(new ol.geom.Point(coords[coords.length - 2]));
            if (nc.draw.geomType == 'Polygon') {
                nc.drawInteraction.sketchLine_.setGeometry(new ol.geom.LineString(coords.slice(0, coords.length - 1)));
                coords = coords.slice(0, coords.length - 1)
                    .concat(coords.slice(coords.length - 2, coords.length - 1))
                    .concat(coords.slice(0, 1));
                nc.drawInteraction.sketchFeature_.setGeometry(new ol.geom.Polygon([coords]));
            } else {
                nc.drawInteraction.sketchFeature_.setGeometry(new ol.geom.LineString(coords.slice(0, coords.length - 1)));
            }
        }
        console.log('Undo Call');
        handleUndoRedoState();
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

function redo() {
    try {
        if (nc.sketchHistory && !nc.sketchHistory.length) {
            return;
        }
        let lastPoint = nc.sketchHistory.pop();
        let coords;
        if (nc.draw.geomType == 'LineString' || nc.draw.geomType == 'MultiLineString') {
            coords = nc.drawInteraction.sketchCoords_;
        } else if (nc.draw.geomType == 'Polygon' || nc.draw.geomType == 'MultiPolygon') {
            coords = nc.drawInteraction.sketchCoords_[0];
        }
        coords.splice(coords.length - 1, 0, lastPoint);
        nc.drawInteraction.sketchPoint_.setGeometry(new ol.geom.Point(coords[coords.length - 2]));
        if (nc.draw.geomType == 'Polygon') {
            nc.drawInteraction.sketchLine_.setGeometry(new ol.geom.LineString(coords.slice(0, coords.length - 1)));
            coords = coords.slice(0, coords.length - 1)
                .concat(coords.slice(coords.length - 2, coords.length - 1))
                .concat(coords.slice(0, 1));
            nc.drawInteraction.sketchFeature_.setGeometry(new ol.geom.Polygon([coords]));
        } else {
            nc.drawInteraction.sketchFeature_.setGeometry(new ol.geom.LineString(coords.slice(0, coords.length - 1)));
        }
        console.log('Redo Call');
        handleUndoRedoState();
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

function handleUndoRedoState() {
    if (nc.draw && nc.draw.active) {
        let sketchCoords = nc.drawInteraction.sketchCoords_;
        if (!nc.drawInteraction.sketchFeature_) {
            // For Android
            if (window.appInterface) {
                window.appInterface.setDisable('Stop');
                window.appInterface.setDisable('Undo');
                window.appInterface.setDisable('Redo');
            }
            // For iOS
            if (window.webkit && window.webkit.messageHandlers) {
                window.webkit.messageHandlers.setDisable.postMessage('Stop');
                window.webkit.messageHandlers.setDisable.postMessage('Undo');
                window.webkit.messageHandlers.setDisable.postMessage('Redo');
            }
        }
        if (nc.drawInteraction.sketchFeature_ && sketchCoords.length) {
            // For Android
            if (window.appInterface) {
                window.appInterface.setInActive('Undo');
            }
            // For iOS
            if (window.webkit && window.webkit.messageHandlers) {
                window.webkit.messageHandlers.setInActive.postMessage('Undo');
            }
        } else {
            // For Android
            if (window.appInterface) {
                window.appInterface.setDisable('Undo');
            }
            // For iOS
            if (window.webkit && window.webkit.messageHandlers) {
                window.webkit.messageHandlers.setDisable.postMessage('Undo');
            }
        }
        if (nc.sketchHistory && nc.sketchHistory.length) {
            // For Android
            if (window.appInterface) {
                window.appInterface.setInActive('Redo');
            }
            // For iOS
            if (window.webkit && window.webkit.messageHandlers) {
                window.webkit.messageHandlers.setInActive.postMessage('Redo');
            }
        } else {
            // For Android
            if (window.appInterface) {
                window.appInterface.setDisable('Redo');
            }
            // For iOS
            if (window.webkit && window.webkit.messageHandlers) {
                window.webkit.messageHandlers.setDisable.postMessage('Redo');
            }
        }
    }
}

function removeFeature(fid) {
    try {
        console.log("feature id :" + fid);
        drawSource.removeFeature(drawSource.getFeatureById(fid));
        nc.selectInteraction.getFeatures().clear();
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
}

function tempId() {
    return 'temp.' + Math.random().toString(8).substr(2);
}

function loadFeatures(data, view, source) {
    try {
        let jsonData = JSON.parse(data);
        let features = jsonData.features;
        let label = jsonData.label
        if (!source) {
            source = drawSource;
        }
        for (let feat of features) {
            if (feat.geom && feat.geom != '') {
                let feature = wktFormat.readFeatureFromText(feat.geom);
                feature.setId(feat.id);
                let props = new Object();
                props.id = feat.id;
                props.lid = jsonData.layerId;
                props[label] = feat[label];
                feature.setProperties(props);
                source.addFeature(feature);
            }
        }
        if (source.getFeatures().length) {
            // For Android
            if (window.appInterface) {
                window.appInterface.setInActive('Edit');
                window.appInterface.setInActive('Delete');
            }
            // For iOS
            if (window.webkit && window.webkit.messageHandlers) {
                window.webkit.messageHandlers.setInActive.postMessage('Edit');
                window.webkit.messageHandlers.setInActive.postMessage('Delete');
            }
        }
        if (view) {
            setMapExtent(view);
        } else {
            if (source == drawSource && source.getFeatures().length) {
                map.getView().fit(source.getExtent(), map.getSize());
            }
        }
    }
    catch (e) {
        console.log('Invalid data');
        return false;
    }
}

function getDrawnGeometry() {
    try {
        let regex = /temp/;
        let feature;
        if (!drawnFeatures.getLength()) {
            console.log('No features found');
            return false;
        }
        if (nc.draw && nc.draw.isMulti) {
            let multigeometry;
            switch (nc.draw.geomType) {
                case 'Point':
                    multigeometry = new ol.geom.MultiPoint([]);
                    drawnFeatures.forEach(function (ft) {
                        multigeometry.appendPoint(ft.getGeometry())
                    });
                    break;
                case 'LineString':
                    multigeometry = new ol.geom.MultiLineString([]);
                    drawnFeatures.forEach(function (ft) {
                        multigeometry.appendLineString(ft.getGeometry())
                    });
                    break;
                case 'Polygon':
                    multigeometry = new ol.geom.MultiPolygon([]);
                    drawnFeatures.forEach(function (ft) {
                        multigeometry.appendPolygon(ft.getGeometry())
                    });
                    break;
            }
            feature = new ol.Feature(multigeometry);
        } else {
            drawnFeatures.forEach(function (ft) {
                if (regex.test(ft.getId()) || parseInt(ft.getId())) {
                    feature = ft;
                }
            });
        }
        // Remove draw interaction
        map.removeInteraction(nc.drawInteraction);
        console.log(wktFormat.writeFeature(feature))
        // For Android
        if (window.appInterface) {
            window.appInterface.getGeometry(wktFormat.writeFeature(feature));
            return true;
        }
        // For iOS
        if (window.webkit && window.webkit.messageHandlers) {
            window.webkit.messageHandlers.getGeometry.postMessage(wktFormat.writeFeature(feature));
            return true;
        }
        return false;
    } catch (e) {
        console.log(e);
        return false;
    }
}

function zoomToFeature(fid) {
    try {
        map.getView().fit(drawSource.getFeatureById(fid).getGeometry().getExtent(), map.getSize());
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

function sendLiveLocation(lat, lon, zoom) {
    if (lat && lon) {
        locationLayer.getSource().clear();
        let coords = ol.proj.fromLonLat([lon, lat], 'EPSG:3857');
        let feature = new ol.Feature(new ol.geom.Point(coords));
        locationLayer.getSource().addFeature(feature);
        if (zoom) {
            map.getView().setCenter(coords);
        }
        /* map.getView().fit(feature.getGeometry().getExtent(), map.getSize());
        map.getView().setZoom(12); */
    }
}

function showLayer(lid, type) {
    let exists = false;
    map.getLayers().forEach(function (lyr) {
        if (lyr.get('id') == lid && lyr.get('type') == type) {
            exists = true;
            lyr.setVisible(true);
        }
    });
    if (!exists) {
        // For Android
        if (window.appInterface) {
            window.appInterface.getLayerData(lid, type);
        }
        // For iOS
        if (window.webkit && window.webkit.messageHandlers) {
            window.webkit.messageHandlers.getLayerData.postMessage({ lid: lid, type: type });
        }
    }
    return true;
}

function hideLayer(lid, type) {
    map.getLayers().forEach(function (lyr) {
        if (lyr.get('id') == lid && lyr.get('type') == type) {
            lyr.setVisible(false);
            return true;
        }
    });
}

function addLayer(data, type, styleData, view) {
    let id, source, layer;
    let ldata = JSON.parse(data);
    if (type == 'layer' && !ldata.features.length) {
        console.log('No data found');
        return;
    }
    if (type == 'edit') {
        source = drawSource;
    } else {
        source = new ol.source.Vector({
            format: new ol.format.GeoJSON()
        });
    }
    if (styleData) {
        styleData = JSON.parse(styleData);
    } else {
        styleData = {
            type: null,
            fillColor: null,
            strokeColor: null,
            strokeWidth: null,
            label: null,
            size: null
        }
    }
    if (type) {
        ldata.label = styleData.label;
        switch (type) {
            case 'edit':
            case 'layer':
                id = ldata.layerId;
                loadFeatures(JSON.stringify(ldata), view, source);
                break;
            case 'track':
                id = ldata.trackId;
                let linestring=ldata.geom,
                 format = new ol.format.WKT(),
                                 wkt = linestring,

                                 geom = format.readGeometry(wkt, {
     dataProjection: 'EPSG:4326',
     featureProjection: 'EPSG:3857'
   })
                                 , feature = new ol.Feature(
                                  {geometry: geom}
                                 );
                                 console.log(feature.getGeometry().getCoordinates());
                                 console.log(wkt);
                                 console.log(ldata);
                /*let tracks = eval(ldata.trackGeom);
                let lineCoords = [];
                for (let track of tracks) {
                    let coords = ol.proj.transform([track.longitude, track.latitude], 'EPSG:4326', 'EPSG:3857');
                    lineCoords.push(coords);
                }
                let feature = new ol.Feature(new ol.geom.LineString(lineCoords));*/
                source.addFeature(feature);
                break;
        }
    }
    function styleFunction(ft) {
        var styles = {
            'Point': new ol.style.Circle({
                radius: styleData.size ? styleData.size : 7,
                fill: new ol.style.Fill({
                    color: styleData.fillColor ? styleData.fillColor : 'rgba(21,101,192,1)'
                }),
                stroke: new ol.style.Stroke({
                    color: styleData.strokeColor ? styleData.strokeColor : 'rgba(255,255,255,1)',
                    width: styleData.strokeWidth ? styleData.strokeWidth : 3
                })
            }),
            'Circle': new ol.style.Circle({
                radius: styleData.size ? styleData.size : 7,
                stroke: new ol.style.Stroke({
                    color: styleData.strokeColor ? styleData.strokeColor : 'rgba(255,255,255,1)',
                    width: styleData.strokeWidth ? styleData.strokeWidth : 3
                })
            }),
            'Box': new ol.style.RegularShape({
                fill: new ol.style.Fill({
                    color: styleData.fillColor ? styleData.fillColor : 'rgba(21,101,192,1)'
                }),
                stroke: new ol.style.Stroke({
                    color: styleData.strokeColor ? styleData.strokeColor : 'rgba(255,255,255,1)',
                    width: styleData.strokeWidth ? styleData.strokeWidth : 3
                }),
                points: 4,
                radius: styleData.size ? styleData.size : 7,
                angle: Math.PI / 4
            }),
            'Triangle': new ol.style.RegularShape({
                fill: new ol.style.Fill({
                    color: styleData.fillColor ? styleData.fillColor : 'rgba(21,101,192,1)'
                }),
                stroke: new ol.style.Stroke({
                    color: styleData.strokeColor ? styleData.strokeColor : 'rgba(255,255,255,1)',
                    width: styleData.strokeWidth ? styleData.strokeWidth : 3
                }),
                points: 3,
                radius: styleData.size ? styleData.size : 7,
                rotation: Math.PI / 4,
                angle: 0
            }),
            'Cross': new ol.style.RegularShape({
                fill: new ol.style.Fill({
                    color: styleData.fillColor ? styleData.fillColor : 'rgba(21,101,192,1)'
                }),
                stroke: new ol.style.Stroke({
                    color: styleData.strokeColor ? styleData.strokeColor : 'rgba(255,255,255,1)',
                    width: styleData.strokeWidth ? styleData.strokeWidth : 3
                }),
                points: 4,
                radius: styleData.size ? styleData.size : 7,
                radius2: 0,
                angle: Math.PI / 4
            }),
            'Solid': new ol.style.Stroke({
                color: styleData.strokeColor ? styleData.strokeColor : 'rgba(21,101,192,1)',
                width: styleData.strokeWidth ? styleData.strokeWidth : 3
            }),
            'Dash': new ol.style.Stroke({
                color: styleData.strokeColor ? styleData.strokeColor : 'rgba(21,101,192,1)',
                width: styleData.strokeWidth ? styleData.strokeWidth : 3,
                lineDash: styleData.strokeWidth ? [styleData.strokeWidth, styleData.strokeWidth * 2] : undefined
            }),
            'Dot': new ol.style.Stroke({
                color: styleData.strokeColor ? styleData.strokeColor : 'rgba(21,101,192,1)',
                width: styleData.strokeWidth ? styleData.strokeWidth : 3,
                lineDash: styleData.strokeWidth ? [1, styleData.strokeWidth * 2] : undefined
            }),
            'Dash Dot': new ol.style.Stroke({
                color: styleData.strokeColor ? styleData.strokeColor : 'rgba(21,101,192,1)',
                width: styleData.strokeWidth ? styleData.strokeWidth : 3,
                lineDash: styleData.strokeWidth ? [styleData.strokeWidth, styleData.strokeWidth * 2, 1, styleData.strokeWidth * 2] : undefined
            })
        };
        return new ol.style.Style({
            fill: new ol.style.Fill({
                color: styleData.fillColor ? styleData.fillColor : 'rgba(21,101,192,.2)'
            }),
            stroke: ['LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'].indexOf(ft.getGeometry().getType()) != -1 ? styles[styleData.type || 'Solid'] : undefined,
            image: ['Point', 'MultiPoint'].indexOf(ft.getGeometry().getType()) != -1 ? styles[styleData.type || 'Point'] : undefined,
            text: new ol.style.Text({
                text: ft.get(styleData.label ? styleData.label : null) ? ft.get(styleData.label ? styleData.label : null).toString() : ft.get(null),
                scale: 1.5,
                fill: new ol.style.Fill({
                    color: 'rgba(0,0,0,1)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(255,255,255,1)',
                    width: 2
                }),
                placement: 'point'
            })
        });
    }
    if (type == 'edit') {
        layer = drawLayer;
        layer.setStyle(styleFunction);
        layer.setOpacity(styleData.viewOpacity ? styleData.viewOpacity / 255 : 1)
    } else {
        layer = new ol.layer.Vector({
            id: id,
            type: type,
            source: source,
            style: styleFunction,
            opacity: styleData.viewOpacity ? styleData.viewOpacity / 255 : 1
        });
        removeLayer(id, type);
        map.addLayer(layer);
    }
    //map.getView().fit(source.getExtent(), map.getSize());
    return layer;
}

function removeLayer(lid, type) {
    map.getLayers().forEach(function (lyr) {
        if (lyr && lyr.get('id') == lid && lyr.get('type') == type) {
            map.removeLayer(lyr);
        }
    });
}

function getMapExtent() {
    let view = map.getView();
    let data = {
        extent: view.calculateExtent(map.getSize()).toString(),
        zoom: view.getZoom(),
        rotation: view.getRotation()
    }
    // For Android
    if (window.appInterface) {
        window.appInterface.setMapExtent(JSON.stringify(data));
    }
    // For iOS
    if (window.webkit && window.webkit.messageHandlers) {
        window.webkit.messageHandlers.setMapExtent.postMessage(JSON.stringify(data));
    }
}

function setMapExtent(view) {
    try {
        view = JSON.parse(view);
        map.getView().fit(eval('[' + view.extent + ']'), map.getSize());
        map.getView().setZoom(view.zoom);
        map.getView().setRotation(view.rotation);
    }
    catch (e) {
        console.log(e);
    }
}

function deselectFeatures() {
    try {
        nc.selectInteraction.getFeatures().clear();
    }
    catch (e) {
        console.log(e);
    }
}

function addWMSLayer(name, title, url) {
    console.log('layer wms added');
    var layer = new ol.layer.Tile({
        title: title,
        name: name,
        source: new ol.source.TileWMS({
            url: url + 'wms',
            params: { 'LAYERS': name, 'TILED': true },
        }),
        visible: true
    });
    console.log(layer.getSource());
    console.log(map.getView().getProjection().getCode());
    map.addLayer(layer);
    return layer;
}
/*function showWMSLayer(title) {
var zindx = 10000;
//map.getLayers().getArray()[1].get('title') == 'Bridges'
//console.log('title layer wms above' + title);
lyr = map.getLayers().getArray();
for (i = 0; i < lyr.length; i++) {
//console.log('title layer wms inside loop : ' + lyr[i].get('title'));
if (lyr[i].get('title') != undefined && lyr[i].get('title') == title && lyr[i].getSource() instanceof ol.source.Tile) {
// console.log('title layer wms' + lyr[i].get('title'));
lyr[i].setVisible(true);
console.log(lyr[i].getSource());
lyr[i].setZIndex(zindx + i);
//var bbox = [lyr[i].getSource().tmpExtent_[0], lyr[i].getSource().tmpExtent_[1], lyr[i].getSource().tmpExtent_[2], lyr[i].getSource().tmpExtent_[3]];
//console.log(bbox);
//map.getView().fit(bbox);
}
}
*//* map.getLayers().getArray().forEach(function (lyr,i) {
console.log('title layer wms inside loop' + lyr);
if (lyr[i].get('title') == title) {
console.log('title layer wms' + lyr.get('title'));
lyr.setVisible(true);
}
})*//*
console.log(map.getView().getProjection().getCode());
console.log('end of fn');
}*/

function showWMSLayer(name, title, url) {
    console.log('new wms show layerfun');
    console.log(name);
    console.log(url);
    console.log(title);
    var zindx = 10000, added = false;
    //map.getLayers().getArray()[1].get('title') == 'Bridges'
    //console.log('title layer wms above' + title);
    lyr = map.getLayers().getArray();
    map.getLayers().getArray().forEach(lyr1 => {
        if (lyr1.getSource() instanceof ol.source.Tile && lyr1.getSource().getUrls()) {
            console.log(lyr1.getSource().getUrls()[0]);
            console.log(lyr1.getProperties().name);
            console.log(lyr1.getProperties().title);
            if (lyr1.getProperties().title === title && lyr1.getProperties().name === name && lyr1.getSource().getUrls()[0].replace('wms', '') == url) {
                console.log(lyr1.getProperties().name + "added..");
                added = true;
                // break;
            }
        }
    }
    );
    if (!added) {
        console.log("adding from show wms");
        addWMSLayer(name, title, url);
        return;
    }
    for (i = 0; i < lyr.length; i++) {
        //console.log('title layer wms inside loop : ' + lyr[i].get('title'));
        if (lyr[i].get('title') != undefined && lyr[i].get('title') == title && lyr[i].getSource() instanceof ol.source.Tile) {
            // console.log('title layer wms' + lyr[i].get('title'));
            lyr[i].setVisible(true);
            console.log(lyr[i].getSource());
            lyr[i].setZIndex(zindx + i);
            //var bbox = [lyr[i].getSource().tmpExtent_[0], lyr[i].getSource().tmpExtent_[1], lyr[i].getSource().tmpExtent_[2], lyr[i].getSource().tmpExtent_[3]];
            //console.log(bbox);
            //map.getView().fit(bbox);
        }
    }
    /* map.getLayers().getArray().forEach(function (lyr,i) {
    console.log('title layer wms inside loop' + lyr);
    if (lyr[i].get('title') == title) {
    console.log('title layer wms' + lyr.get('title'));
    lyr.setVisible(true);
    }
    })*/
    console.log(map.getView().getProjection().getCode());
    console.log('end of fn');
}

function hideWMSLayer(title) {
    map.getLayers().forEach(function (lyr) {
        if (lyr.get('title') == title) {
            lyr.setVisible(false);
        }
    })
}


function setSettings(opts) {
    opts = JSON.parse(opts);
    nc.settings = opts;

    let control, interaction;
    for (let key of Object.keys(opts)) {
        switch (key) {
            case 'northArrow':
                // Find control from map;
                control = map.getControls().getArray().find(cntrl => cntrl instanceof ol.control.Rotate);

                // Add or remove control
                if (opts[key] && !control) {
                    map.addControl(new ol.control.Rotate());
                } else if (!opts[key] && control) {
                    map.removeControl(control);
                };
                break;
            case 'currentLocation':
                locationLayer.setVisible(opts[key]);
                break;
            case 'zoomControl':
                // Find control from map;
                control = map.getControls().getArray().find(cntrl => cntrl instanceof ol.control.Zoom);

                // Add or remove control
                if (opts[key] && !control) {
                    map.addControl(new ol.control.Zoom());
                } else if (!opts[key] && control) {
                    map.removeControl(control);
                };

                break;
            case 'rotationControl':
                // Find interaction from map;
                interaction = map.getInteractions().getArray().find(i => i instanceof ol.interaction.PinchRotate);

                if (interaction) {
                    interaction.setActive(opts[key]);
                    map.getView().setRotation(0);
                }
                break;
        }
    }
}

function showTrack(uid, date) {
    var trackLayer;
    // Check if layer exists
    map.getLayers().forEach(function (lyr) {
        if (lyr.get('title') == 'Track Layer') {
            trackLayer = lyr;
        }
    });

    // Add layer if not exists
    if (!trackLayer) {
        trackLayer = new ol.layer.Vector({
            title: 'Track Layer',
            source: new ol.source.Vector(),
            visible: true
        });

        map.addLayer(trackLayer);
    }

    var viewparams = 'viewparams=user_id:' + uid + ';date:' + date + ';'

    var url = 'http://demo.citylayers.in/geoserver_temptable_test/wfs?service=WFS&' +
        'version=1.1.0&request=GetFeature&typename=citylayers:admin_track&' +
        'outputFormat=application/json&srsname=EPSG:3857&' + viewparams;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);

    var onError = function () {
        console.log('Failed to load data');
    }

    xhr.onerror = onError;
    xhr.onload = function () {
        if (xhr.status == 200) {
            let source = trackLayer.getSource();
            source.clear();
            source.addFeatures(
                new ol.format.GeoJSON().readFeatures(xhr.responseText));
if(JSON.parse(xhr.responseText).features.length) {
   map.getView().fit(source.getExtent(), map.getSize());
} else {
   console.log('No data found');
}
        } else {
            onError();
        }
    }
    xhr.send();
}



function getTrackWKT(data){
//ldata = JSON.parse(data);
tracks = eval(data);
let lineCoords = [];
              for (let track of tracks) {
                  let coords = ol.proj.transform([track.longitude, track.latitude], 'EPSG:4326', 'EPSG:4326');
                  lineCoords.push(coords);
              }
              if(lineCoords.length==1){
              lineCoords.push(lineCoords[0]);
              }
              let feature = new ol.Feature(new ol.geom.LineString(lineCoords));
               let format = new ol.format.WKT(),
   wkt= format.writeGeometry(feature.getGeometry());
    // For Android
        if (window.appInterface) {
            window.appInterface.getLineString(wkt);
        }
        // For iOS
        if (window.webkit && window.webkit.messageHandlers) {
            window.webkit.messageHandlers.getLineString.postMessage(wkt);
   }
   }


/* window.appInterface = {
    setInActive: function (btn) {
        document.getElementById(btn.toLowerCase()).disabled = false;
    },
    setEnable: function (btn) {
        document.getElementById(btn.toLowerCase()).disabled = false;
    },
    setDisable: function (btn) {
        document.getElementById(btn.toLowerCase()).disabled = true;
    },
    confirmDelete: function (fid) {
        let check = confirm('Delete feature?');
        if (check) {
            removeFeature(fid);
        } else {
            deselectFeatures();
        }
    },
    showFeatureSelected: function (fid, lid) {
        console.log(fid, lid);
    },
    saveEdit: function (lid, fid, wkt) {
        console.log(lid, fid, wkt);
    }
} */