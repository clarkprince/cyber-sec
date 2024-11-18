import { html } from "lit";
import TWElement from "./tw";
// TODO(rdo) move this to Go and httpforms
class Schedule extends TWElement {
    get notebookSelect() {
        return this._slottedChildren("select")[0];
    }
    async submit(e) {
        console.log("submit event sent");
        e.preventDefault();
        e.stopPropagation();
        const orig = e.target;
        let sub = new FormData();
        sub.append("notebook", this.notebookSelect.value);
        let sched = orig.elements["scheduleValue"]?.value;
        const reps = orig.elements["repetitions"].value
            ? "R" + orig.elements["repetitions"].value + "/"
            : "";
        sched =
            reps +
                orig.elements["start-date"].value +
                "T" +
                orig.elements["start-hour"].value +
                "/P" +
                orig.elements["frequency"].value +
                orig.elements["interval"].value;
        sub.append("schedule", sched);
        const rsp = await fetch("/schedule/add", {
            method: "POST",
            body: sub,
        }).then((r) => r.json());
        if (rsp.Result == "ok") {
            window.location.reload();
        }
        else {
            console.error(rsp.Message);
        }
    }
    render() {
        return html `
      <form
        class="px-8 py-6 2xl:w-[610px] flex flex-col dark:bg-neutral-800"
        @submit="${this.submit.bind(this)}"
      >
        <h3 class="mb-6 text-xl">🤖 Schedule a control</h3>

        <div class="mb-3 leading-10">
          <span class="mb-3.5 mr-2.5">For playbook</span>
          <slot></slot>
        </div>

        <div class="mb-3 leading-10">
          <span class="mb-3.5 mr-2.5">That runs every</span>

          <input
            type="number"
            name="frequency"
            placeholder="3"
            min="1"
            required
            aria-label="frequency of repetitions"
            class="mb-3.5 mr-2.5 px-3 w-16 appearance-none bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-0"
          />

          <select
            name="interval"
            style="background-position: calc(100% - 12px);"
            aria-label="interval of repetitions"
            class="mb-3.5 mr-2.5 pl-4 pr-12 max-w-[200px] appearance-none bg-gray-50 dark:bg-neutral-700 bg-no-repeat bg-auto bg-light-down-arrow dark:bg-dark-down-arrow border border-gray-300 dark:border-0"
          >
            <option value="D" selected>day(s)</option>
            <option value="W">week(s)</option>
            <option value="M">month(s)</option>
            <option value="Y">year(s)</option>
          </select>
        </div>

        <div class="mb-3 leading-10">
          <span class="mb-3.5 mr-2.5">Starts on</span>
          <input
            type="date"
            name="start-date"
            aria-label="start date"
            class="mb-3.5 px-3 bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-0"
          />
          <span class="mx-2.5">at</span>
          <input
            type="number"
            name="start-hour"
            aria-label="hour of day"
            class="mb-3.5 mr-2.5 px-3 w-16 appearance-none bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-0"
            min="0"
            max="23"
          />
          <span class="mb-3.5 mr-2.5">hour</span>
        </div>

        <div class="mb-3 leading-10">
          <span class="mb-3.5 mr-2.5">Ends after</span>
          <input
            type="number"
            name="repetitions"
            placeholder="10"
            min="1"
            aria-label="number of repetitions"
            class="mb-3.5 mr-2.5 px-3 w-16 appearance-none bg-gray-50 dark:bg-neutral-700 border border-gray-300 dark:border-0"
          />

          <span class="mb-3.5 mr-2.5">checks.</span>
        </div>

        <button
          type="submit"
          title="Schedule"
          class="py-2.5 px-4 self-end flex items-center bg-yellow-400 rounded-sm text-neutral-900 text-sm font-medium"
        >
          <span>Schedule</span>
        </button>
      </form>
    `;
    }
}
customElements.define("wt-schedule", Schedule);
//# sourceMappingURL=schedule.js.map