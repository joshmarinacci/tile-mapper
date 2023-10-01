import {Point, Size} from "josh_js_util"
import {describe, expect, it} from "vitest"

import {drawRect} from "../actions/actions"
import {appendToList} from "../model/base"
import {SImage, SImageLayer} from "../model/datamodel"


describe('basic drawing', () => {

    it('should fill the canvas', async () =>{
        const canvas = new SImage({size: new Size(50,50)})
        const layer = new SImageLayer({visible:true, opacity:1.0})
        appendToList(canvas,'layers',layer)
        layer.rebuildFromCanvas(canvas)

        layer.fillAll(0)
        expect(layer.getPixel(new Point(0,0))).toBe(0)
        layer.fillAll(12)
        expect(layer.getPixel(new Point(0,0))).toBe(12)

    })
    it('should draw a rectangle', async () =>{
        const canvas = new SImage({size: new Size(50,50)})
        const layer = new SImageLayer({visible:true, opacity:1.0})
        appendToList(canvas,'layers',layer)
        layer.rebuildFromCanvas(canvas)


        //normal rect
        {
            layer.fillAll(0)
            drawRect(layer, 12, new Point(0, 0), new Point(20, 20))
            expect(layer.getPixel(new Point(0, 0))).toBe(12)
            expect(layer.getPixel(new Point(1, 0))).toBe(12)
            expect(layer.getPixel(new Point(18, 0))).toBe(12)
            expect(layer.getPixel(new Point(19, 0))).toBe(12)
            expect(layer.getPixel(new Point(20, 0))).toBe(12)
            expect(layer.getPixel(new Point(21, 0))).toBe(0)
            expect(layer.getPixel(new Point(1, 1))).toBe(0)
            expect(layer.getPixel(new Point(1, 20))).toBe(12)
            expect(layer.getPixel(new Point(18, 20))).toBe(12)
        }

        // inverse rect
        {
            layer.fillAll(0)
            drawRect(layer, 12, new Point(20, 20), new Point(0, 0))
            expect(layer.getPixel(new Point(0, 0))).toBe(12)
            expect(layer.getPixel(new Point(20, 0))).toBe(12)
            expect(layer.getPixel(new Point(21, 0))).toBe(0)
        }

        // partly off screen
        {
            layer.fillAll(0)
            drawRect(layer, 12, new Point(-10, 0), new Point(20, 20))
            expect(layer.getPixel(new Point(0, 0))).toBe(12)
            expect(layer.getPixel(new Point(0, 1))).toBe(0)
        }


    })
})
