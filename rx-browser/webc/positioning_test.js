import { projectToRectSide } from "./positioning"
describe("positioning", () => {
    describe("projectToRectSegment", () => {
        it("return orthogonal point if it's on the segment", () => {
            const A = [0, 1]
            const B = [0, 2]
            const prA = projectToRectSide([0, 1.2], [A, B])
            if (!(prA[0] === 0 && prA[1] === 1.2)) {
                throw new Error(`projected point should equal [0,1.2], got: ${{ prA }}`)
            }
        })
        it("return A if project is left/bottom of segment", () => {
            const A = [0, 1]
            const B = [0, 2]
            const prA = projectToRectSide([0, -1], [A, B])
            if (!(prA[0] === A[0] && prA[1] === A[1])) {
                throw new Error(`projected point should equal ${A}, got: ${prA}`)
            }
            const prB = projectToRectSide([0, 3], [A, B])
            if (!(prB[0] === B[0] && prB[1] === B[1])) {
                throw new Error(`projected point should equal ${B}, got: ${prB}`)
            }
        })
    })

})