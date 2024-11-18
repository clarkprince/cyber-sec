const point_x = 0;
const point_y = 1;
/** dist is the Eucledian distance of two points */
const dist = ([x1, y1], [x2, y2]) => {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    return Math.sqrt(dx * dx + dy * dy);
};
/**
 * NOTE: we care about the viewport and not only the datacell
 * because floating menu can appear outside of the datacell
 * and use all space available
 * It is similar to how the contextual menu of an OS window would behave,
 * being able to be displayed outside of a reduced window and use all screen space available
 */
const getViewportDim = () => {
    // window.innerWidth will include scrollbars
    // instead we want to displayable area
    const w = document.documentElement.clientWidth;
    const h = document.documentElement.clientHeight;
    return [w, h];
};
/**
 * Get point quadrant relative to viewport
 */
const getPointQuadrant = (px, py) => {
    const [vw, vh] = getViewportDim();
    const horiz = px < vw / 2 ? "left" : "right";
    const vert = py < vh / 2 ? "top" : "bottom";
    return [horiz, vert];
};
/** CLICK-RELATIVE POSITIONING */
/**
 * Given a reference point and the size of a block, compute where to display it relative to this point without crossing the viewport borders with respect to rtl/ltr preferences.
 *
 * Reference is usually the mouse
 * Size of the block can be just an estimation
 * We also keep a safe margin in case the element is bigger than expected
 *
 * Behaviour is currently undefined if the block don't fit the viewport, it will probably overflow anyway
 */
const getBestRelativeQuadrant = (rx, ry, bw, bh) => {
    const margin = 0.05;
    const [vw, vh] = getViewportDim();
    // 0,0 is on top left (= viewport coords)
    const minLeft = margin * vw;
    const minTop = margin * vh;
    const maxRight = vw * (1 - margin);
    const maxBottom = vh * (1 - margin);
    const blockRight = rx + bw;
    //const blockLeft = rx - bw
    const blockBottom = ry + bh;
    const blockTop = ry - bh;
    // horizontal position is easy
    // all language have text from top to bottom
    // displaying the menu on the right always feel right (pun intended)
    const horiz = blockRight < maxRight ? "right" : "left";
    // vertical best position depends on rtl to avoid the blank line issue
    // we want to avoid opening the menu on blank lines as much as possible
    //
    // rtl screen:
    // |             <text start |
    // | text end>               |
    // if click on right, preferably open above
    // if click on left, preferably open below
    //
    // ltr screen:
    // | text start >
    // |               <text end |
    // if click on right, preferably open below
    // if click on left, preferably open above
    let vert;
    const isRtl = true;
    const [phoriz /*, pvert*/] = getPointQuadrant(rx, ry);
    if (isRtl) {
        if (phoriz === "right") {
            vert = blockTop > minTop ? "above" : "below";
        }
        else {
            vert = blockBottom < maxBottom ? "below" : "above";
        }
    }
    else {
        if (phoriz === "right") {
            vert = blockBottom < maxBottom ? "below" : "above";
        }
        else {
            vert = blockTop > minTop ? "above" : "below";
        }
    }
    return [horiz, vert];
};
/**
 * Given a reference point and the size of a block, compute where to display the block.
 *
 * Reference is usually the mouse
 * Size of the block can be just an estimation
 * We also keep a safe margin around the viewport in case the element is bigger than expected
 */
const getBestRelativePosition = (px, py, bw, bh, offset = 0) => {
    const [vw, vh] = getViewportDim();
    const [horiz, vert] = getBestRelativeQuadrant(px, py, bw, bh);
    const blockPos = `${horiz}:${vert}`;
    if (blockPos === "left:above") {
        return {
            // /!\ right computation changes depending on how we position elements
            // left 0------------------px------------->vw
            //     vw<-------------- (vw-px)-----------0  right
            // we could stick to "left" and use "left = px-w"
            // but "w" is an estimate of the menu width
            // so it woud be less precise
            right: vw - px - offset,
            // top 0------------------py------------->vh
            //    vh<-------------- (vh-py)-----------0  right
            bottom: vh - py - offset,
        };
    }
    else if (blockPos === "left:below") {
        return {
            right: vw - px - offset,
            top: py + offset,
        };
    }
    else if (blockPos === "right:above") {
        return {
            left: px + offset,
            bottom: vh - py - offset,
        };
    }
    else if (blockPos === "right:below") {
        return {
            left: px + offset,
            top: py - offset,
        };
    }
    throw Error("invalid block position " + blockPos);
};
export const positionRelativeToClick = (cx, cy, w, h, offset = 0) => {
    return getBestRelativePosition(cx, cy, w, h, (offset = 0));
};
/** RECORD-RELATIVE POSITIONING */
/**
 *
 * Current implementation:
 * Computes a position relative to the mouse,
 * and then "pushes" the menu above/atop the current selection
 *
 * TODO: this naive implementation uses the selection bounding rectangle
 * It doesn't account for lines that only partially fill the viewport
 * getRelevantRects allows to compute a bounding polygon more precisely
 *
 * In left to right language,
 * a record can look like this:
 *
 * 1)
 * ||--- line 1 -----| <whitespace> ||
 * => easiest scenario
 * 2)
 * ||------- line 1 ----------------||
 * ||--- line 2 ----| <whitespace>  ||
 * => we currently ignore the fact that we could put the menu in whitespace
 * 3)
 * ||------- line 1 ----------------||
 * ||------- line 2 ----------------||
 * ||--- line 3 ----| <whitespace>  ||
 * => we currently ignore the fact that we could put the menu in whitespace
 *
 * Where || marks the end of the viewport
 * and | the end of some text content
 */
