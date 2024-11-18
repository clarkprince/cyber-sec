/**
 * Throw this error for tests that should work, 
 * but that we haven't yet been able to automate
 * 
 * They must fail the automated test, to trigger human attention
 * 
 * @param {string} dateOrRev 
 * @param {string} by 
 * @returns 
 */
export function PassManualCheck(dateOrRev, by) {
  return new Error(`PASS: Checked manually by ${by || "someone"} at ${dateOrRev || "some point"}, please retest during QA.`)
}
/**
 * The feature is broken, test must be fixed
 * If possible, also try to automate the test
 * @param {string} dateOrRev 
 * @param {string} by 
 * @returns 
 */
export function FailManualCheck(dateOrRev, by, info) {
  return new Error(`FAIL: Checked manually by ${by || "someone"} at ${dateOrRev || "some point"}, and it doesn't pass :(. ${info && `Info: ${info}`}`)
}

/**
 * Use this anchor to render the test content in the dom
 * @example render(html`<p>foo</p>`, getTestAnchor())
 * @returns {HTMLElement}
 */
export function getTestAnchor() {
  const testAnchor = document.getElementById("test-anchor")
  if (!testAnchor) throw new Error("No element #test-anchor, can't pause Mocha test")
  return testAnchor
}

/**
 * Display the current test in test-anchor div
 * Click resume button to leave
 * 
 * Increases the test timeout to 10mn until you check
 * 
 * @example it("pauses", function(){ await pauseAndShow(this)})
 */
export async function pauseAndShow(mochaTest) {
  const testAnchor = getTestAnchor()
  // will timeout after 2 mn instead of 2s
  mochaTest.timeout(2 * 60 * 1000)
  // make the test anchor visible
  // NOTE: rendered element might not resize correctly?
  testAnchor.style = "position: relative; width: 400px; height: 400px; margin: 16px 50px; border: 1px dashed grey;"

  const resumeBtn = document.createElement("button")
  resumeBtn.innerText = "Resume test execution"
  resumeBtn.style = "position: absolute; bottom: -16px; left: 0px;"

  // pause until we press space
  return new Promise((resolve, reject) => {
    testAnchor.appendChild(resumeBtn)
    resumeBtn.onclick = () => {
      testAnchor.style = ""
      testAnchor.removeChild(resumeBtn)
      resolve()
    }
  })
}