import type * as LeafletNS from "leaflet";

// Ported from leaflet-imageoverlay-rotated (Iván Sánchez Ortega, Beerware),
// adapted to take the Leaflet module instance instead of relying on a global `L`.
export function registerRotatedImageOverlay(L: typeof LeafletNS) {
  if ((L as any).ImageOverlay.Rotated) return; // already registered

  const Rotated = (L as any).ImageOverlay.extend({
    initialize(image: any, topleft: any, topright: any, bottomleft: any, options: any) {
      if (typeof image === "string") {
        this._url = image;
      } else {
        this._rawImage = image;
      }
      this._topLeft = L.latLng(topleft);
      this._topRight = L.latLng(topright);
      this._bottomLeft = L.latLng(bottomleft);
      L.Util.setOptions(this, options);
    },

    onAdd(map: any) {
      if (!this._image) {
        this._initImage();
        if (this.options.opacity < 1) this._updateOpacity();
      }
      if (this.options.interactive) {
        L.DomUtil.addClass(this._rawImage, "leaflet-interactive");
        this.addInteractiveTarget(this._rawImage);
      }
      map.on("zoomend resetview", this._reset, this);
      this.getPane().appendChild(this._image);
      this._reset();
    },

    onRemove(map: any) {
      map.off("zoomend resetview", this._reset, this);
      (L as any).ImageOverlay.prototype.onRemove.call(this, map);
    },

    _initImage() {
      let img = this._rawImage;
      if (this._url) {
        img = L.DomUtil.create("img");
        img.style.display = "none";
        if (this.options.crossOrigin) img.crossOrigin = "";
        img.src = this._url;
        this._rawImage = img;
      }
      L.DomUtil.addClass(img, "leaflet-image-layer");
      const div = (this._image = L.DomUtil.create(
        "div",
        "leaflet-image-layer " + (this._zoomAnimated ? "leaflet-zoom-animated" : "")
      ));
      this._updateZIndex();
      div.appendChild(img);
      div.onselectstart = L.Util.falseFn;
      div.onmousemove = L.Util.falseFn;
      img.onload = () => {
        this._reset();
        img.style.display = "block";
        this.fire("load");
      };
      img.alt = this.options.alt;
    },

    _reset() {
      const div = this._image;
      if (!this._map) return;

      const pxTopLeft = this._map.latLngToLayerPoint(this._topLeft);
      const pxTopRight = this._map.latLngToLayerPoint(this._topRight);
      const pxBottomLeft = this._map.latLngToLayerPoint(this._bottomLeft);
      const pxBottomRight = pxTopRight.subtract(pxTopLeft).add(pxBottomLeft);

      const pxBounds = L.bounds([pxTopLeft, pxTopRight, pxBottomLeft, pxBottomRight]);
      const boundsMin = pxBounds.min!;
      const boundsMax = pxBounds.max!;
      const size = pxBounds.getSize();
      const pxTopLeftInDiv = pxTopLeft.subtract(boundsMin);

      this._bounds = L.latLngBounds(
        this._map.layerPointToLatLng(boundsMin),
        this._map.layerPointToLatLng(boundsMax)
      );

      L.DomUtil.setPosition(div, boundsMin);
      div.style.width = size.x + "px";
      div.style.height = size.y + "px";

      const imgW = this._rawImage.width;
      const imgH = this._rawImage.height;
      if (!imgW || !imgH) return;

      const vectorX = pxTopRight.subtract(pxTopLeft);
      const vectorY = pxBottomLeft.subtract(pxTopLeft);

      this._rawImage.style.transformOrigin = "0 0";
      this._rawImage.style.transform =
        "matrix(" +
        vectorX.x / imgW + ", " + vectorX.y / imgW + ", " +
        vectorY.x / imgH + ", " + vectorY.y / imgH + ", " +
        pxTopLeftInDiv.x + ", " + pxTopLeftInDiv.y + ")";
    },

    reposition(topleft: any, topright: any, bottomleft: any) {
      this._topLeft = L.latLng(topleft);
      this._topRight = L.latLng(topright);
      this._bottomLeft = L.latLng(bottomleft);
      this._reset();
    },

    setUrl(url: string) {
      this._url = url;
      if (this._rawImage) this._rawImage.src = url;
      return this;
    },
  });

  (L as any).ImageOverlay.Rotated = Rotated;
  (L as any).imageOverlay.rotated = function (imgSrc: any, topleft: any, topright: any, bottomleft: any, options: any) {
    return new Rotated(imgSrc, topleft, topright, bottomleft, options);
  };
}
