function main(workbook: ExcelScript.Workbook) {
    const bulkImportSheet = workbook.getWorksheet("Bulk Import");
    const replSheet = workbook.getWorksheet("repl-data-do-not-edit");
    const overflowSheet = workbook.getWorksheet("overflow-copy-tab");

    let inputRow = 3;
    let totalActive = 0;

    // Count active rows
    while (true) {
        const col1 = bulkImportSheet.getCell(inputRow - 1, 0).getValue();
        const col2 = bulkImportSheet.getCell(inputRow - 1, 1).getValue();
        const col3 = bulkImportSheet.getCell(inputRow - 1, 2).getValue();

        if (!col1 || !col2 || !col3) break;

        totalActive++;
        inputRow++;
    }

    let fullOverflowRange = overflowSheet.getRange("A1:Z100000");
    fullOverflowRange.clear(ExcelScript.ClearApplyTo.all);

    if (totalActive === 0) {
        console.log("No active rows. Please enter redirect information.");
        bulkImportSheet.getCell(0, 2).setValue("No active rows. Please enter redirect information.");
        return;
    }

    const header = replSheet.getCell(3, 0).getValue() as string;
    const footer = replSheet.getCell(5, 0).getValue() as string;

    var overflowIndex = 0;
    for (let i = 0; i < 23; i++) {
        overflowSheet.getCell(overflowIndex, 0).copyFrom(replSheet.getCell(i, 3), ExcelScript.RangeCopyType.values);
        overflowIndex++;
    }

    let result = "from,to,type";
    for (let i = 3; i < 3 + totalActive; i++) {
        let row = "";
        for (let j = 0; j < 3; j++) {
            row += (bulkImportSheet.getCell(i - 1, j).getValue()) + ',';
        }
        result += `\n${row.slice(0, -1)}`;
    }

    let resultArray = result.split('\n');
    for (let i = 1; i < resultArray.length; i++) {
        overflowSheet.getCell(overflowIndex, 0).setValue(resultArray[i]);
        overflowIndex++;
    }

    for (let i = 0; i < 250; i++) {
        overflowSheet.getCell(overflowIndex, 0).copyFrom(replSheet.getCell(i, 4), ExcelScript.RangeCopyType.values);
        overflowIndex++;
    }


    const importRepl = `${header}${result}${footer}`;

    replSheet.getCell(8, 0).setValue(importRepl);

    bulkImportSheet.getCell(0, 2).copyFrom(replSheet.getCell(8, 0), ExcelScript.RangeCopyType.values);
}