export const positionRelativeToSelection = (cx, cy, bw, bh, selection, offset) => {
    const [vw, vh] = getViewportDim();
    const pos = getBestRelativePosition(cx, cy, bw, bh, offset);
    // TODO: instead use selection getElementRects
    // and compute "relevant" points
    const rect = selection.getBoundingClientRect();
    // below the selection, on same X than the mouse
    // the best positioning is computed based on the mouse position
    // we keep the same quadrant but slightly offset
    // so the menu is above or below text instead of hiding it
    if (pos.bottom) {
        // menu appears above
        pos.bottom = vh - rect.top;
    }
    else {
        pos.top = rect.bottom;
    }
    return pos;
};
export class VisualRectDebugger {
    async Paint(r) {
        const d = document.createElement("div");
        d.style.setProperty("position", "absolute");
        d.style.setProperty("width", r.width.toString());
        d.style.setProperty("height", r.height.toString());
        d.style.setProperty("left", r.left.toString());
        d.style.setProperty("right", r.right.toString());
        d.classList.add("border", "border-orange-700");
        await new Promise((r) => globalThis.setTimeout(r, 500));
        d.remove();
    }
}
/**
 * defaultOffset is pushing things up to h-2
 */
const defaultOptions = {
    offset: [0, 8],
    margin: 4, // h-1, w-1
};
/**
 * findDisplaySpace finds a “good position” to place a floating object in viscinity.
 *
 * First, viewport coordinates are taken into account, so the object is always fully visible.
 * Then, we take into account an ”interesting object”, that shall not be overridden (that is typically a selected).
 *
 * The algoritm then is fairly simple:
 *
 *  - by default, center it horizontally on the reference point. If that does not fit, shift left / right accordingly.
 *  - try to place the menu at the top, unless there is not enough space, in which case it appears below.
 */
export const findDisplaySpace = ([x, _], flt, obs, opts) => {
    const defopts = { ...opts, ...defaultOptions };
    const viewport = [
        document.documentElement.clientWidth,
        document.documentElement.clientHeight,
    ];
    let left;
    if (x - defopts.margin < flt.width / 2) {
        left = defopts.margin + defopts.offset[point_x];
    }
    else if (viewport[point_x] - defopts.margin - x < flt.width / 2) {
        left =
            viewport[point_x] -
                defopts.margin -
                defopts.offset[point_x] -
                flt.width;
    }
    else {
        left = x - flt.width / 2;
    }
    let pos;
    if (obs.top - defopts.offset[point_y] - flt.height < 0) {
        pos = new DOMRect(left, obs.bottom + defopts.offset[point_y], flt.width, flt.height);
    }
    else {
        pos = new DOMRect(left, obs.top - defopts.offset[point_y] - flt.height, flt.width, flt.height);
    }
    defopts.debug?.Paint(pos);
    return pos;
};
/**
 * Projecting onto a DOM rectangle,
 * that is always made of horizontal and vertical lines
 * This simplifies the generic algorithm a lot
 */
export function projectToRectSide(p, [l1, l2]) {
    const [px, py] = p;
    const [l1x, l1y] = l1;
    const [l2x, l2y] = l2;
    const vert = Math.abs(l1x - l2x) < 10e-4;
    const horiz = Math.abs(l1y - l2y) < 10e-4;
    if (vert) {
        const x = l1x;
        // we are in reversed coordinates in the DOM, but we don't care for this computation
        const by = Math.min(l1y, l2y);
        const ty = Math.max(l1y, l2y);
        // top point
        if (py > ty)
            return [x, ty];
        // bottom point
        if (py < by)
            return [x, by];
        // project on segment = keep point y but use vert segment x
        return [x, py];
    }
    else if (horiz) {
        // horiz
        const y = l1y;
        const lx = Math.min(l1x, l2x);
        const rx = Math.max(l1x, l2x);
        // left point
        if (px < lx)
            return [lx, y];
        // right point
        if (px > rx)
            return [rx, y];
        // project on segment = keep point x but use horiz segment y
        return [px, y];
    }
    else {
        console.error("Tried to project on a segment that is not a vertical or horizontal side of a rectangle. Return the segment center.");
        return [(l1x + l2x) / 2, (l1y + l2y) / 2];
    }
}
/**
 * Distance to the closest point to the rectangle bounds
 *
 * Gives the point that feels the closest to a block by a human user when clicking
 * as opposed to distance to the rectangle center that is an overestimation
 */
export const distanceToRectBounds = (p, rect) => {
    const bl = [rect.left, rect.bottom];
    const br = [rect.right, rect.bottom];
    const tr = [rect.right, rect.top];
    const tl = [rect.left, rect.top];
    const segments = [
        [bl, br],
        [br, tr],
        [tr, tl],
        [tl, bl],
    ];
    const closestPoints = segments.map((s) => projectToRectSide(p, s));
    const distances = closestPoints.map((c) => dist(p, c));
    return Math.min(...distances);
};
//# sourceMappingURL=positioning.js.map