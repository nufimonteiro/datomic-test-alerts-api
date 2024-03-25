(ns injetorLogs
  (:use [amazonica.aws.cloudwatchevents]))

(put-targets
  :rule "nightly-backup"
  :targets [{:id    "backup-lambda"
             :arn   "arn:aws:lambda:us-east-1:123456789012:function:backup-lambda"
             :input (json/write-str {"whatever" "arguments"})}])