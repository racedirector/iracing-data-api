import _ from "lodash";
import { logger as parentLogger } from "./logger";

const logger = parentLogger.child({
  module: "PaceOrderManager",
});

export class PaceOrderManager {
  private previousPaceRows: number[] = [];
  private previousPaceLines: number[] = [];

  private get previousPaceOrder() {
    return _.zip(this.previousPaceLines, this.previousPaceRows);
  }

  process(
    paceLines: number[],
    paceRows: number[],
    sessionTime: string,
    sessionTimeOfDay: string,
    length: number = paceLines.length
  ) {
    const didPaceRowsChange = !_.isEqual(this.previousPaceRows, paceRows);
    const didPaceLinesChange = !_.isEqual(this.previousPaceLines, paceLines);

    if (didPaceRowsChange || didPaceLinesChange) {
      const previousPaceOrder = this.previousPaceOrder;
      const currentPaceOrder = _.zip(paceLines, paceRows);

      if (!previousPaceOrder.length) {
        this.previousPaceRows = paceRows;
        this.previousPaceLines = paceLines;
        return;
      }

      for (let i = 0; i < length; i++) {
        const [previousLine, previousRow] = previousPaceOrder[i];
        const [currentLine, currentRow] = currentPaceOrder[i];

        const didOrderChange =
          previousLine !== currentLine || previousRow !== currentRow;

        if (didOrderChange) {
          logger.info(
            {
              sessionTime,
              sessionTimeOfDay,
              paceLine: currentLine,
              paceRow: currentRow,
              carIndex: i,
              currentPaceOrder,
            },
            `Car index ${i} pace order did change.`
          );
        }
      }

      if (didPaceRowsChange) {
        this.previousPaceRows = paceRows;
      }

      if (didPaceLinesChange) {
        this.previousPaceLines = paceLines;
      }
    }
  }
}

export default PaceOrderManager;
