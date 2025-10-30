"use client"

import { useState, useEffect, Fragment } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Moon, Sun, Copy, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

const isValidPath = (path: string) => {
  if (!path.trim()) return false
  if (path.includes("http://") || path.includes("https://")) return false
  if (path.match(/\.[a-z]{2,}/i)) return false
  return true
}

export default function App() {
  const { toast } = useToast()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isTableExpanded, setIsTableExpanded] = useState(true)
  const [isScriptExpanded, setIsScriptExpanded] = useState(true)
  const [showErrorsFirst, setShowErrorsFirst] = useState(false)
  const [rows, setRows] = useState([
    { from: "", to: "", type: "" },
    { from: "", to: "", type: "" },
    { from: "", to: "", type: "" },
  ])
  const [generatedScript, setGeneratedScript] = useState("")
  const [rowCount, setRowCount] = useState(3)
  const [rowErrors, setRowErrors] = useState<Record<number, string[]>>({})

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const updateRow = (index: number, field: "from" | "to" | "type", value: string) => {
    const newRows = [...rows]
    newRows[index][field] = value
    setRows(newRows)
    const newErrors = { ...rowErrors }
    delete newErrors[index]
    setRowErrors(newErrors)
  }

  const addRow = () => {
    setRows([...rows, { from: "", to: "", type: "" }])
    setRowCount(rowCount + 1)
  }

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      const newRows = rows.filter((_, i) => i !== index)
      setRows(newRows)
      setRowCount(rowCount - 1)
      const newErrors = { ...rowErrors }
      delete newErrors[index]
      setRowErrors(newErrors)
    }
  }

  const handleGlobalPaste = async (e: ClipboardEvent) => {
    let pastedText = ""

    if (e.clipboardData) {
      pastedText =
        e.clipboardData.getData("text/plain") ||
        e.clipboardData.getData("text") ||
        e.clipboardData.getData("Text") ||
        ""
    }

    if (!pastedText && navigator.clipboard) {
      try {
        pastedText = await navigator.clipboard.readText()
      } catch (err) {
        console.error("Clipboard read failed:", err)
      }
    }

    if (!pastedText) {
      console.log("No data in clipboard")
      return
    }

    console.log("Pasted data:", pastedText)

    const lines = pastedText.trim().split("\n")
    const newRows: Array<{ from: string; to: string; type: string }> = []

    lines.forEach((line) => {
      const parts = line.split("\t").map((p) => p.trim())
      if (parts.length >= 3) {
        newRows.push({
          from: parts[0],
          to: parts[1],
          type: parts[2],
        })
      }
    })

    if (newRows.length > 0) {
      setRows(newRows)
      setRowCount(newRows.length)
      setRowErrors({})
      toast({
        title: "Data Imported",
        description: `Successfully imported ${newRows.length} rows from clipboard`,
      })
    }
  }

  useEffect(() => {
    document.addEventListener("paste", handleGlobalPaste)
    return () => document.removeEventListener("paste", handleGlobalPaste)
  }, [])

  const createImportScript = () => {
    setIsProcessing(true)

    setTimeout(() => {
      const errors: Record<number, string[]> = {}
      const fromPaths = new Map<string, number[]>()

      rows.forEach((row, index) => {
        const rowErrorList: string[] = []

        if (!row.from.trim() || !row.to.trim() || !row.type.trim()) {
          rowErrorList.push("Missing required fields")
        }
        if (row.from.trim() && !isValidPath(row.from)) {
          rowErrorList.push("Invalid 'From' path")
        }
        if (row.to.trim() && !isValidPath(row.to)) {
          rowErrorList.push("Invalid 'To' path")
        }

        if (row.from.trim()) {
          if (!fromPaths.has(row.from)) {
            fromPaths.set(row.from, [])
          }
          fromPaths.get(row.from)!.push(index)
        }

        if (rowErrorList.length > 0) {
          errors[index] = rowErrorList
        }
      })

      fromPaths.forEach((indices, path) => {
        if (indices.length > 1) {
          indices.forEach((index) => {
            if (!errors[index]) {
              errors[index] = []
            }
            errors[index].push(`Duplicate 'From' path: ${path}`)
          })
        }
      })

      if (Object.keys(errors).length > 0) {
        setRowErrors(errors)
        setIsProcessing(false)
        toast({
          title: "Validation Failed",
          description: `Found ${Object.keys(errors).length} row(s) with error(s). Please fix the highlighted rows.`,
          variant: "destructive",
        })
        return
      }

      setRowErrors({})

      const escapeCSVValue = (value: string) => {
        if (value.includes(",")) {
          return `"${value}"`
        }
        return value
      }

      const csvHeader = "from,to,type"
      const csvRows = rows
        .map((row) => `${escapeCSVValue(row.from)},${escapeCSVValue(row.to)},${escapeCSVValue(row.type)}`)
        .join("\n")

      const csvData = `${csvHeader}\n${csvRows}`

      const replScript = `
// NOTE: DO NOT EDIT TEXT BELOW

var csv = require("fast-csv");
var async = require("async");

/**
 * This module is maintained by Digital Marketing.
 * Please consult with a Digital Marketing Dev if you have any questions regarding the contents of this file.
 * NOTE: This REPL uses a predefined csv to import. Place csv information in 'newData' variable.
 * 
 * @version 0.1.2
 * @author jpi
 * @date 02/20/2025
 */

/**** BEGIN: REQUIRED! ****/
var myConfig = {
    // set this to the sitename -- generally 'primary
    // but can be any site in the siteConfig.json file
    to_siteName : "primary", // primary
    client: site.client // mung
};

(async function main(){
    var newData = \`${csvData}\`;
    insertRedirects(newData);
})();

function insertRedirects(source){
    var typeMap = {
        "static" : 0,
        "staticNoQuery" : 1,
        "regex" : 2
    };
    
    var api = site.plugins.nav.apis.redirects;
    var count = 0;
    var docs = [];
    var info = { batches : 0, matched : 0, modified : 0, upserted : 0 };
    var start = new Date();
    
    async.series([
        function(cb) {
            // !!!DANGER -- remove({}) WILL DELETE FROM ALL SITES!!!
            // api.remove({}, cb);
            // api.remove({ site_name : myConfig.to_siteName }, cb);
            
            cb(null);
        },
        function(cb) {
            var err = null;
            var line = 1;
            
            var args = { headers : true, quoteColumns : true, trim : true };
            var tmp = csv.fromString(source, args);
            tmp.on("data", function(row) {
                if (err !== null) { return; }
                if (row.from === undefined || row.to === undefined || row.type === undefined) {
                    err = new Error("CSV column names are invalid");
                }
                
                line++;
                
                if (isExactType(row.type)) {
                    row.from = queryAlphaSort(row.from)
                }
                
                var doc = {
                    active : true,
                    site_name : myConfig.to_siteName,
                    type : typeMap[row.type] !== undefined ? typeMap[row.type] : "BAD_TYPE",
                    from : row.from,
                    to : row.to,
                    statuscode : 301
                };
                
                count++;
                
                docs.push(doc);
            }).on("end", function() {
                cb(err);
            });
        },
        function(cb) {
            if (count === 0) {
                return cb(null);
            }
            
            // bulk inserts in batches of 1000
            
            async.whilst(
                function() { return docs.length > 0; },
                function(cb) {
                    var toInsert = docs.splice(0, 1000);
                    
                    var bulk = api.collection.initializeUnorderedBulkOp();
                    
                    toInsert.forEach(function(doc) {
                        // if redirect with site + type + from already exists, we update it, else we insert
                        var filter = { site_name: myConfig.to_siteName, type : doc.type, from : doc.from };
                        bulk.find(filter).upsert().replaceOne(doc);
                    });
                    
                    bulk.execute(function(err, rtn) {
                        if (err && err.errmsg) { return cb(new Error(err.errmsg)); }
                        else if (err) { return cb(err); }
                        
                        info.batches += rtn.ok;
                        info.upserted += rtn.nUpserted;
                        info.matched += rtn.nMatched;
                        info.modified += rtn.nModified;
                        
                        cb(null);
                    });
                },
                cb
            );
        }
    ], function(err) {
        if (err) { return cb(err); }
        
        var end = new Date();
        var taken = (end - start) + "ms";
        
        cb(null, { date : end, taken : taken, message : "Processed "+count+" Redirects" , info : info });
    });
    
    /*
     * Functions
     */
    function isExactType(type) {
        return (type === "static");        
    }
    
    function queryAlphaSort(pathString) {
        var pathObj = pathString.split('?');
        if (pathObj[1]) {
        
            var pairsRaw = pathObj[1].split("&");
            var pairs = [];
            pairsRaw.forEach(function(val, i) {
                var temp = val.split("=");
                
                pairs.push({ key : temp[0], value : temp[1] });
            });
            
            pairs = sortBy(pairs, [["key", "alpha", "asc"], ["value", "alpha", "asc"]]);
            
            var endQuery = pairs.map(function(val, i) {
                return val.key + (val.value === undefined ? "" : "=" + val.value);
            }).join("&");
            
            // delete urlObj.get;
            // urlObj.query = endQuery;
            pathObj[1] = endQuery;
            
            return pathObj[0] +'?' + pathObj[1];
        } else {
            return pathString;
        }
    }
    
    function parse(pathString) {
        if (pathString === undefined) { throw new Error("Parameter 'url' must be a string, not undefined") }
        console.log(pathString);
        var a = pathString;
        var auth = a.auth ? a.auth.split(":") : undefined;
        var r = {
            url : pathString, 
            scheme : undefined,
            auth : auth,
            user : auth !== undefined ? auth[0] : undefined, 
            pass : auth !== undefined ? auth[1] : undefined,
            host : a.hostname !== null ? a.hostname : undefined, 
            port : a.port !== null ? Number(a.port) : undefined, 
            path : a.pathname !== null ? a.pathname : undefined,
            query : a.query !== null ? a.query : undefined, 
            hash : undefined
        };
        r.get = qs.parse(r.query, { depth : 20, arrayLimit : 999 });
        return r;
    }
    
    function sortBy(arr, prop, type, dir) {
        if (arr.length <= 1) { return arr; } // if the array is length 0 or 1 bail early
        
        var isSingle = prop instanceof Array && prop[0] instanceof Array ? false : true;
        var sortOps;
        if (isSingle === true) {
            sortOps = [{ prop : prop, type : type, dir : dir }];
        } else {
            // if multiple the arguments come in on prop so we need to unfold to an object
            sortOps = new Array(prop.length);
            for(var i = 0; i < prop.length; i++) {
                sortOps[i] = { prop : prop[i][0], type : prop[i][1], dir : prop[i][2] };
            }
        }
        
        // our prop should always be an array for lookup purposes
        for(var i = 0; i < sortOps.length; i++) {
            var op = sortOps[i];
            if (op.prop instanceof Array === false) { op.prop = [op.prop]; }
        }
        
        // go through the array and extract the values from it so that way we don't have to do a look-up on each comparison
        var temp = new Array(arr.length);
        for(var i = 0; i < arr.length; i++) {
            var item = arr[i];
            var result = { values : new Array(sortOps.length), index : i, sortOps : sortOps };
            for(var j = 0; j < sortOps.length; j++) {
                var op = sortOps[j];
                
                var value = item;
                for(var k = 0; k < op.prop.length; k++) {
                    value = value[op.prop[k]];
                    if (value === undefined) { break; }
                }
                
                result.values[j] = {
                    raw : value, // original value needed in some comparisons
                    clean : op.type === "alpha" && value !== undefined ? value.toLowerCase() : value
                }
            }
            
            temp[i] = result;
        }
        
        temp.sort(propCompare);
        
        // after the sort is completed, recompose our data array based on the indexes from our mapped array
        var done = new Array(temp.length);
        for(var i = 0; i < temp.length; i++) {
            done[i] = arr[temp[i].index];
        }
        return done;
    }
    
    function propCompare(a, b) {
        for(var i = 0; i < a.sortOps.length; i++) {
            var op = a.sortOps[i];
            var aVal = a.values[i].clean;
            var aValRaw = a.values[i].raw;
            var bVal = b.values[i].clean;
            var bValRaw = b.values[i].raw;
            var comp;
            
            if (aVal === undefined && bVal !== undefined) {
                comp = 1; // in an ascending sort undefined sorts to last, so if aVal is undefined bVal is smaller
            } else if (aVal !== undefined && bVal === undefined) {
                comp = -1; // in an ascending sort undefined sorts to last, so if bVal is undefined aVal is smaller
            } else if (aVal === undefined && bVal === undefined) {
                comp = 0; // both undefined, consider them equal
            } else if (op.type === "alpha") {
                // in alpha compare we want to compare without case first (all lower), and then with case, this way A goes before a and both go before B
                comp = aVal > bVal ? 1 : aVal < bVal ? -1 : aValRaw > bValRaw ? 1 : aValRaw < bValRaw ? -1 : 0;
            } else if (op.type === "numeric") {
                comp = aVal - bVal;
            } else if (op.type === "natural") {
                comp = naturalCompare(aVal, bVal);
            }
            
            if (comp !== 0) {
                comp *= op.dir === "asc" ? 1 : -1; // with a descending query we reverse the polarity
                return comp;
            }
        }
        
        return 0;
    }
}
`
      setGeneratedScript(replScript)
      setIsProcessing(false)

      toast({
        title: "REPL Script Generated",
        description: `Import script with ${rows.length} entries created successfully!`,
      })
    }, 0)
  }

  const copyToClipboard = async () => {
    if (!generatedScript) {
      toast({
        title: "No REPL Script yet",
        description: "Please generate a script first",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(generatedScript)
      toast({
        title: "Copied",
        description: "REPL Script copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const clearTable = () => {
    if (confirm("Are you sure you want to clear all data?")) {
      setRows([{ from: "", to: "", type: "" }])
      setGeneratedScript("")
      setRowCount(1)
      setRowErrors({})
      toast({
        title: "Table Cleared",
        description: "All data has been cleared",
      })
    }
  }

  const getDisplayRows = () => {
    if (!showErrorsFirst) {
      return rows.map((row, index) => ({ row, index }))
    }

    const rowsWithIndex = rows.map((row, index) => ({ row, index }))
    return rowsWithIndex.sort((a, b) => {
      const aHasError = rowErrors[a.index] && rowErrors[a.index].length > 0
      const bHasError = rowErrors[b.index] && rowErrors[b.index].length > 0
      if (aHasError && !bHasError) return -1
      if (!aHasError && bHasError) return 1
      return 0
    })
  }

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark" : ""}`}>
      <div className="bg-background text-foreground">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h1 className="mx-auto text-2xl font-bold">Bulk Sitelink Redirects REPL Generator</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button onClick={clearTable} variant="destructive">
              <Trash2 size={16} className="mr-2" />
              Clear Table
            </Button>

            <Button onClick={createImportScript} disabled={isProcessing} className="bg-primary">
              Create Import
            </Button>

            <Button onClick={copyToClipboard} variant="outline">
              <Copy size={16} className="mr-2" />
              Copy Text
            </Button>
          
            <Button
              onClick={() => setShowErrorsFirst(!showErrorsFirst)}
              variant={showErrorsFirst ? "default" : "outline"}
              className={showErrorsFirst ? "bg-amber-600 hover:bg-amber-700" : ""}
            >
              {showErrorsFirst ? "Showing Errors First" : "Show Errors First"}
            </Button>
          </div>

          {/* Generated REPL Display */}
          {generatedScript && (
            <Card className="p-6 border border-border mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-foreground">Generated REPL Script</h2>
                <button
                  onClick={() => setIsScriptExpanded(!isScriptExpanded)}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  aria-label="Toggle script section"
                >
                  {isScriptExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              {isScriptExpanded && (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono text-foreground">
                  {generatedScript}
                </pre>
              )}
            </Card>
          )}

          {/* Table Card */}
          <Card className="p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Total Rows: <span className="font-semibold text-foreground">{rowCount}</span>
              </div>
              <button
                onClick={() => setIsTableExpanded(!isTableExpanded)}
                className="p-1 hover:bg-accent rounded transition-colors"
                aria-label="Toggle table section"
              >
                {isTableExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {isTableExpanded && (
              <Fragment>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 font-semibold text-foreground">From</th>
                        <th className="text-left p-3 font-semibold text-foreground">To</th>
                        <th className="text-left p-3 font-semibold text-foreground">Type</th>
                        <th className="text-left p-3 font-semibold text-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getDisplayRows().map(({ row, index }) => {
                        const hasError = rowErrors[index] && rowErrors[index].length > 0
                        return (
                          <Fragment key={index}>
                            <tr
                              key={index}
                              className={`border-b border-border hover:bg-accent/50 ${hasError ? "bg-red-500/10 border-red-500/50" : ""}`}
                            >
                              <td className="p-3">
                                <Input
                                  value={row.from}
                                  onChange={(e) => updateRow(index, "from", e.target.value)}
                                  placeholder="/old-path"
                                  className={`bg-background border-border ${hasError ? "border-red-500 border-2" : ""}`}
                                />
                              </td>
                              <td className="p-3">
                                <Input
                                  value={row.to}
                                  onChange={(e) => updateRow(index, "to", e.target.value)}
                                  placeholder="/new-path"
                                  className={`bg-background border-border ${hasError ? "border-red-500 border-2" : ""}`}
                                />
                              </td>
                              <td className="p-3">
                                <Input
                                  value={row.type}
                                  onChange={(e) => updateRow(index, "type", e.target.value)}
                                  placeholder="type"
                                  className={`bg-background border-border ${hasError ? "border-red-500 border-2" : ""}`}
                                />
                              </td>
                              <td className="p-3">
                                <Button
                                  onClick={() => removeRow(index)}
                                  variant="ghost"
                                  size="sm"
                                  disabled={rows.length === 1}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                            {hasError && (
                              <tr className="bg-red-500/5">
                                <td colSpan={4} className="p-3">
                                  <div className="flex items-start gap-2 text-red-600 text-sm">
                                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                    <div>
                                      {rowErrors[index].map((error, i) => (
                                        <div key={i}>{error}</div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <Button onClick={addRow} variant="outline" className="mt-4 w-full bg-transparent">
                  + Add Row
                </Button>
              </Fragment>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}